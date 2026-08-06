import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { AudioConverter } from "../components";
import { audioPairs, getAudioPair } from "../formats";

export const dynamicParams = false;

export async function generateStaticParams() {
  return audioPairs.map((p) => ({ pair: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ pair: string }>;
}): Promise<Metadata> {
  const { pair: slug } = await props.params;
  const pair = getAudioPair(slug);
  if (!pair) return {};

  const extract = pair.from.inputOnly;
  return {
    title: extract
      ? `Extract ${pair.to.label} Audio from ${pair.from.label} Online - Steven Frady`
      : `Convert ${pair.from.label} to ${pair.to.label} Online - Steven Frady`,
    description: `Free online ${pair.from.label} to ${pair.to.label} converter. Runs entirely in your browser — fast, private, no signup, files never uploaded.`,
    keywords: `${pair.from.slug} to ${pair.to.slug}, convert ${pair.from.slug} to ${pair.to.slug}, ${pair.from.label.toLowerCase()} to ${pair.to.label.toLowerCase()} converter, audio converter${extract ? ", extract audio from video" : ""}`,
    alternates: {
      canonical: `https://www.stevenfrady.com/tools/audio/${slug}`,
    },
  };
}

export default async function (props: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await props.params;
  const pair = getAudioPair(slug);
  if (!pair) notFound();

  return (
    <ToolShell>
      {/* the converter renders its own prose, so it follows the selects.
          the pair links ride in as a prop so the article lands under them */}
      <AudioConverter
        initialFrom={pair.from.slug}
        initialTo={pair.to.slug}
        related={
          <div className="flex flex-col gap-3 mt-4">
            <div className="text-sm opacity-70">Other conversions</div>
            <div className="flex flex-row flex-wrap gap-2">
              {audioPairs
                .filter((p) => p.slug !== slug)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`/tools/audio/${p.slug}`}
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
