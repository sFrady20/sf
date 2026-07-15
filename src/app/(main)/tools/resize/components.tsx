"use client";

import { Slider } from "@/components/slider";
import { downloadFile } from "@/utils/download-file";
import { Button } from "earthling-ui/button";
import { useEffect, useMemo, useState } from "react";
import {
  Field,
  ImageDrop,
  NumberInput,
  Panel,
  PanelHeader,
  prettySize,
  Select,
  ToolHeader,
} from "../ui";

const formats = [
  { slug: "webp", label: "WebP", lossy: true },
  { slug: "png", label: "PNG", lossy: false },
  { slug: "jpg", label: "JPG", lossy: true },
  { slug: "avif", label: "AVIF", lossy: true },
];

const fits = [
  { slug: "cover", label: "Cover (crop)" },
  { slug: "contain", label: "Contain (letterbox)" },
  { slug: "fill", label: "Fill (stretch)" },
  { slug: "inside", label: "Inside (fit within)" },
];

export function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [fit, setFit] = useState("cover");
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

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

  //pull natural dimensions off the uploaded image
  useEffect(() => {
    if (!sourceUrl) {
      setNatural(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };
    img.src = sourceUrl;
  }, [sourceUrl]);

  const aspect = natural ? natural.w / natural.h : 1;
  const lossy = formats.find((f) => f.slug === format)?.lossy ?? true;

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title="Image Resizer"
        description="Free online image resizer. Scale, crop, or letterbox images to exact pixel dimensions and download as WebP, PNG, JPG, or AVIF."
      />

      <div className="flex flex-col gap-4">
        <ImageDrop
          file={file}
          onFile={(f) => {
            setFile(f);
            setStatus("");
          }}
          meta={
            file && natural
              ? `${natural.w}×${natural.h} · ${prettySize(file.size)}`
              : undefined
          }
        />

        <Panel>
          <PanelHeader label="Dimensions" meta={status || undefined} />
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex flex-row items-center gap-2">
                <Field label="W">
                  <NumberInput
                    min={1}
                    value={width || ""}
                    onChange={(e) => {
                      const w = parseInt(e.target.value) || 0;
                      setWidth(w);
                      if (locked && w) setHeight(Math.round(w / aspect));
                    }}
                  />
                </Field>
                <Button
                  material="ghost"
                  size="sm"
                  shape="icon"
                  aria-label={
                    locked ? "Unlock aspect ratio" : "Lock aspect ratio"
                  }
                  className={locked ? undefined : "opacity-50"}
                  onClick={() => setLocked((l) => !l)}
                >
                  <i
                    className={
                      locked
                        ? "icon-[ri--lock-line]"
                        : "icon-[ri--lock-unlock-line]"
                    }
                  />
                </Button>
                <Field label="H">
                  <NumberInput
                    min={1}
                    value={height || ""}
                    onChange={(e) => {
                      const h = parseInt(e.target.value) || 0;
                      setHeight(h);
                      if (locked && h) setWidth(Math.round(h * aspect));
                    }}
                  />
                </Field>
              </div>
              <Field label="Fit">
                <Select value={fit} onChange={(e) => setFit(e.target.value)}>
                  {fits.map((f) => (
                    <option key={f.slug} value={f.slug}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Format">
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  {formats.map((f) => (
                    <option key={f.slug} value={f.slug}>
                      {f.label}
                    </option>
                  ))}
                </Select>
              </Field>
              {lossy && (
                <Field label="Quality">
                  <Slider
                    min={1}
                    max={100}
                    value={`${quality}`}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-[100px] flex-none"
                  />
                  <span className="font-mono text-sm tabular-nums w-[3ch] text-right">
                    {quality}
                  </span>
                </Field>
              )}
              <Button
                material="outline"
                className="gap-2 ml-auto"
                disabled={!file || busy || (!width && !height)}
                onClick={async () => {
                  if (!file) return;
                  setBusy(true);
                  setStatus("");
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("width", `${width}`);
                    formData.append("height", `${height}`);
                    formData.append("fit", fit);
                    formData.append("format", format);
                    formData.append("quality", `${quality}`);
                    const result = await fetch(`/api/images/resize`, {
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
                      `${file.name.split(".").slice(0, -1).join(".") || file.name}-${width}x${height}.${format}`,
                    );
                    setStatus(
                      `Done — ${prettySize(file.size)} → ${prettySize(blob.size)}`,
                    );
                  } catch (e) {
                    setStatus("Resize failed, try a different file.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? (
                  <i className="icon-[svg-spinners--180-ring]" />
                ) : (
                  <i className="icon-[ri--aspect-ratio-line]" />
                )}
                Resize & Download
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
