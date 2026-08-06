import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { ColorConverter } from "../components";
import { colorPairs, getColorPair } from "../spaces";

export const dynamicParams = false;

export async function generateStaticParams() {
  return colorPairs.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair: slug } = await props.params;
  const pair = getColorPair(slug);
  if (!pair) return {};

  return {
    title: `${pair.from.label} to ${pair.to.label} Converter - Steven Frady`,
    description: `Free online ${pair.from.label} to ${pair.to.label} color converter. Paste a ${pair.from.label} color and get the ${pair.to.label} value instantly — everything runs in your browser.`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.slug} to ${pair.to.slug} converter, ${pair.from.slug}a to ${pair.to.slug}, color converter, alpha, transparency`,
    alternates: {
      canonical: `https://www.stevenfrady.com/tools/color/${slug}`,
    },
  };
}

export default async function (props: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await props.params;
  const pair = getColorPair(slug);
  if (!pair) notFound();

  return (
    <ToolShell>
      {/* the converter renders its own prose, so it follows the dropdowns.
          the pair links ride in as a prop so the article lands under them */}
      <ColorConverter
        initialFrom={pair.from.slug}
        initialTo={pair.to.slug}
        related={
          <div className="flex flex-col gap-3 mt-4">
            <div className="text-sm opacity-70">Other conversions</div>
            <div className="flex flex-row flex-wrap gap-2">
              {colorPairs
                .filter((p) => p.slug !== slug)
                .map((p) => (
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
        }
      />
    </ToolShell>
  );
}
