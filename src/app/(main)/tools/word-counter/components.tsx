"use client";

import { useState } from "react";
import { Panel, PanelHeader, ToolHeader } from "../ui";
import { textStats } from "./counts";

export function WordCounterTool() {
  const [input, setInput] = useState("");
  const stats = textStats(input);

  const tiles = [
    { label: "words", value: stats.words },
    { label: "characters", value: stats.characters },
    { label: "no spaces", value: stats.charactersNoSpaces },
    { label: "unique words", value: stats.uniqueWords },
    { label: "sentences", value: stats.sentences },
    { label: "paragraphs", value: stats.paragraphs },
    { label: "lines", value: stats.lines },
    {
      label: "reading time",
      value: stats.words === 0 ? "—" : `${stats.readingMinutes} min`,
    },
    {
      label: "speaking time",
      value: stats.words === 0 ? "—" : `${stats.speakingMinutes} min`,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title="Word Counter"
        description="Live word, character, sentence, and paragraph counts with reading time — as you type or paste, right in your browser."
      />

      <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="flex flex-col items-center gap-1 rounded-xl border border-foreground/10 bg-foreground/[0.04] px-2 py-3"
          >
            <div className="font-mono text-lg tabular-nums leading-none">
              {t.value}
            </div>
            <div className="text-[10px] font-title uppercase tracking-wider opacity-50 text-center">
              {t.label}
            </div>
          </div>
        ))}
      </div>

      <Panel>
        <PanelHeader label="Text" />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={14}
          aria-label="Text to count"
          placeholder="Type or paste your text here"
          className="w-full resize-y bg-transparent p-4 text-sm outline-none"
        />
      </Panel>
    </div>
  );
}
