"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { cn } from "@/utils/cn";
import { Button } from "earthling-ui/button";
import { useEffect, useState } from "react";
import { Panel, PanelHeader, ToolHeader } from "../ui";
import {
  CLAIM_LABELS,
  SAMPLE_JWT,
  TIME_CLAIMS,
  decodeJwt,
  jwtStatus,
} from "./jwt";

const timeFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function ClaimRows(props: { data: Record<string, unknown> }) {
  const { data } = props;
  //client clock only matters for the time claims, so render those postmount
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  return (
    <div className="flex flex-col divide-y divide-foreground/[0.06]">
      {Object.entries(data).map(([key, value]) => {
        const isTime = TIME_CLAIMS.includes(key) && typeof value === "number";
        return (
          <div
            key={key}
            className="flex flex-row items-baseline gap-3 px-4 py-1.5"
          >
            <div className="font-mono text-sm w-[8ch] flex-none">{key}</div>
            <div className="flex-1 font-mono text-sm break-all select-all py-1">
              {typeof value === "string" ? value : JSON.stringify(value)}
            </div>
            <div className="text-xs opacity-50 text-right">
              {CLAIM_LABELS[key]}
              {isTime && now && (
                <span className="block tabular-nums">
                  {timeFmt.format(new Date((value as number) * 1000))}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

//no url sync anywhere in here - tokens are credentials, they stay put
export function JwtTool() {
  const [input, setInput] = useState("");
  const decoded = input.trim() ? decodeJwt(input) : null;

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const status = decoded?.ok && now ? jwtStatus(decoded.payload, now) : null;

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title="JWT Decoder"
        description="Paste a JSON Web Token to inspect its header and claims. Decoding happens entirely in your browser — the token is never sent anywhere, and signatures are not verified."
      />

      <Panel>
        <PanelHeader label="Token">
          <Button
            material="ghost"
            size="sm"
            className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
            onClick={() => setInput(SAMPLE_JWT)}
          >
            <i className="icon-[ri--flask-line]" />
            Sample
          </Button>
        </PanelHeader>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          rows={4}
          aria-label="JWT to decode"
          placeholder="eyJhbGciOi..."
          className={cn(
            "w-full resize-y bg-transparent p-4 text-sm font-mono break-all outline-none",
            decoded && !decoded.ok && "text-bad",
          )}
        />
        {decoded && !decoded.ok && (
          <div className="px-4 pb-3 text-xs opacity-60">
            Can&apos;t decode that — {decoded.error}
          </div>
        )}
      </Panel>

      {decoded?.ok && (
        <>
          <Panel>
            <PanelHeader
              label="Payload"
              meta={
                status && (
                  <span className={status.ok ? "text-good" : "text-bad"}>
                    {status.label}
                  </span>
                )
              }
            >
              <CopyToClipboard
                material="ghost"
                size="sm"
                content={JSON.stringify(decoded.payload, null, 2)}
                className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
              >
                <CopyToClipboardIcon />
                Copy JSON
              </CopyToClipboard>
            </PanelHeader>
            <ClaimRows data={decoded.payload} />
          </Panel>

          <Panel>
            <PanelHeader label="Header">
              <CopyToClipboard
                material="ghost"
                size="sm"
                content={JSON.stringify(decoded.header, null, 2)}
                className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
              >
                <CopyToClipboardIcon />
                Copy JSON
              </CopyToClipboard>
            </PanelHeader>
            <ClaimRows data={decoded.header} />
          </Panel>

          <Panel>
            <PanelHeader label="Signature" meta="not verified" />
            <div className="p-4 font-mono text-sm break-all opacity-60">
              {decoded.signature || "(empty)"}
            </div>
            <div className="px-4 pb-3 -mt-1 text-xs opacity-50">
              this tool only decodes — verifying needs the signing key, which
              you should not paste into websites
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
