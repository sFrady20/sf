import { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "../shell";
import { ImageConverter } from "./components";
import { conversionPairs } from "./formats";

export const metadata: Metadata = {
  title: "Free Online Image Converter - Steven Frady",
  description:
    "Convert images between PNG, JPG, WebP, and AVIF online for free. Fast, private, no signup — files are converted on the fly and never stored.",
  keywords:
    "image converter, convert png, convert jpg, convert webp, convert avif, online image conversion",
  alternates: { canonical: "https://www.stevenfrady.com/tools/convert" },
};

export default async function () {
  return (
    <ToolShell>
      <ImageConverter />

      <div className="flex flex-col gap-3 mt-12">
        <div className="text-sm opacity-70">Popular conversions</div>
        <div className="flex flex-row flex-wrap gap-2">
          {conversionPairs.map((p) => (
            <Link
              key={p.slug}
              href={`/tools/convert/${p.slug}`}
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
