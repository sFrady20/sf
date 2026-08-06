"use client";

import { downloadFile } from "@/utils/download-file";
import { swapUrl } from "@/utils/swap-url";
import { Button } from "earthling-ui/button";
import { ReactNode, useState } from "react";
import {
  Field,
  FileDrop,
  Panel,
  PanelHeader,
  prettySize,
  Select,
  ToolHeader,
  ToolProse,
} from "../ui";
import {
  audioOutputs,
  detectAudioFormat,
  getAudioFormat,
} from "./formats";
import { convertAudio, isFFmpegLoaded, loadFFmpeg } from "./ffmpeg";

const bitrates = [128, 160, 192, 256, 320];

//one component serves /tools/audio and every /tools/audio/[pair] page
export function AudioConverter(props: {
  initialFrom?: string;
  initialTo?: string;
  //pair link chips from the page, rendered between the tool and the article
  related?: ReactNode;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fromSlug, setFromSlug] = useState(props.initialFrom ?? "");
  const [toSlug, setToSlug] = useState(props.initialTo ?? "mp3");
  const [kbps, setKbps] = useState(192);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const from = getAudioFormat(fromSlug);
  const to = getAudioFormat(toSlug) ?? audioOutputs[0];
  const fromVideo = from?.inputOnly ?? false;

  const syncUrl = (nextFrom: string, nextTo: string) => {
    if (nextFrom && nextTo && nextFrom !== nextTo)
      swapUrl(`/tools/audio/${nextFrom}-to-${nextTo}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <ToolHeader
        title={
          from
            ? fromVideo
              ? `Extract ${to.label} Audio from ${from.label}`
              : `Convert ${from.label} to ${to.label} Online`
            : "Audio Converter"
        }
        description={`Free online audio converter. ${
          from
            ? fromVideo
              ? `Pull the audio out of ${from.label} video as ${to.label} `
              : `Turn ${from.label} audio into ${to.label} `
            : "Convert between MP3, WAV, AIFF, FLAC, OGG, M4A, and Opus — or extract audio from video — "
        }right in your browser. Files are never uploaded anywhere.`}
      />

      <div className="flex flex-col gap-4">
        <FileDrop
          file={file}
          onFile={(f) => {
            setFile(f);
            setStatus("");
            if (f) {
              const detected = detectAudioFormat(f);
              if (detected) {
                setFromSlug(detected.slug);
                //keep from/to distinct so the pair url stays valid
                const nextTo =
                  detected.slug === to.slug
                    ? (audioOutputs.find((x) => x.slug !== detected.slug)
                        ?.slug ?? to.slug)
                    : to.slug;
                setToSlug(nextTo);
                syncUrl(detected.slug, nextTo);
              }
            }
          }}
          //explicit extensions because windows often has no mime for aiff/flac
          accept="audio/*,video/*,.aiff,.aif,.aifc,.flac,.opus,.mkv"
          icon="icon-[ri--music-2-line]"
          hint="Choose an audio or video file, or drop it here"
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
                {audioOutputs
                  .filter((f) => f.slug !== fromSlug)
                  .map((f) => (
                    <option key={f.slug} value={f.slug}>
                      {f.label}
                    </option>
                  ))}
              </Select>
            </Field>
            {to.lossy && (
              <Field label="Bitrate">
                <Select
                  value={`${kbps}`}
                  onChange={(e) => setKbps(parseInt(e.target.value))}
                >
                  {bitrates.map((b) => (
                    <option key={b} value={b}>
                      {b} kbps
                    </option>
                  ))}
                </Select>
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
                  if (!isFFmpegLoaded()) {
                    //first run pulls the ~31mb wasm core, worth a heads up
                    setStatus("Loading converter (~31 MB, first time only)…");
                    await loadFFmpeg();
                  }
                  setStatus("Converting…");
                  const blob = await convertAudio(file, to, kbps, (ratio) =>
                    setStatus(`Converting… ${Math.round(ratio * 100)}%`),
                  );
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

      {props.related}

      {/* follows the selects and whatever file gets dropped in */}
      {from && (
        <ToolProse className="mt-4">
          <h2>
            About {from.label} and {to.label}
          </h2>
          <p>{from.about}</p>
          <p>{to.about}</p>
          <p>
            {fromVideo
              ? `Extracting audio from ${from.label} re-encodes only the audio track — the video is discarded, so even long files finish quickly.`
              : to.lossy
                ? `Converting ${from.label} to ${to.label} is lossy. 192 kbps is transparent for most listeners on most material; pick 320 kbps if you want the ceiling, or drop lower when small files matter more than fidelity.`
                : from.lossy
                  ? `Converting ${from.label} to ${to.label} produces a lossless file, though detail already discarded by ${from.label}'s compression can't be recovered — the new file is a faithful copy of the ${from.label}, not of the original recording.`
                  : `Converting ${from.label} to ${to.label} is lossless in both directions — the audio comes through bit-perfect, so you can convert back and forth without generational loss.`}
          </p>

          <h2>How the conversion works</h2>
          <p>
            This tool runs FFmpeg — the same engine behind most media software —
            compiled to WebAssembly, entirely in your browser. Your file is read
            locally, converted locally, and saved straight from memory; nothing
            is ever uploaded, which also means no queues and no server-side file
            size limits.
          </p>
          <p>
            The converter itself is a one-time ~31 MB download on your first
            conversion, cached by the browser afterwards. Once it's loaded,
            everything works offline.
          </p>
        </ToolProse>
      )}
    </div>
  );
}
