"use client";

import { cn } from "@/utils/cn";
import { useState } from "react";
import { Panel, PanelHeader, ToolHeader } from "../ui";
import { diffStats, lineDiff } from "./diff";

export function DiffTool() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const hasInput = a !== "" || b !== "";
  const lines = hasInput ? lineDiff(a, b) : [];
  const stats = diffStats(lines);

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title="Text Diff Checker"
        description="Paste two versions of a text and see the line-by-line differences — compared entirely in your browser."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader label="Original" />
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            spellCheck={false}
            rows={12}
            aria-label="Original text"
            placeholder="Paste the original text"
            className="w-full resize-y bg-transparent p-4 text-sm font-mono outline-none"
          />
        </Panel>
        <Panel>
          <PanelHeader label="Changed" />
          <textarea
            value={b}
            onChange={(e) => setB(e.target.value)}
            spellCheck={false}
            rows={12}
            aria-label="Changed text"
            placeholder="Paste the changed text"
            className="w-full resize-y bg-transparent p-4 text-sm font-mono outline-none"
          />
        </Panel>
      </div>

      <Panel>
        <PanelHeader
          label="Diff"
          meta={
            hasInput ? (
              <>
                <span className="text-good">+{stats.added}</span>{" "}
                <span className="text-bad">−{stats.removed}</span>
              </>
            ) : undefined
          }
        />
        {!hasInput ? (
          <div className="p-8 text-center text-sm opacity-50">
            Paste text on both sides to compare.
          </div>
        ) : stats.added === 0 && stats.removed === 0 ? (
          <div className="p-8 text-center text-sm opacity-50">
            No differences.
          </div>
        ) : (
          <div className="overflow-x-auto font-mono text-sm">
            {lines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-row gap-3 px-4 whitespace-pre",
                  line.type === "add" && "bg-good/10 text-good",
                  line.type === "del" && "bg-bad/10 text-bad",
                )}
              >
                <span className="w-[1ch] flex-none opacity-60 select-none">
                  {line.type === "add" ? "+" : line.type === "del" ? "−" : " "}
                </span>
                <span>{line.text || " "}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
