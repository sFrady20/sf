"use client";

import {
  CopyToClipboard,
  CopyToClipboardIcon,
} from "@/components/copy-to-clipboard";
import { cn } from "@/utils/cn";
import { downloadFile } from "@/utils/download-file";
import { Button } from "earthling-ui/button";
import { zipSync } from "fflate";
import { useEffect, useMemo, useState } from "react";
import { Field, ImageDrop, Panel, PanelHeader, ToolHeader } from "../ui";
import { getIconPreset, iconPresets } from "./presets";

//contain-fit the source into a transparent square, padding = maskable safe zone
const renderIcon = async (
  img: HTMLImageElement,
  size: number,
  padding = 0,
) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const inner = size * (1 - padding * 2);
  const scale = Math.min(inner / img.naturalWidth, inner / img.naturalHeight);
  const w = img.naturalWidth * scale;
  const h = img.naturalHeight * scale;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("encode failed"))),
      "image/png",
    ),
  );
};

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

export function IconSetTool() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("My App");
  const [presetSlug, setPresetSlug] = useState(iconPresets[0].slug);
  const [previews, setPreviews] = useState<
    { path: string; size: number; url: string }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState("");

  const preset = getIconPreset(presetSlug) ?? iconPresets[0];

  const sourceUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );
  useEffect(
    () => () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    },
    [sourceUrl],
  );

  //re-render the preview grid whenever source or preset changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sourceUrl) {
        setPreviews([]);
        setWarning("");
        return;
      }
      try {
        const img = await loadImage(sourceUrl);
        if (cancelled) return;
        setWarning(
          img.naturalWidth !== img.naturalHeight
            ? "Source isn't square — icons will be letterboxed."
            : img.naturalWidth < 1024
              ? "Source is under 1024px — large icons may look soft."
              : "",
        );
        const rendered = await Promise.all(
          preset.files.map(async (f) => ({
            path: f.path,
            size: f.size,
            url: URL.createObjectURL(
              await renderIcon(img, Math.min(f.size, 256), f.padding),
            ),
          })),
        );
        if (cancelled) {
          rendered.forEach((r) => URL.revokeObjectURL(r.url));
          return;
        }
        setPreviews((prev) => {
          prev.forEach((r) => URL.revokeObjectURL(r.url));
          return rendered;
        });
      } catch (e) {
        if (!cancelled) setWarning("Couldn't read that file as an image.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceUrl, preset]);

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title="App Icon Set Generator"
        description="Free online icon set generator. Upload one square image and download every size you need for PWAs, Expo / React Native, or Android — with the JSON configs included. Everything runs in your browser."
      />

      {/* segmented preset picker */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex flex-row flex-wrap self-start rounded-lg border border-foreground/15 bg-foreground/[0.04] p-1 gap-1">
          {iconPresets.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => setPresetSlug(p.slug)}
              className={cn(
                "text-sm rounded-md px-3.5 h-8 transition-colors cursor-pointer",
                p.slug === preset.slug
                  ? "bg-foreground/15"
                  : "opacity-60 hover:opacity-100 hover:bg-foreground/[0.07]",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-sm opacity-50">{preset.description}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-stretch">
        <ImageDrop
          file={file}
          onFile={setFile}
          hint="Choose a square source image (1024px+)"
          className="flex-1"
        />
        <Field label="App name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 rounded-md border border-foreground/15 bg-foreground/5 px-3 text-sm outline-none focus-visible:border-foreground/40 transition-colors min-w-[200px]"
          />
        </Field>
      </div>

      {warning && (
        <div className="flex flex-row items-center gap-2 text-sm text-amber-500/90">
          <i className="icon-[ri--error-warning-line]" />
          {warning}
        </div>
      )}

      {previews.length > 0 && (
        <Panel>
          <PanelHeader
            label="Preview"
            meta={`${preset.files.length} files`}
          >
            <Button
              material="outline"
              size="sm"
              className="gap-2 -mr-2"
              disabled={busy}
              onClick={async () => {
                if (!sourceUrl) return;
                setBusy(true);
                try {
                  const img = await loadImage(sourceUrl);
                  const entries: Record<string, Uint8Array> = {};
                  for (const f of preset.files) {
                    const blob = await renderIcon(img, f.size, f.padding);
                    entries[f.path] = new Uint8Array(await blob.arrayBuffer());
                  }
                  for (const c of preset.configs) {
                    //strip the "(snippet)" suffix from zip paths
                    const path = c.path.replace(/\s*\(.*\)$/, "");
                    entries[path] = new TextEncoder().encode(c.content(name));
                  }
                  //pngs are already compressed, don't bother re-deflating
                  const zipped = zipSync(entries, { level: 0 });
                  await downloadFile(
                    new Blob([new Uint8Array(zipped)], {
                      type: "application/zip",
                    }),
                    `${preset.slug}-icons.zip`,
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? (
                <i className="icon-[svg-spinners--180-ring]" />
              ) : (
                <i className="icon-[ri--download-2-line]" />
              )}
              Download .zip
            </Button>
          </PanelHeader>
          <div className="flex flex-row flex-wrap gap-6 p-4">
            {previews.map((p) => (
              <div key={p.path} className="flex flex-col items-center gap-2">
                <div className="w-[88px] h-[88px] flex items-center justify-center bg-foreground/[0.05] rounded-lg border border-foreground/10 p-2">
                  <img
                    src={p.url}
                    alt={p.path}
                    className="max-w-full max-h-full"
                    style={{ width: Math.min(p.size, 72) }}
                  />
                </div>
                <div className="text-[10px] opacity-50 font-mono text-center max-w-[110px] break-all leading-tight">
                  {p.path}
                  <br />
                  <span className="tabular-nums">
                    {p.size}×{p.size}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {preset.configs.map((c) => (
        <Panel key={c.path}>
          <PanelHeader
            label={<span className="normal-case font-mono">{c.path}</span>}
          >
            <CopyToClipboard
              material="ghost"
              size="sm"
              content={c.content(name)}
              className="gap-1.5 -mr-2 opacity-60 hover:opacity-100"
            >
              <CopyToClipboardIcon />
              Copy
            </CopyToClipboard>
          </PanelHeader>
          <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
            {c.content(name)}
          </pre>
        </Panel>
      ))}
    </div>
  );
}
