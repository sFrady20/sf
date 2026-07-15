"use client";

import { Slider } from "@/components/slider";
import { downloadFile } from "@/utils/download-file";
import { swapUrl } from "@/utils/swap-url";
import { Button } from "earthling-ui/button";
import { useState } from "react";
import {
  Field,
  ImageDrop,
  Panel,
  PanelHeader,
  prettySize,
  Select,
  ToolHeader,
} from "../ui";
import { getFormat, getFormatByMime, imageFormats } from "./formats";

//one component serves /tools/convert and every /tools/convert/[pair] page
export function ImageConverter(props: {
  initialFrom?: string;
  initialTo?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fromSlug, setFromSlug] = useState(props.initialFrom ?? "");
  const [toSlug, setToSlug] = useState(props.initialTo ?? "webp");
  const [quality, setQuality] = useState(80);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const from = getFormat(fromSlug);
  const to = getFormat(toSlug) ?? imageFormats[2];

  const syncUrl = (nextFrom: string, nextTo: string) => {
    if (nextFrom && nextTo && nextFrom !== nextTo)
      swapUrl(`/tools/convert/${nextFrom}-to-${nextTo}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title={
          from
            ? `Convert ${from.label} to ${to.label} Online`
            : "Image Converter"
        }
        description={`Free online image converter. ${
          from
            ? `Turn ${from.label} images into ${to.label} `
            : "Convert between PNG, JPG, WebP, and AVIF "
        }in seconds — no signup, files never stored.`}
      />

      <div className="flex flex-col gap-4">
        <ImageDrop
          file={file}
          onFile={(f) => {
            setFile(f);
            setStatus("");
            if (f) {
              const detected = getFormatByMime(f.type);
              if (detected) {
                setFromSlug(detected.slug);
                //keep from/to distinct so the pair url stays valid
                const nextTo =
                  detected.slug === to.slug
                    ? (imageFormats.find((x) => x.slug !== detected.slug)
                        ?.slug ?? to.slug)
                    : to.slug;
                setToSlug(nextTo);
                syncUrl(detected.slug, nextTo);
              }
            }
          }}
        />

        <Panel>
          <PanelHeader label="Output" meta={status || undefined} />
          <div className="flex flex-row flex-wrap items-center gap-x-8 gap-y-4 p-4">
            <Field label="Format">
              <Select
                value={to.slug}
                onChange={(e) => {
                  setToSlug(e.target.value);
                  setStatus("");
                  syncUrl(fromSlug, e.target.value);
                }}
              >
                {imageFormats
                  .filter((f) => f.slug !== fromSlug)
                  .map((f) => (
                    <option key={f.slug} value={f.slug}>
                      {f.label}
                    </option>
                  ))}
              </Select>
            </Field>
            {to.lossy && (
              <Field label="Quality">
                <Slider
                  min={1}
                  max={100}
                  value={`${quality}`}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-[120px] flex-none"
                />
                <span className="font-mono text-sm tabular-nums w-[3ch] text-right">
                  {quality}
                </span>
              </Field>
            )}
            <Button
              material="outline"
              className="gap-2 ml-auto"
              disabled={!file || busy}
              onClick={async () => {
                if (!file) return;
                setBusy(true);
                setStatus("");
                try {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("quality", `${quality}`);
                  const result = await fetch(`/api/convert/to/${to.slug}`, {
                    method: "post",
                    body: formData,
                  });
                  if (!result.ok) {
                    setStatus(await result.text());
                    return;
                  }
                  const blob = await result.blob();
                  await downloadFile(
                    blob,
                    `${file.name.split(".").slice(0, -1).join(".") || file.name}.${to.slug}`,
                  );
                  setStatus(
                    `Done — ${prettySize(file.size)} → ${prettySize(blob.size)}`,
                  );
                } catch (e) {
                  setStatus("Conversion failed, try a different file.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? (
                <i className="icon-[svg-spinners--180-ring]" />
              ) : (
                <i className="icon-[ri--exchange-2-line]" />
              )}
              Convert & Download
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
