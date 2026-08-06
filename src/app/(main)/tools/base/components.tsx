"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { cn } from "@/utils/cn";
import { swapUrl } from "@/utils/swap-url";
import { Button } from "earthling-ui/button";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Field,
  Panel,
  PanelHeader,
  Select,
  ToolHeader,
  ToolProse,
} from "../ui";
import {
  detectBase,
  formatInBase,
  getBase,
  numberBases,
  parseInBase,
} from "./bases";

//one component serves /tools/base and every /tools/base/[pair] page
export function BaseConverter(props: {
  initialFrom?: string;
  initialTo?: string;
  //pair link chips from the page, rendered between the tool and the article
  related?: ReactNode;
}) {
  const [fromSlug, setFromSlug] = useState(props.initialFrom ?? "decimal");
  const [toSlug, setToSlug] = useState(props.initialTo ?? "hex");
  const from = getBase(fromSlug) ?? numberBases[2];
  const to = getBase(toSlug) ?? numberBases[3];

  const [input, setInput] = useState(from.sample);
  const value = parseInBase(input, from);

  const dirty = useRef(false);

  const changeFrom = (nextSlug: string) => {
    const next = getBase(nextSlug);
    if (!next) return;
    dirty.current = true;
    const nextTo = nextSlug === toSlug ? fromSlug : toSlug;
    setFromSlug(nextSlug);
    setToSlug(nextTo);
    setInput(value !== null ? formatInBase(value, next) : next.sample);
  };

  const changeTo = (nextSlug: string) => {
    dirty.current = true;
    const nextFrom = nextSlug === fromSlug ? toSlug : fromSlug;
    if (nextFrom !== fromSlug) {
      const next = getBase(nextFrom)!;
      setInput(value !== null ? formatInBase(value, next) : next.sample);
    }
    setFromSlug(nextFrom);
    setToSlug(nextSlug);
  };

  const swap = () => {
    dirty.current = true;
    setFromSlug(toSlug);
    setToSlug(fromSlug);
    setInput(value !== null ? formatInBase(value, to) : to.sample);
  };

  //click a base row to convert from it, previous input becomes the output
  const useBaseAsInput = (slug: string) => {
    const next = getBase(slug);
    if (!next || value === null || slug === fromSlug) return;
    dirty.current = true;
    setToSlug(fromSlug);
    setFromSlug(slug);
    setInput(formatInBase(value, next));
  };

  //typing an 0x/0b/0o prefix switches From automatically
  const onInput = (v: string) => {
    dirty.current = true;
    setInput(v);
    const detected = detectBase(v);
    if (detected && detected !== fromSlug) {
      setToSlug(detected === toSlug ? fromSlug : toSlug);
      setFromSlug(detected);
    }
  };

  //land with ?v= -> hydrate
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("v");
    if (!param) return;
    const parsed = parseInBase(param, from);
    if (parsed !== null) setInput(formatInBase(parsed, from));
    else onInput(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //shareable address bar, debounced native replaceState
  useEffect(() => {
    if (!dirty.current) return;
    const base = `/tools/base/${fromSlug}-to-${toSlug}`;
    const url =
      value !== null ? `${base}?v=${formatInBase(value, from)}` : base;
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, fromSlug, toSlug]);

  //pair pages get prose about the two bases they're named for. it renders
  //from live state so the dropdowns keep it honest
  const showProse = Boolean(props.initialFrom && props.initialTo);
  const sampleValue = parseInBase(from.sample, from);
  const example = sampleValue !== null ? formatInBase(sampleValue, to) : null;

  const result = value !== null ? formatInBase(value, to) : null;
  const bits =
    value !== null && value !== 0n
      ? (value < 0n ? -value : value).toString(2).length
      : null;

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title={`${from.label} to ${to.label} Converter`}
        description={`Convert ${from.label.toLowerCase()} numbers to ${to.label.toLowerCase()} instantly. Any size — everything runs in your browser.`}
      />

      <div className="flex flex-row flex-wrap items-center gap-3">
        <Field label="From">
          <Select
            value={from.slug}
            onChange={(e) => changeFrom(e.target.value)}
          >
            {numberBases.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>
        <Button
          material="ghost"
          shape="icon"
          size="sm"
          aria-label="Swap direction"
          onClick={swap}
        >
          <i className="icon-[ri--arrow-left-right-line]" />
        </Button>
        <Field label="To">
          <Select value={to.slug} onChange={(e) => changeTo(e.target.value)}>
            {numberBases.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Panel>
        <PanelHeader label={`${from.label} in`} />
        <div className="p-4">
          <input
            type="text"
            spellCheck={false}
            value={input}
            onChange={(e) => onInput(e.target.value)}
            placeholder={from.sample}
            aria-label={`${from.label} number`}
            className={cn(
              "h-9 w-full rounded-md border border-foreground/15 bg-foreground/5 px-3 text-sm font-mono outline-none focus-visible:border-foreground/40 transition-colors",
              value === null && input.trim() !== "" && "border-bad/60",
            )}
          />
          {value === null && input.trim() !== "" && (
            <div className="pt-2 text-xs opacity-60">
              Can&apos;t read that as {from.label.toLowerCase()} — try{" "}
              {from.sample}
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          label={`${to.label} out`}
          meta={bits !== null ? `${bits} bits` : undefined}
        >
          {result && (
            <CopyToClipboard
              material="ghost"
              size="sm"
              content={result}
              className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
            >
              <CopyToClipboardIcon />
              Copy
            </CopyToClipboard>
          )}
        </PanelHeader>
        <div className="p-4 font-mono text-lg select-all break-all">
          {result ?? <span className="opacity-40">—</span>}
        </div>
      </Panel>

      <Panel>
        <PanelHeader label="All bases" meta="click a row to convert from it" />
        <div className="flex flex-col divide-y divide-foreground/[0.06]">
          {numberBases.map((b) => {
            const active = b.slug === fromSlug;
            return (
              <div
                key={b.slug}
                className={cn(
                  "group flex flex-row items-center gap-3 px-4 transition-colors",
                  active
                    ? "bg-foreground/[0.03]"
                    : "hover:bg-foreground/[0.05]",
                )}
              >
                <button
                  type="button"
                  onClick={() => useBaseAsInput(b.slug)}
                  disabled={value === null || active}
                  aria-current={active || undefined}
                  title={active ? undefined : `Convert from ${b.label}`}
                  className={cn(
                    "flex flex-row items-center gap-3 flex-1 min-w-0 text-left py-1.5",
                    !active && value !== null && "cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] w-[8ch] flex-none font-title uppercase tracking-wider",
                      active ? "opacity-90" : "opacity-50",
                    )}
                  >
                    {b.label}
                  </span>
                  <span className="flex-1 text-sm font-mono break-all py-1.5">
                    {value !== null ? formatInBase(value, b) : "—"}
                  </span>
                  {active && (
                    <span className="text-[10px] font-title uppercase tracking-wider opacity-40 flex-none">
                      in
                    </span>
                  )}
                </button>
                {value !== null && (
                  <CopyToClipboard
                    material="ghost"
                    size="sm"
                    shape="icon"
                    content={formatInBase(value, b)}
                    aria-label={`Copy ${b.label}`}
                    className="opacity-40 group-hover:opacity-100 -mr-2"
                  >
                    <CopyToClipboardIcon />
                  </CopyToClipboard>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      {props.related}

      {showProse && (
        <ToolProse className="mt-4">
          <h2>
            About {from.label.toLowerCase()} and {to.label.toLowerCase()}
          </h2>
          <p>{from.about}</p>
          <p>{to.about}</p>
          {example && (
            <p>
              For example, {from.label.toLowerCase()} <code>{from.sample}</code>{" "}
              is <code>{example}</code> in {to.label.toLowerCase()}. The
              converter uses BigInt, so numbers of any size convert without
              losing precision — and it all runs in your browser.
            </p>
          )}
        </ToolProse>
      )}
    </div>
  );
}
