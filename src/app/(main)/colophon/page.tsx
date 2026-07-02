import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Colophon - Steven Frady",
  description:
    "How this site is built — the framework, the type, and the systems behind it.",
};

//label/value rows, same rhythm as the experience list on home
function Row(props: { label: string; children: React.ReactNode }) {
  const { label, children } = props;
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-5 items-baseline py-4 border-b border-foreground/10 last:border-b-0">
      <div className="w-[140px] shrink-0 font-title text-sm opacity-70">
        {label}
      </div>
      <div className="text-sm leading-relaxed opacity-90">{children}</div>
    </div>
  );
}

export default function ColophonPage() {
  return (
    <div className="container py-[120px] md:pt-[180px]">
      <div className="mx-auto max-w-[680px] flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="font-title text-xs uppercase tracking-widest opacity-50">
            how this site is built
          </div>
          <h1 className="text-2xl md:text-3xl font-title">Colophon</h1>
          <p className="text-sm md:text-md leading-relaxed opacity-80 text-balance">
            Everything on this site is custom — the components, the shaders,
            the theme system, and the music. This page lists what it's built
            with.
          </p>
        </div>

        <div className="flex flex-col">
          <Row label="Framework">
            Next.js (App Router), React, and TypeScript
          </Row>
          <Row label="Styling">
            Tailwind CSS v4, configured entirely in CSS
          </Row>
          <Row label="Components">
            <Link
              href="https://github.com/sFrady20/earthling-ui"
              target="_blank"
              className="underline"
            >
              earthling-ui
            </Link>
            , my own component library, used throughout the site
          </Row>
          <Row label="Motion">
            motion for JS-driven animation, scroll-driven CSS animations for
            section reveals
          </Row>
          <Row label="Shaders">
            three.js and react-three-fiber, with GLSL composed through glslify
          </Row>
          <Row label="Type">
            Zighead for display, Optiker-K for titles, Lato for body text
          </Row>
          <Row label="Audio">Howler, playing original tracks</Row>
          <Row label="Content">MDX</Row>
          <Row label="Package manager">bun</Row>
          <Row label="Theming">
            a cookie-based theme system with named themes, a custom theme
            editor, and holiday themes that activate automatically on their
            dates
          </Row>
          <Row label="Casting">
            shader pages can be cast to a TV through a custom Chromecast
            receiver
          </Row>
        </div>
      </div>
    </div>
  );
}
