"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { swapUrl } from "@/utils/swap-url";
import { Button } from "earthling-ui/button";
import { useMemo, useState } from "react";
import { Field, Panel, PanelHeader, Select, ToolHeader } from "../ui";
import { CodeArea } from "./code-area";
import {
  getTextTransform,
  textTransformGroups,
  textTransforms,
} from "./transforms";

//one component serves every /tools/text/[transform] page,
//the route just seeds the switcher
export function TextTool(props: { initialSlug: string }) {
  const [slug, setSlug] = useState(props.initialSlug);
  const [input, setInput] = useState("");

  const transform = getTextTransform(slug) ?? textTransforms[0];

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      return { output: transform.apply(input), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : `${e}` };
    }
  }, [input, transform]);

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader title={transform.title} description={transform.description} />

      <div className="flex flex-row items-center gap-3">
        <Field label="Transform">
          <Select
            value={transform.slug}
            onChange={(e) => {
              setSlug(e.target.value);
              swapUrl(`/tools/text/${e.target.value}`);
            }}
          >
            {textTransformGroups.map((group) => (
              <optgroup key={group} label={group}>
                {textTransforms
                  .filter((t) => t.group === group)
                  .map((t) => (
                    <option
                      key={t.slug}
                      value={t.slug}
                      className="text-background"
                    >
                      {t.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader
            label="Input"
            meta={input ? `${input.length.toLocaleString()} chars` : undefined}
          >
            {input && (
              <Button
                material="ghost"
                size="sm"
                className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
                onClick={() => setInput("")}
              >
                <i className="icon-[ri--close-line]" />
                Clear
              </Button>
            )}
          </PanelHeader>
          <CodeArea
            autoFocus
            value={input}
            onChange={setInput}
            placeholder={transform.placeholder ?? "Paste or type text here…"}
            language={transform.inputLanguage}
          />
        </Panel>
        <Panel
          className={result.error ? "border-red-500/40" : undefined}
        >
          <PanelHeader
            label="Output"
            meta={
              result.output
                ? `${result.output.length.toLocaleString()} chars`
                : undefined
            }
          >
            <CopyToClipboard
              material="ghost"
              size="sm"
              content={result.output}
              disabled={!result.output}
              className="gap-1.5 -mr-2 opacity-60 hover:opacity-100 disabled:opacity-30"
            >
              <CopyToClipboardIcon />
              Copy
            </CopyToClipboard>
          </PanelHeader>
          {result.error ? (
            <div className="flex-1 p-4 min-h-[300px] flex flex-col gap-1">
              <div className="text-sm text-red-500/90 font-mono">
                {result.error}
              </div>
            </div>
          ) : (
            <CodeArea
              readOnly
              value={result.output}
              placeholder="Result appears here…"
              language={transform.outputLanguage}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
