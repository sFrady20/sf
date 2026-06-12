"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  CanvasTexture,
  DataTexture,
  SRGBColorSpace,
  Texture,
  Vector3,
} from "three";
import { ShaderCanvas } from "@/components/shader";
import frag from "@/shaders/transitions/dissolve.frag.glsl";

//html-in-canvas is chromium-behind-a-flag for now, hence the sniff
function getDrawElement(ctx: CanvasRenderingContext2D) {
  const anyCtx = ctx as any;
  return anyCtx.drawElementImage?.bind(ctx) ?? anyCtx.drawElement?.bind(ctx);
}

const blank = () => {
  const t = new DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
};

//snapshots the live page into a texture via <canvas layoutsubtree>
async function capturePage(): Promise<Texture | null> {
  try {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("layoutsubtree", "");
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("data-transition-ignore", "");
    canvas.width = w;
    canvas.height = h;
    canvas.style.cssText = `position:fixed;inset:0;width:${w}px;height:${h}px;opacity:0;pointer-events:none;z-index:-1;`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const drawElement = getDrawElement(ctx);
    if (!drawElement) return null;

    //clone the page into the canvas so it can be drawn
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `width:${w}px;height:${h}px;overflow:hidden;`;
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone
      .querySelectorAll("[data-transition-ignore]")
      .forEach((el) => el.remove());
    clone.querySelectorAll("script").forEach((el) => el.remove());
    wrapper.appendChild(clone);
    canvas.appendChild(wrapper);
    document.body.appendChild(canvas);

    //let layout settle before painting
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    wrapper.scrollTop = window.scrollY;
    wrapper.scrollLeft = window.scrollX;

    let texture: Texture | null = null;
    try {
      drawElement(wrapper, 0, 0);
      texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
    } finally {
      canvas.remove();
    }
    return texture;
  } catch {
    return null;
  }
}

//theme foreground -> wipe tint. background would be invisible against itself
function getTint() {
  const fg = getComputedStyle(document.body).color;
  const m = fg.match(/[\d.]+/g);
  if (!m) return new Vector3(1, 1, 1);
  return new Vector3(+m[0] / 255, +m[1] / 255, +m[2] / 255);
}

type Phase =
  | { name: "idle" }
  | { name: "covering"; href: string }
  | { name: "waiting" }
  | { name: "revealing" };

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [overlayKey, setOverlayKey] = useState(0);

  const uniforms = useRef({
    progress: { value: 0 },
    hasSnapshot: { value: 0 },
    tint: { value: new Vector3(0, 0, 0) },
    page: { value: blank() as Texture },
  });

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  //animates progress between two values, then fires done
  const animate = (from: number, to: number, ms: number, done?: () => void) => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      uniforms.current.progress.value = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(tick);
      else done?.();
    };
    requestAnimationFrame(tick);
  };

  const finish = () => {
    const u = uniforms.current;
    const hold = u.hasSnapshot.value > 0.5 ? 0 : 0.5;
    animate(hold, 1, u.hasSnapshot.value > 0.5 ? 1000 : 520, () => {
      if (u.page.value instanceof CanvasTexture) u.page.value.dispose();
      u.page.value = blank();
      setPhase({ name: "idle" });
    });
  };

  //navigation done -> reveal the new page
  useEffect(() => {
    if (phaseRef.current.name !== "waiting") return;
    setPhase({ name: "revealing" });
    requestAnimationFrame(() => requestAnimationFrame(finish));
  }, [pathname]);

  const begin = async (href: string) => {
    const u = uniforms.current;
    u.tint.value = getTint();
    u.progress.value = 0;

    const snapshot = await capturePage();

    if (snapshot) {
      //snapshot covers the page seamlessly, melt once the next page is in
      u.page.value = snapshot;
      u.hasSnapshot.value = 1;
      setOverlayKey((k) => k + 1);
      setPhase({ name: "waiting" });
      router.push(href);
    } else {
      //no html-in-canvas: sweep a curtain over, swap, sweep off
      u.hasSnapshot.value = 0;
      setOverlayKey((k) => k + 1);
      setPhase({ name: "covering", href });
      animate(0, 0.5, 520, () => {
        //hold a beat fully covered so the swap never flashes
        setTimeout(() => {
          setPhase({ name: "waiting" });
          router.push(href);
        }, 80);
      });
    }
  };

  //safety net - never strand the overlay
  useEffect(() => {
    if (phase.name === "idle") return;
    const t = setTimeout(() => {
      uniforms.current.progress.value = 1;
      setPhase({ name: "idle" });
    }, 8000);
    return () => clearTimeout(t);
  }, [phase]);

  //intercept internal link clicks
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      if (phaseRef.current.name !== "idle") return;
      const a = (e.target as Element).closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault();
      begin(url.pathname + url.search + url.hash);
    };
    //capture phase so this wins over next/link's own click handler
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (phase.name === "idle") return null;

  return (
    <div
      data-transition-ignore
      aria-hidden
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      <ShaderCanvas
        key={overlayKey}
        frag={frag}
        transparent
        uniforms={uniforms.current}
        className="w-full h-full bg-transparent"
      />
    </div>
  );
}
