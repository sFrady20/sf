import { Metadata } from "next";
import Link from "next/link";
import { ToolShell } from "../shell";
import { AudioConverter } from "./components";
import { audioPairs } from "./formats";

export const metadata: Metadata = {
  title: "Free Online Audio Converter - Steven Frady",
  description:
    "Convert audio between MP3, WAV, AIFF, FLAC, OGG, M4A, and Opus, or extract audio from MP4, MOV, WebM, and MKV video. Runs in your browser — files never uploaded.",
  keywords:
    "audio converter, convert mp3, convert wav, aiff to wav, convert flac, mp4 to mp3, extract audio from video, online audio conversion",
  alternates: { canonical: "https://www.stevenfrady.com/tools/audio" },
};

export default async function () {
  return (
    <ToolShell>
      {/* the pair links ride in as a prop so the article lands under them */}
      <AudioConverter
        related={
          <div className="flex flex-col gap-3 mt-4">
            <div className="text-sm opacity-70">Popular conversions</div>
            <div className="flex flex-row flex-wrap gap-2">
              {audioPairs.map((p) => (
                <Link
                  key={p.slug}
                  href={`/tools/audio/${p.slug}`}
                  className="text-xs bg-foreground/5 hover:bg-foreground/15 border rounded-full px-3 py-1.5 transition"
                >
                  {p.from.label} → {p.to.label}
                </Link>
              ))}
            </div>
          </div>
        }
      />
    </ToolShell>
  );
}
