import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { ImageConverter } from "../components";
import { conversionPairs, getPair } from "../formats";

export const dynamicParams = false;

export async function generateStaticParams() {
  return conversionPairs.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair: slug } = await props.params;
  const pair = getPair(slug);
  if (!pair) return {};

  return {
    title: `Convert ${pair.from.label} to ${pair.to.label} Online - Steven Frady`,
    description: `Free online ${pair.from.label} to ${pair.to.label} converter. Fast, private, no signup — files are converted on the fly and never stored.`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.label.toLowerCase()} to ${pair.to.label.toLowerCase()} converter, image converter`,
    alternates: {
      canonical: `https://www.stevenfrady.com/tools/convert/${slug}`,
    },
  };
}

export default async function (props: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await props.params;
  const pair = getPair(slug);
  if (!pair) notFound();

  return (
    <ToolShell>
      <ImageConverter initialFrom={pair.from.slug} initialTo={pair.to.slug} />

      {/* internal links keep every pair page one hop away */}
      <div className="flex flex-col gap-3 mt-12">
        <div className="text-sm opacity-70">Other conversions</div>
        <div className="flex flex-row flex-wrap gap-2">
          {conversionPairs
            .filter((p) => p.slug !== slug)
            .map((p) => (
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
