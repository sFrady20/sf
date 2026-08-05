"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTheme } from "@/components/theme-provider";
import { Liquid, supportsHtmlInCanvas } from "@/components/canvasui/Liquid";
import { Blaze } from "@/components/canvasui/Blaze";
import { Clouds } from "@/components/canvasui/Clouds";
import { Glitch } from "@/components/canvasui/Glitch";
import { ForceField } from "@/components/canvasui/ForceField";
import { DecryptReveal } from "@/components/canvasui/DecryptReveal";
import { Droplets } from "@/components/canvasui/Droplets";

//per-theme html-in-canvas effects. content stays live, chrome (header/menu/
//palette) sits outside on higher z so it never gets warped

const emptySubscribe = () => () => {};

//"hsl(265, 90%, 66%)" -> [r,g,b] in 0-1, good enough for a tint
function hslToRgb01(input: string): [number, number, number] {
  const m = input.match(/([\d.]+)[,\s]+([\d.]+)%?[,\s]+([\d.]+)%?/);
  if (!m) return [0.5, 0.5, 0.5];
  const h = +m[1] / 360;
  const s = +m[2] / 100;
  const l = +m[3] / 100;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}

//the provider owns the theme-* class on <html>, we just watch it. covers
//system resolution, holiday windows, and the ?theme-holiday override for free
function useResolvedTheme(): string | null {
  const [theme, setTheme] = useState<string | null>(null);
  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      const cls = Array.from(root.classList).find((c) =>
        c.startsWith("theme-"),
      );
      setTheme(cls ? cls.slice("theme-".length) : null);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export function ThemeEffect(props: { children?: ReactNode }) {
  const { children } = props;
  const { custom } = useTheme();
  const theme = useResolvedTheme();

  //no api, no effect - the site stays exactly as it was
  const supported = useSyncExternalStore(
    emptySubscribe,
    supportsHtmlInCanvas,
    () => false,
  );

  if (!supported || !theme) return <>{children}</>;

  //the wrapper becomes the viewport and content scrolls inside it
  const cls = "h-svh w-full";

  //the capture only includes what's inside the canvas, and body's bg isn't.
  //without an opaque bg here the effect output is transparent everywhere
  //except text, and the unwarped dom shows through from underneath
  const inner = <div className="min-h-full bg-background">{children}</div>;

  switch (theme) {
    //teal energy shield, hex lattice charges near the cursor and
    //clicks set off shockwaves
    case "alien":
      return (
        <ForceField
          className={cls}
          shape="hexagon"
          color={[0.1, 0.62, 0.58]}
          edgeColor={[0.5, 0.95, 0.88]}
          opacity={0.85}
          cellScale={18}
          //no lattice at rest - clicks are the only thing that draw it
          gridOpacity={0}
          flashIntensity={0}
          lineWidth={0.014}
          gridReveal="click"
          gridRevealStrength={1.6}
          hoverRadius={520}
          tint={0.08}
          grain={0.15}
          rippleIntensity={0.12}
          refraction={26}
        >
          {inner}
        </ForceField>
      );

    //gold flame low on the screen, more embers than inferno
    case "gold":
      return (
        <Blaze
          className={cls}
          sparkColor={[1, 0.76, 0.22]}
          smokeColor={[0.85, 0.6, 0.18]}
          height={0.5}
          sparks={0.45}
          sparkDensity={1.3}
          layers={3}
          smoke={0.35}
          glow={1.3}
          distortion={0.4}
          distortionScale={0.55}
          speed={0.85}
        >
          {inner}
        </Blaze>
      );

    //the page is cipher text until the cursor decrypts it
    case "matrix":
      return (
        <DecryptReveal
          className={cls}
          radius={640}
          softness={0.7}
          cell={11}
          color="#3ddc74"
          background="#0c130d"
          colored={0.9}
          scramble={0.12}
          scrambleSpeed={8}
          edgeGlow={2}
          edgeTint={0.8}
          aberration={8}
          passthrough={0.12}
          charset="ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789"
        >
          {inner}
        </DecryptReveal>
      );

    //moonlit clouds creeping across a night sky
    case "night":
      return (
        <Clouds
          className={cls}
          color={[0.2, 0.22, 0.36]}
          opacity={0.4}
          cover={0.05}
          density={2.6}
          speed={0.22}
          scale={0.55}
          shading={0.55}
          shadow={0.22}
          shadowSoftness={1}
          wind={1}
          windRadius={110}
          quality={0.6}
        >
          {inner}
        </Clouds>
      );

    //rain on the window, wipe it with the cursor
    case "rain":
      return (
        <Droplets
          className={cls}
          intensity={0.55}
          speed={0.8}
          scale={0.45}
          refraction={0.25}
          blur={0.15}
          vignette={0.2}
          staticDrops={0.3}
          tint={[0.6, 0.7, 0.85]}
          tintStrength={0.15}
        >
          {inner}
        </Droplets>
      );

    //custom themes get liquid in whatever primary they picked
    case "custom":
      return (
        <Liquid
          className={cls}
          color={hslToRgb01(custom.primary)}
          simResolution={96}
          dyeResolution={256}
          intensity={1.2}
          blend={4}
          distortion={0.35}
          radius={0.4}
          densityDissipation={0.965}
        >
          {inner}
        </Liquid>
      );

    //rosy liquid, softer and rounder than alien
    case "holiday-valentine":
      return (
        <Liquid
          className={cls}
          color={[0.98, 0.42, 0.6]}
          simResolution={96}
          dyeResolution={256}
          intensity={1}
          blend={4}
          distortion={0.3}
          curl={1.5}
          radius={0.45}
          densityDissipation={0.965}
        >
          {inner}
        </Liquid>
      );

    //red sparks in blue smoke, close enough to fireworks
    case "holiday-independence":
      return (
        <Blaze
          className={cls}
          sparkColor={[0.95, 0.3, 0.3]}
          smokeColor={[0.3, 0.4, 0.95]}
          height={0.85}
          sparks={0.7}
          sparkSize={1.3}
          sparkDensity={0.9}
          layers={4}
          smoke={0.2}
          glow={0.8}
          distortion={0.2}
          speed={1.1}
        >
          {inner}
        </Blaze>
      );

    //haunted broadcast, bursts every few seconds
    case "holiday-halloween":
      return (
        <Glitch
          className={cls}
          intensity={0.9}
          interval={7}
          duration={0.35}
          slices={14}
          shift={28}
          rgbShift={4}
          blocks={0.5}
          noise={0.5}
        >
          {inner}
        </Glitch>
      );

    //cold white mist you can part with the cursor
    case "holiday-christmas":
      return (
        <Clouds
          className={cls}
          color={[0.92, 0.96, 1]}
          opacity={0.55}
          cover={0.12}
          density={2.2}
          speed={0.4}
          shading={0.12}
          wind={0.7}
        >
          {inner}
        </Clouds>
      );

    //light/dark/system stay clean
    default:
      return <>{children}</>;
  }
}
