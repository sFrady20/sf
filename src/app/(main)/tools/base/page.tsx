import { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "../shell";
import { ToolProse } from "../ui";
import { BaseConverter } from "./components";
import { basePairs, numberBases } from "./bases";

export const metadata: Metadata = {
  title: "Free Online Number Base Converter - Steven Frady",
  description:
    "Convert numbers between binary, octal, decimal, and hex online for free. Any size, instant, private — everything runs in your browser.",
  keywords:
    "number base converter, binary to decimal, decimal to hex, hex to binary, radix converter, base conversion",
  alternates: { canonical: "https://www.stevenfrady.com/tools/base" },
};

export default async function () {
  return (
    <ToolShell>
      <BaseConverter />

      <div className="flex flex-col gap-3 mt-12">
        <div className="text-sm opacity-70">Popular conversions</div>
        <div className="flex flex-row flex-wrap gap-2">
          {basePairs.map((p) => (
            <Link
              key={p.slug}
              href={`/tools/base/${p.slug}`}
              className="text-xs bg-foreground/5 hover:bg-foreground/15 border rounded-full px-3 py-1.5 transition"
            >
              {p.from.label} → {p.to.label}
            </Link>
          ))}
        </div>
      </div>

      <ToolProse>
        <h2>About the four bases</h2>
        {numberBases.map((b) => (
          <p key={b.slug}>{b.about}</p>
        ))}
        <p>
          Conversion uses BigInt, so numbers of any size — a 256-bit hash, a
          database id — convert without losing precision, entirely in your
          browser.
        </p>
      </ToolProse>
    </ToolShell>
  );
}
