import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { BaseConverter } from "../components";
import { basePairs, getBasePair } from "../bases";

export const dynamicParams = false;

export async function generateStaticParams() {
  return basePairs.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair: slug } = await props.params;
  const pair = getBasePair(slug);
  if (!pair) return {};

  return {
    title: `${pair.from.label} to ${pair.to.label} Converter - Steven Frady`,
    description: `Free online ${pair.from.label.toLowerCase()} to ${pair.to.label.toLowerCase()} converter. Paste a number and get the conversion instantly — any size, right in your browser.`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.slug} to ${pair.to.slug} converter, number base converter`,
    alternates: {
      canonical: `https://www.stevenfrady.com/tools/base/${slug}`,
    },
  };
}

export default async function (props: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await props.params;
  const pair = getBasePair(slug);
  if (!pair) notFound();

  return (
    <ToolShell>
      {/* the converter renders its own prose, so it follows the dropdowns */}
      <BaseConverter initialFrom={pair.from.slug} initialTo={pair.to.slug} />

      {/* internal links keep every pair page one hop away */}
      <div className="flex flex-col gap-3 mt-12">
        <div className="text-sm opacity-70">Other conversions</div>
        <div className="flex flex-row flex-wrap gap-2">
          {basePairs
            .filter((p) => p.slug !== slug)
            .map((p) => (
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
    </ToolShell>
  );
}
