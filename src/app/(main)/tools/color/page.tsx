import { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "../shell";
import { ToolProse } from "../ui";
import { ColorConverter } from "./components";
import { colorPairs, colorSpaces } from "./spaces";

export const metadata: Metadata = {
  title: "Free Online Color Converter - Steven Frady",
  description:
    "Convert colors between HEX, RGB, HSL, and OKLCH online for free — alpha and transparency included. Instant, private, no signup.",
  keywords:
    "color converter, hex to rgb, rgba to hex, rgb to hsl, hex to oklch, css color converter, online color conversion",
  alternates: { canonical: "https://www.stevenfrady.com/tools/color" },
};

export default async function () {
  return (
    <ToolShell>
      <ColorConverter />

      <ToolProse>
        <h2>About the four formats</h2>
        {colorSpaces.map((s) => (
          <p key={s.slug}>{s.about}</p>
        ))}
        <p>
          Conversion runs entirely in your browser — nothing is uploaded — and
          alpha carries through every format, from 8-digit hex to{" "}
          <code>oklch(… / 0.5)</code>.
        </p>
      </ToolProse>

      <div className="flex flex-col gap-3 mt-12">
        <div className="text-sm opacity-70">Popular conversions</div>
        <div className="flex flex-row flex-wrap gap-2">
          {colorPairs.map((p) => (
            <Link
              key={p.slug}
              href={`/tools/color/${p.slug}`}
              className="text-xs bg-foreground/5 hover:bg-foreground/15 border rounded-full px-3 py-1.5 transition"
            >
              {p.from.label} → {p.to.label}
            </Link>
          ))}
        </div>
      </div>
    </ToolShell>
  );
}
