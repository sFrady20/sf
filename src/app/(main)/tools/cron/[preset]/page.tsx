import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { CronTool } from "../components";
import { cronPresets, getCronPreset } from "../cron";

export const dynamicParams = false;

export async function generateStaticParams() {
  return cronPresets.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ preset: string }>;
}): Promise<Metadata> {
  const { preset: slug } = await props.params;
  const preset = getCronPreset(slug);
  if (!preset) return {};

  return {
    title: `Cron Expression for ${preset.label} - Steven Frady`,
    description: `The cron expression for ${preset.label.toLowerCase()} is \`${preset.expression}\`. See it explained field by field with the next run times.`,
    keywords: `cron ${preset.label.toLowerCase()}, cron expression ${preset.label.toLowerCase()}, crontab ${preset.label.toLowerCase()}, ${preset.expression}, cron schedule`,
    alternates: {
      canonical: `https://www.stevenfrady.com/tools/cron/${slug}`,
    },
  };
}

export default async function (props: { params: Promise<{ preset: string }> }) {
  const { preset: slug } = await props.params;
  const preset = getCronPreset(slug);
  if (!preset) notFound();

  return (
    <ToolShell>
      {/* the tool renders its own prose, so it follows the expression.
          the preset links ride in as a prop so the article lands under them */}
      <CronTool
        initialExpression={preset.expression}
        related={
          <div className="flex flex-col gap-3 mt-4">
            <div className="text-sm opacity-70">Other schedules</div>
            <div className="flex flex-row flex-wrap gap-2">
              {cronPresets
                .filter((p) => p.slug !== slug)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`/tools/cron/${p.slug}`}
                    className="text-xs bg-foreground/5 hover:bg-foreground/15 border rounded-full px-3 py-1.5 transition"
                  >
                    {p.label}
                  </Link>
                ))}
            </div>
          </div>
        }
      />
    </ToolShell>
  );
}
