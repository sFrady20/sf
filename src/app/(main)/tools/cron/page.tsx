import { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "../shell";
import { ToolProse } from "../ui";
import { CronTool } from "./components";
import { cronPresets } from "./cron";

export const metadata: Metadata = {
  title: "Cron Expression Explainer - Steven Frady",
  description:
    "Free online cron expression explainer. Type a cron schedule and get plain English, a field-by-field breakdown, and the next run times.",
  keywords:
    "cron expression, crontab, cron schedule, cron explainer, cron every 5 minutes, cron syntax",
  alternates: { canonical: "https://www.stevenfrady.com/tools/cron" },
};

export default async function () {
  return (
    <ToolShell>
      <CronTool />

      <ToolProse>
        <h2>Cron syntax in thirty seconds</h2>
        <p>
          A cron expression is five fields separated by spaces: minute (0–59),
          hour (0–23), day of month (1–31), month (1–12 or names), and day of
          week (0–7 or names, where both 0 and 7 are Sunday).
        </p>
        <p>
          Each field takes <code>*</code> for every value, a number, a list like{" "}
          <code>1,15</code>, a range like <code>9-17</code>, or a step like{" "}
          <code>*/5</code> — and they combine, so <code>9-17/2</code> means
          every second hour from 9 through 17. Shortcuts like{" "}
          <code>@daily</code> and <code>@hourly</code> work too.
        </p>
        <p>
          One classic surprise: when both day-of-month and day-of-week are
          restricted, standard cron runs the job when <em>either</em> matches,
          not both. This tool implements that rule, so the next-run times you
          see above are what a real cron daemon would do.
        </p>
      </ToolProse>

      <div className="flex flex-col gap-3 mt-12">
        <div className="text-sm opacity-70">Common schedules</div>
        <div className="flex flex-row flex-wrap gap-2">
          {cronPresets.map((p) => (
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
    </ToolShell>
  );
}
