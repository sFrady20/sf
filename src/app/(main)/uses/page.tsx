import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Uses - Steven Frady",
  description:
    "The languages, frameworks, tools, and studio setup I work with.",
};

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

function SectionTitle(props: { children: React.ReactNode }) {
  return (
    <h2 className="font-title text-xs uppercase tracking-widest opacity-50 pt-6">
      {props.children}
    </h2>
  );
}

export default function UsesPage() {
  return (
    <div className="container py-[120px] md:pt-[180px]">
      <div className="mx-auto max-w-[680px] flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="font-title text-xs uppercase tracking-widest opacity-50">
            tools + stack
          </div>
          <h1 className="text-2xl md:text-3xl font-title">Uses</h1>
          <p className="text-sm md:text-md leading-relaxed opacity-80 text-balance">
            The languages, frameworks, and tools I work with day to day, on
            this site and off.
          </p>
        </div>

        <div className="flex flex-col">
          <SectionTitle>Stack</SectionTitle>
          <Row label="Languages">
            TypeScript for most things, C# for game engines, GLSL for shaders
          </Row>
          <Row label="Web">React, Next.js, Tailwind</Row>
          <Row label="3D + shaders">three.js, react-three-fiber, raw GLSL</Row>
          <Row label="Desktop + mobile">
            Electron for desktop, React Native for mobile
          </Row>
          <Row label="Installations">
            Unity, usually paired with custom sensor hardware
          </Row>

          <SectionTitle>Tools</SectionTitle>
          <Row label="Editor">VS Code</Row>
          <Row label="Runtime">bun, as package manager and runtime</Row>
          <Row label="AI">Claude Code</Row>
          <Row label="Components">
            <Link
              href="https://github.com/sFrady20/earthling-ui"
              target="_blank"
              className="underline"
            >
              earthling-ui
            </Link>
            , my own component library, shared across projects
          </Row>

          <SectionTitle>Studio</SectionTitle>
          <Row label="Machine">Windows desktop</Row>
          <Row label="Lighting">
            LIFX bulbs controlled by{" "}
            <Link
              href="https://github.com/sFrady20/labctrl"
              target="_blank"
              className="underline"
            >
              LabCTRL
            </Link>
            , an app I built to sync the room's lighting with music
          </Row>
          <Row label="Music">
            my own mixes, at{" "}
            <Link
              href="https://www.slowjam.dj/"
              target="_blank"
              className="underline"
            >
              slowjam.dj
            </Link>
          </Row>
        </div>
      </div>
    </div>
  );
}
