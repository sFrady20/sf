"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { swapUrl } from "@/utils/swap-url";
import { Button } from "earthling-ui/button";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Field, Panel, PanelHeader, Select, ToolHeader } from "../ui";
import {
  getTextTransform,
  textTransformGroups,
  textTransforms,
} from "./transforms";

//codemirror is client-only and heavy-ish, keep it out of the shared chunks
const CodeEditor = dynamic(
  () => import("./code-editor").then((m) => m.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 min-h-[300px] bg-[#011627] animate-pulse" />
    ),
  },
);

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
                    <option key={t.slug} value={t.slug}>
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
          <CodeEditor
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
            <CodeEditor
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
