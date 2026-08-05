"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { Toggle } from "@/components/toggle";
import { swapUrl } from "@/utils/swap-url";
import { useEffect, useState } from "react";
import {
  Field,
  Panel,
  PanelHeader,
  Select,
  ToolHeader,
  ToolProse,
} from "../ui";
import { getHashAlgo, hashAlgos } from "./hashes";

//one component serves /tools/hash and every /tools/hash/[algo] page.
//no url sync for the input on purpose - hashed text is often a secret
export function HashTool(props: { initialAlgo?: string }) {
  const [algoSlug, setAlgoSlug] = useState(props.initialAlgo ?? "sha256");
  const algo = getHashAlgo(algoSlug) ?? hashAlgos[2];

  const [input, setInput] = useState("Hello, World!");
  const [uppercase, setUppercase] = useState(false);
  const [digests, setDigests] = useState<Record<string, string>>({});

  //webcrypto is async, so all digests land together in one effect
  useEffect(() => {
    let stale = false;
    Promise.all(
      hashAlgos.map(async (a) => [a.slug, await a.digest(input)] as const),
    ).then((entries) => {
      if (!stale) setDigests(Object.fromEntries(entries));
    });
    return () => {
      stale = true;
    };
  }, [input]);

  const casing = (s: string | undefined) =>
    s === undefined ? undefined : uppercase ? s.toUpperCase() : s;

  const result = casing(digests[algo.slug]);

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title={`${algo.label} Hash Generator`}
        description={`Type or paste text and get its ${algo.label} digest instantly. Hashing runs entirely in your browser — nothing is sent anywhere.`}
      />

      <div className="flex flex-row flex-wrap items-center gap-x-8 gap-y-4">
        <Field label="Algorithm">
          <Select
            value={algo.slug}
            onChange={(e) => {
              setAlgoSlug(e.target.value);
              swapUrl(`/tools/hash/${e.target.value}`);
            }}
          >
            {hashAlgos.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.label}
              </option>
            ))}
          </Select>
        </Field>
        <label className="flex flex-row items-center gap-2 text-sm cursor-pointer">
          <Toggle
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
          />
          <span className="font-mono">ABC</span>
        </label>
      </div>

      <Panel>
        <PanelHeader label="Input" meta={`${input.length} chars`} />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          rows={5}
          aria-label="Text to hash"
          placeholder="Type or paste text to hash"
          className="w-full resize-y bg-transparent p-4 text-sm font-mono outline-none"
        />
      </Panel>

      <Panel>
        <PanelHeader label={`${algo.label} out`} meta={`${algo.bits} bits`}>
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
        <div className="p-4 font-mono text-sm md:text-base select-all break-all">
          {result ?? <span className="opacity-40">…</span>}
        </div>
        {algo.note && (
          <div className="px-4 pb-3 -mt-1 text-xs opacity-50">{algo.note}</div>
        )}
      </Panel>

      <Panel>
        <PanelHeader label="All algorithms" />
        <div className="flex flex-col divide-y divide-foreground/[0.06]">
          {hashAlgos.map((a) => (
            <div
              key={a.slug}
              className="group flex flex-row items-baseline gap-3 px-4 py-1.5 hover:bg-foreground/[0.05] transition-colors"
            >
              <div className="text-[11px] opacity-50 w-[8ch] flex-none font-title uppercase tracking-wider">
                {a.label}
              </div>
              <div className="flex-1 text-xs font-mono select-all break-all py-1.5">
                {casing(digests[a.slug]) ?? "…"}
              </div>
              {digests[a.slug] && (
                <CopyToClipboard
                  material="ghost"
                  size="sm"
                  shape="icon"
                  content={casing(digests[a.slug])!}
                  aria-label={`Copy ${a.label}`}
                  className="opacity-40 group-hover:opacity-100 -mr-2 self-center"
                >
                  <CopyToClipboardIcon />
                </CopyToClipboard>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* follows the algorithm select */}
      <ToolProse className="mt-4">
        <h2>About {algo.label}</h2>
        <p>{algo.about}</p>
        <p>
          Digests here are computed with the browser&apos;s WebCrypto API (MD5
          runs locally in JavaScript, since WebCrypto dropped it). A hash is
          one-way: the same input always produces the same {algo.bits}-bit
          digest, but the digest can&apos;t be reversed back into the input.
          Text you enter never leaves the page.
        </p>
      </ToolProse>
    </div>
  );
}
