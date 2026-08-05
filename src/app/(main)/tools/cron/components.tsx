"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { cn } from "@/utils/cn";
import { swapUrl } from "@/utils/swap-url";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelHeader, ToolHeader, ToolProse } from "../ui";
import {
  FIELD_DEFS,
  PHRASE_CFGS,
  describeCron,
  fieldPhrase,
  findPresetByExpression,
  nextRuns,
  parseCron,
} from "./cron";

//coarse relative time, enough to orient the next-runs list
const rel = (d: Date, now: Date) => {
  const mins = Math.round((d.getTime() - now.getTime()) / 60000);
  if (mins < 1) return "in under a minute";
  if (mins < 120) return `in ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `in ${hours} hours`;
  return `in ${Math.round(hours / 24)} days`;
};

const absFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

//one component serves /tools/cron and every /tools/cron/[preset] page
export function CronTool(props: { initialExpression?: string }) {
  const [input, setInput] = useState(props.initialExpression ?? "*/5 * * * *");
  const result = parseCron(input);
  const preset = findPresetByExpression(input);

  //no url writes until the user actually edits
  const dirty = useRef(false);

  //land with ?e= -> hydrate (underscores stand in for spaces)
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("e");
    if (param) setInput(param.replace(/_/g, " "));
  }, []);

  //the address bar mirrors the expression - preset expressions get their
  //canonical page url, everything else rides in ?e=
  useEffect(() => {
    if (!dirty.current) return;
    const url = preset
      ? `/tools/cron/${preset.slug}`
      : result.ok
        ? `/tools/cron?e=${input.trim().split(/\s+/).join("_")}`
        : "/tools/cron";
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  //run times depend on the wall clock, so they only exist client-side
  const [runs, setRuns] = useState<{ abs: string; rel: string }[]>([]);
  useEffect(() => {
    if (!result.ok) {
      setRuns([]);
      return;
    }
    const now = new Date();
    setRuns(
      nextRuns(result.cron, 5, now).map((d) => ({
        abs: absFmt.format(d),
        rel: rel(d, now),
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const description = result.ok ? describeCron(result.cron) : null;

  //preset pages get an explanation of whatever's in the box right now
  const showProse = Boolean(props.initialExpression);
  const proseFields = result.ok
    ? FIELD_DEFS.map((def, i) => ({
        label: def.label,
        token: result.tokens[i],
        phrase: fieldPhrase(result.cron[def.key], PHRASE_CFGS[def.key]),
      }))
    : [];

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title={preset ? `Cron: ${preset.label}` : "Cron Expression Explainer"}
        description="Type a cron schedule and get plain English, a field-by-field breakdown, and the next run times — all in your browser."
      />

      <Panel>
        <PanelHeader label="Expression">
          {result.ok && (
            <CopyToClipboard
              material="ghost"
              size="sm"
              content={input.trim()}
              className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
            >
              <CopyToClipboardIcon />
              Copy
            </CopyToClipboard>
          )}
        </PanelHeader>
        <div className="flex flex-col gap-3 p-4">
          <input
            type="text"
            spellCheck={false}
            value={input}
            onChange={(e) => {
              dirty.current = true;
              setInput(e.target.value);
            }}
            placeholder="*/5 * * * *"
            aria-label="Cron expression"
            className={cn(
              "h-12 rounded-md border border-foreground/15 bg-foreground/5 px-4 text-lg font-mono tracking-widest outline-none focus-visible:border-foreground/40 transition-colors",
              !result.ok && "border-bad/60",
            )}
          />
          {result.ok ? (
            <div className="font-title text-xl md:text-2xl text-balance">
              &ldquo;{description}&rdquo;
            </div>
          ) : (
            <div className="text-sm opacity-60">
              Can&apos;t read that — {result.error}
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader label="Fields" />
        <div className="flex flex-col divide-y divide-foreground/[0.06]">
          {result.ok
            ? FIELD_DEFS.map((def, i) => (
                <div
                  key={def.key}
                  className="flex flex-row items-baseline gap-3 px-4 py-2"
                >
                  <div className="text-[11px] opacity-50 w-[12ch] flex-none font-title uppercase tracking-wider">
                    {def.label}
                  </div>
                  <div className="font-mono text-sm w-[10ch] flex-none">
                    {result.tokens[i]}
                  </div>
                  <div className="text-sm opacity-80">
                    {fieldPhrase(result.cron[def.key], PHRASE_CFGS[def.key])}
                  </div>
                </div>
              ))
            : FIELD_DEFS.map((def) => (
                <div
                  key={def.key}
                  className="flex flex-row items-baseline gap-3 px-4 py-2 opacity-40"
                >
                  <div className="text-[11px] w-[12ch] flex-none font-title uppercase tracking-wider">
                    {def.label}
                  </div>
                  <div className="font-mono text-sm">—</div>
                </div>
              ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader label="Next runs" meta={runs.length ? "local time" : ""} />
        {runs.length === 0 ? (
          <div className="p-8 text-center text-sm opacity-50">
            {result.ok
              ? "No upcoming runs within 5 years."
              : "Fix the expression to see upcoming runs."}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-foreground/[0.06]">
            {runs.map((r, i) => (
              <div
                key={i}
                className="flex flex-row items-baseline gap-3 px-4 py-2"
              >
                <div className="text-[11px] opacity-30 tabular-nums w-[2ch] text-right flex-none">
                  {i + 1}
                </div>
                <div className="font-mono text-sm tabular-nums">{r.abs}</div>
                <div className="flex-1" />
                <div className="text-xs opacity-50">{r.rel}</div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {showProse && result.ok && (
        <ToolProse className="mt-4">
          <h2>
            {preset
              ? `The cron expression for ${preset.label.toLowerCase()}`
              : "What this expression means"}
          </h2>
          <p>
            {preset
              ? `To run a job ${preset.label.toLowerCase()}, use `
              : "The expression "}
            <code>{input.trim()}</code>. Read aloud it means: {description}.
          </p>
          <p>
            Field by field:{" "}
            {proseFields.map((f, i) => (
              <span key={f.label}>
                {f.label} <code>{f.token}</code> — {f.phrase}
                {i < proseFields.length - 1 ? "; " : "."}
              </span>
            ))}
          </p>
          <p>
            Drop the expression into a crontab, a CI schedule, or anything else
            that speaks standard five-field cron syntax. The times above are in
            your local timezone — most cron daemons run in the server&apos;s
            timezone, so mind the difference when it matters.
          </p>
        </ToolProse>
      )}
    </div>
  );
}
