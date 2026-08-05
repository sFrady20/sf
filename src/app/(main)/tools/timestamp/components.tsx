"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { cn } from "@/utils/cn";
import { swapUrl } from "@/utils/swap-url";
import { useEffect, useRef, useState } from "react";
import { Panel, PanelHeader, ToolHeader } from "../ui";
import { parseTime, relativeTime, toIsoUtc } from "./time";

const localFmt = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short",
});

export function TimestampTool() {
  const [input, setInput] = useState("");
  const dirty = useRef(false);

  //live clock, also the implicit input while the field is empty
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  //land with ?t= -> hydrate
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("t");
    if (param) setInput(param);
  }, []);

  //shareable address bar for explicit inputs
  useEffect(() => {
    if (!dirty.current) return;
    const url =
      input.trim() !== ""
        ? `/tools/timestamp?t=${encodeURIComponent(input.trim())}`
        : "/tools/timestamp";
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
  }, [input]);

  const explicit = input.trim() !== "";
  const parsed = explicit ? parseTime(input) : null;
  const date = parsed?.ok ? parsed.date : !explicit ? now : null;

  const rows = date
    ? [
        {
          label: "unix seconds",
          value: `${Math.floor(date.getTime() / 1000)}`,
        },
        { label: "unix millis", value: `${date.getTime()}` },
        { label: "iso 8601 utc", value: toIsoUtc(date) },
        { label: "local", value: localFmt.format(date) },
      ]
    : [];

  const sourceLabel = parsed?.ok
    ? {
        seconds: "read as seconds",
        millis: "read as milliseconds",
        micros: "read as microseconds",
        date: "read as a date",
      }[parsed.source]
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title="Unix Timestamp Converter"
        description="Paste an epoch timestamp — seconds, milliseconds, or microseconds — or any date string, and convert both ways. Leave it empty to watch the current time."
      />

      <Panel>
        <PanelHeader label="Timestamp or date" meta={sourceLabel} />
        <div className="p-4">
          <input
            type="text"
            spellCheck={false}
            value={input}
            onChange={(e) => {
              dirty.current = true;
              setInput(e.target.value);
            }}
            placeholder={
              now ? `${Math.floor(now.getTime() / 1000)} — ticking` : ""
            }
            aria-label="Timestamp or date"
            className={cn(
              "h-12 w-full rounded-md border border-foreground/15 bg-foreground/5 px-4 text-lg font-mono outline-none focus-visible:border-foreground/40 transition-colors",
              explicit && parsed && !parsed.ok && "border-bad/60",
            )}
          />
          {explicit && parsed && !parsed.ok && (
            <div className="pt-2 text-xs opacity-60">{parsed.error}</div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          label={explicit ? "Converted" : "Now"}
          meta={date && explicit && now ? relativeTime(date, now) : undefined}
        />
        {rows.length === 0 ? (
          <div className="p-8 text-center text-sm opacity-50">
            Fix the input to see conversions.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-foreground/[0.06]">
            {rows.map((r) => (
              <div
                key={r.label}
                className="group flex flex-row items-baseline gap-3 px-4 py-1.5 hover:bg-foreground/[0.05] transition-colors"
              >
                <div className="text-[11px] opacity-50 w-[12ch] flex-none font-title uppercase tracking-wider">
                  {r.label}
                </div>
                <div className="flex-1 text-sm font-mono tabular-nums select-all py-1.5">
                  {r.value}
                </div>
                <CopyToClipboard
                  material="ghost"
                  size="sm"
                  shape="icon"
                  content={r.value}
                  aria-label={`Copy ${r.label}`}
                  className="opacity-40 group-hover:opacity-100 -mr-2 self-center"
                >
                  <CopyToClipboardIcon />
                </CopyToClipboard>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
