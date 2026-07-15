"use client";

import highlight from "@/services/highlight";
import { cn } from "@/utils/cn";
import { useMemo, useRef } from "react";

//don't run hljs on huge pastes, and don't trust weak auto-detections.
//measured: real json/ts/html scores 5-8, prose and encoded junk scores 0-1
const MAX_HIGHLIGHT_CHARS = 30_000;
const MIN_AUTO_RELEVANCE = 4;

//textarea with a highlighted <pre> backdrop. the textarea's text goes
//transparent when highlighting kicks in, falls back to a plain editor when
//nothing detects confidently
export function CodeArea(props: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  language?: string;
  autoFocus?: boolean;
}) {
  const { value, onChange, readOnly, placeholder, language, autoFocus } =
    props;

  const preRef = useRef<HTMLPreElement>(null);

  const highlighted = useMemo(() => {
    if (!value || value.length > MAX_HIGHLIGHT_CHARS) return null;
    try {
      if (language)
        return highlight.highlight(value, { language, ignoreIllegals: true })
          .value;
      const auto = highlight.highlightAuto(value);
      return auto.language && auto.relevance >= MIN_AUTO_RELEVANCE
        ? auto.value
        : null;
    } catch (e) {
      return null;
    }
  }, [value, language]);

  //identical metrics on both layers or the overlay drifts
  const layerClasses =
    "p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words";

  return (
    <div className="relative flex-1 min-h-[300px]">
      {highlighted !== null && (
        <pre
          ref={preRef}
          aria-hidden
          className={cn(
            "hljs absolute inset-0 overflow-auto m-0 pointer-events-none",
            layerClasses,
          )}
        >
          <code dangerouslySetInnerHTML={{ __html: highlighted + "\n" }} />
        </pre>
      )}
      <textarea
        autoFocus={autoFocus}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        onScroll={(e) => {
          if (preRef.current) {
            preRef.current.scrollTop = e.currentTarget.scrollTop;
            preRef.current.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
        className={cn(
          "absolute inset-0 w-full h-full outline-none resize-none placeholder:opacity-40",
          layerClasses,
          highlighted !== null
            ? //night-owl surface is always dark, so the caret stays light
              "bg-transparent text-transparent caret-[#d6deeb]"
            : "bg-transparent",
        )}
      />
    </div>
  );
}
