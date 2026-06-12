"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasTexture, DataTexture, Texture, Vector3 } from "three";
import { Shader } from "@/components/shader";
import Frady from "@/app/frady.svg";
import { cn } from "@/utils/cn";
import frag from "@/shaders/wordmark.frag.glsl";

const blank = () => {
  const t = new DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  t.needsUpdate = true;
  return t;
};

//rasterizes the svg with bleed so the warp has room to play
function rasterize(img: HTMLImageElement) {
  const padX = 0.05;
  const padY = 0.16;
  const w = 2048;
  const innerW = w * (1 - padX * 2);
  const innerH = innerW * (img.height / img.width);
  const h = Math.round(innerH / (1 - padY * 2));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, w * padX, h * padY, innerW, innerH);
  return c;
}

export function HeroWordmark(props: { className?: string }) {
  const { className } = props;

  const [ready, setReady] = useState(false);

  const uniforms = useRef({
    wordmark: { value: blank() as Texture },
    texAspect: { value: 4 },
    tint: { value: new Vector3(1, 1, 1) },
  }).current;

  useEffect(() => {
    let disposed = false;
    const img = new Image();
    img.src = "/frady.svg";
    img.onload = () => {
      if (disposed) return;
      const canvas = rasterize(img);
      const tex = new CanvasTexture(canvas);
      uniforms.wordmark.value = tex;
      uniforms.texAspect.value = canvas.width / canvas.height;
      setReady(true);
    };
    return () => {
      disposed = true;
      uniforms.wordmark.value.dispose();
    };
  }, []);

  //tint follows the theme foreground
  useEffect(() => {
    const read = () => {
      const c = getComputedStyle(document.body).color.match(/[\d.]+/g);
      if (c) uniforms.tint.value.set(+c[0] / 255, +c[1] / 255, +c[2] / 255);
    };
    read();
    const observer = new MutationObserver(() => {
      //wait out the theme transition before sampling
      setTimeout(read, 700);
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    //svgr icon mode squares the svg's intrinsic size, so own the aspect here
    <div className={cn("relative w-full aspect-[369/91]", className)}>
      <Frady
        className={cn(
          "absolute inset-0 w-full h-full transition-opacity duration-700",
          ready && "opacity-0"
        )}
      />
      <Shader
        frag={frag}
        transparent
        aria-hidden
        uniforms={uniforms}
        className={cn(
          "absolute inset-x-[-4%] inset-y-[-18%] bg-transparent opacity-0 transition-opacity duration-700",
          ready && "opacity-100"
        )}
      />
    </div>
  );
}
