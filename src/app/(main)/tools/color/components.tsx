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
  colorSpaces,
  detectSpace,
  getSpace,
  toColorParam,
  type Rgba,
} from "./spaces";

//one component serves /tools/color and every /tools/color/[pair] page
export function ColorConverter(props: {
  initialFrom?: string;
  initialTo?: string;
  //pair link chips from the page, rendered between the tool and the article
  related?: ReactNode;
}) {
  const [fromSlug, setFromSlug] = useState(props.initialFrom ?? "hex");
  const [toSlug, setToSlug] = useState(props.initialTo ?? "rgb");
  const from = getSpace(fromSlug) ?? colorSpaces[0];
  const to = getSpace(toSlug) ?? colorSpaces[1];

  const [input, setInput] = useState(from.sample);

  const rgb = from.parse(input);
  const hexSpace = getSpace("hex")!;

  //no url writes until the user actually does something, so landing on a
  //pair page doesn't immediately decorate the address bar
  const dirty = useRef(false);

  //carry the current color across a mode change instead of dropping it
  const changeFrom = (nextSlug: string) => {
    const next = getSpace(nextSlug);
    if (!next) return;
    dirty.current = true;
    //picking the same space as To swaps them, both selects stay distinct
    const nextTo = nextSlug === toSlug ? fromSlug : toSlug;
    setFromSlug(nextSlug);
    setToSlug(nextTo);
    setInput(rgb ? next.format(rgb) : next.sample);
  };

  const changeTo = (nextSlug: string) => {
    dirty.current = true;
    const nextFrom = nextSlug === fromSlug ? toSlug : fromSlug;
    if (nextFrom !== fromSlug) {
      const next = getSpace(nextFrom)!;
      setInput(rgb ? next.format(rgb) : next.sample);
    }
    setFromSlug(nextFrom);
    setToSlug(nextSlug);
  };

  const swap = () => {
    dirty.current = true;
    setFromSlug(toSlug);
    setToSlug(fromSlug);
    setInput(rgb ? to.format(rgb) : to.sample);
  };

  //clicking a format row promotes it to the input, and whatever was the
  //input becomes the output - tap around the formats to pivot the pair
  const useSpaceAsInput = (slug: string) => {
    const next = getSpace(slug);
    if (!next || !rgb || slug === fromSlug) return;
    dirty.current = true;
    setToSlug(fromSlug);
    setFromSlug(slug);
    setInput(next.format(rgb));
  };

  //pasting an explicit rgb(...)/hsl(...)/#hex switches From automatically,
  //same spirit as the image converter sniffing the file type
  const onInput = (value: string) => {
    dirty.current = true;
    setInput(value);
    const detected = detectSpace(value);
    if (detected && detected !== fromSlug) {
      setToSlug(detected === toSlug ? fromSlug : toSlug);
      setFromSlug(detected);
    }
  };

  //land with ?color= -> hydrate the input from it. read client-side so the
  //statically generated pair pages stay static
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("color");
    if (!param) return;
    const parsed = from.parse(param);
    if (parsed) setInput(from.format(parsed));
    else onInput(param); //full css strings still auto-detect their space
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //the address bar mirrors the current color so it's always shareable.
  //swapUrl is native replaceState - none of the router churn the palette
  //tool suffers from - and the debounce keeps picker drags off the
  //history api rate limit
  useEffect(() => {
    if (!dirty.current) return;
    const base = `/tools/color/${fromSlug}-to-${toSlug}`;
    const url = rgb ? `${base}?color=${toColorParam(from, rgb)}` : base;
    const timer = setTimeout(() => swapUrl(url), 150);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, fromSlug, toSlug]);

  const result = rgb ? to.format(rgb) : null;
  const swatchHex = rgb ? hexSpace.format(rgb) : null;

  //pair pages get prose about the two formats they're named for. it renders
  //from live state so the dropdowns keep it honest
  const showProse = Boolean(props.initialFrom && props.initialTo);
  const sampleRgba = from.parse(from.sample);
  const example = sampleRgba ? to.format(sampleRgba) : null;

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title={`${from.label} to ${to.label} Converter`}
        description={`Convert ${from.label} colors to ${to.label} instantly. Paste a color — with or without alpha — and the conversion runs right in your browser.`}
      />

      <div className="flex flex-row flex-wrap items-center gap-3">
        <Field label="From">
          <Select
            value={from.slug}
            onChange={(e) => changeFrom(e.target.value)}
          >
            {colorSpaces.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
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
            {colorSpaces.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Panel>
        <PanelHeader label={`${from.label} in`} />
        <div className="flex flex-row items-center gap-3 p-4">
          {/* native picker doubles as the live swatch - it can't express
              alpha, so picking a hue keeps the current transparency */}
          <input
            type="color"
            aria-label="Pick a color"
            value={swatchHex ? swatchHex.slice(0, 7) : "#000000"}
            onChange={(e) => {
              dirty.current = true;
              const picked = hexSpace.parse(e.target.value) as Rgba;
              if (rgb) picked[3] = rgb[3];
              setInput(from.format(picked));
            }}
            className="w-9 h-9 rounded-md border border-foreground/15 bg-transparent cursor-pointer flex-none"
          />
          <input
            type="text"
            spellCheck={false}
            value={input}
            onChange={(e) => onInput(e.target.value)}
            placeholder={from.sample}
            className={cn(
              "h-9 flex-1 min-w-0 rounded-md border border-foreground/15 bg-foreground/5 px-3 text-sm font-mono outline-none focus-visible:border-foreground/40 transition-colors",
              !rgb && input.trim() !== "" && "border-bad/60",
            )}
          />
        </div>
        {!rgb && input.trim() !== "" && (
          <div className="px-4 pb-3 -mt-1 text-xs opacity-60">
            Can't read that as {from.label} — try {from.sample}
          </div>
        )}
      </Panel>

      <Panel>
        <PanelHeader label={`${to.label} out`}>
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
        <PanelHeader
          label="All formats"
          meta="click a row to convert from it"
        />
        <div className="flex flex-col divide-y divide-foreground/[0.06]">
          {colorSpaces.map((s) => {
            const active = s.slug === fromSlug;
            return (
              <div
                key={s.slug}
                className={cn(
                  "group flex flex-row items-center gap-3 px-4 transition-colors",
                  active
                    ? "bg-foreground/[0.03]"
                    : "hover:bg-foreground/[0.05]",
                )}
              >
                <button
                  type="button"
                  onClick={() => useSpaceAsInput(s.slug)}
                  disabled={!rgb || active}
                  aria-current={active || undefined}
                  title={active ? undefined : `Convert from ${s.label}`}
                  className={cn(
                    "flex flex-row items-center gap-3 flex-1 min-w-0 text-left py-1.5",
                    !active && rgb && "cursor-pointer",
                  )}
                >
                  <span
                    className={cn(
                      "text-[11px] w-[6ch] flex-none font-title uppercase tracking-wider",
                      active ? "opacity-90" : "opacity-50",
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="flex-1 text-sm font-mono break-all py-1.5">
                    {rgb ? s.format(rgb) : "—"}
                  </span>
                  {active && (
                    <span className="text-[10px] font-title uppercase tracking-wider opacity-40 flex-none">
                      in
                    </span>
                  )}
                </button>
                {rgb && (
                  <CopyToClipboard
                    material="ghost"
                    size="sm"
                    shape="icon"
                    content={s.format(rgb)}
                    aria-label={`Copy ${s.label}`}
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
            About {from.label} and {to.label}
          </h2>
          <p>{from.about}</p>
          <p>{to.about}</p>
          {example && (
            <p>
              For example, <code>{from.sample}</code> in {from.label} is{" "}
              <code>{example}</code> in {to.label}. Paste your own value above —
              conversion is instant, runs entirely in your browser, and carries
              alpha through when your color has one.
            </p>
          )}
        </ToolProse>
      )}
    </div>
  );
}
