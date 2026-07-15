"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { Slider } from "@/components/slider";
import { cn } from "@/utils/cn";
import { swapUrl } from "@/utils/swap-url";
import { Button } from "earthling-ui/button";
import { useEffect, useState } from "react";
import { Field, Panel, PanelHeader, Select, ToolHeader } from "../ui";
import { GeneratorOptions, generators, getGenerator } from "./generators";

const defaultsFor = (slug: string): GeneratorOptions =>
  Object.fromEntries(
    (getGenerator(slug)?.options ?? []).map((o) => [o.key, o.defaultValue]),
  );

//one component serves every /tools/generate/[slug] page
export function GeneratorTool(props: { initialSlug: string }) {
  const [slug, setSlug] = useState(props.initialSlug);
  const [allOptions, setAllOptions] = useState<
    Record<string, GeneratorOptions>
  >(() =>
    Object.fromEntries(generators.map((g) => [g.slug, defaultsFor(g.slug)])),
  );
  const [results, setResults] = useState<string[]>([]);
  const [nonce, setNonce] = useState(0);

  const generator = getGenerator(slug) ?? generators[0];
  const options = allOptions[generator.slug];

  //random output can't render on the server, so generate after mount
  useEffect(() => {
    setResults(generator.generate(options));
  }, [generator, options, nonce]);

  const setOption = (key: string, value: number | boolean) =>
    setAllOptions((prev) => ({
      ...prev,
      [generator.slug]: { ...prev[generator.slug], [key]: value },
    }));

  const isColor = generator.slug === "hex-color";

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader title={generator.title} description={generator.description} />

      <div className="flex flex-row items-center gap-3">
        <Field label="Generator">
          <Select
            value={generator.slug}
            onChange={(e) => {
              setSlug(e.target.value);
              swapUrl(`/tools/generate/${e.target.value}`);
            }}
          >
            {generators.map((g) => (
              <option key={g.slug} value={g.slug} className="text-background">
                {g.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Panel>
        <PanelHeader label="Options">
          <Button
            material="ghost"
            size="sm"
            className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
            onClick={() => setNonce((n) => n + 1)}
          >
            <i className="icon-[ri--refresh-line]" />
            Regenerate
          </Button>
        </PanelHeader>
        <div className="flex flex-row flex-wrap items-center gap-x-8 gap-y-4 p-4">
          {generator.options.map((opt) =>
            opt.type === "number" ? (
              <Field key={opt.key} label={opt.label}>
                <Slider
                  min={opt.min}
                  max={opt.max}
                  value={`${options[opt.key]}`}
                  onChange={(e) =>
                    setOption(opt.key, parseInt(e.target.value))
                  }
                  className="w-[120px] flex-none"
                />
                <span className="font-mono text-sm tabular-nums w-[3ch] text-right">
                  {options[opt.key]}
                </span>
              </Field>
            ) : (
              <label
                key={opt.key}
                className="flex flex-row items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!options[opt.key]}
                  onChange={(e) => setOption(opt.key, e.target.checked)}
                  className="accent-current"
                />
                <span className="font-mono">{opt.label}</span>
              </label>
            ),
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHeader
          label="Output"
          meta={results.length > 1 ? `${results.length} results` : undefined}
        >
          {results.length > 1 && (
            <CopyToClipboard
              material="ghost"
              size="sm"
              content={results.join("\n")}
              className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
            >
              <CopyToClipboardIcon />
              Copy all
            </CopyToClipboard>
          )}
        </PanelHeader>
        {results.length === 0 ? (
          <div className="p-8 text-center text-sm opacity-50">
            Enable at least one character set to generate.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-foreground/[0.06]">
            {results.map((value, i) => (
              <div
                key={i}
                className="group flex flex-row items-center gap-3 px-4 py-1.5 hover:bg-foreground/[0.05] transition-colors"
              >
                <div className="text-[11px] opacity-30 tabular-nums w-[2ch] text-right flex-none">
                  {i + 1}
                </div>
                {isColor && (
                  <div
                    className="w-5 h-5 rounded border border-foreground/15 flex-none"
                    style={{ backgroundColor: value }}
                  />
                )}
                <div
                  className={cn(
                    "flex-1 text-sm break-all select-all py-1.5",
                    generator.mono && "font-mono",
                  )}
                >
                  {value}
                </div>
                <CopyToClipboard
                  material="ghost"
                  size="sm"
                  shape="icon"
                  content={value}
                  aria-label="Copy"
                  className="opacity-40 group-hover:opacity-100 -mr-2"
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
