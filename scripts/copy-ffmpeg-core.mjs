//self-host the ffmpeg.wasm core so the audio tool doesn't lean on a cdn.
//runs on postinstall, lands in public/ffmpeg which stays out of git
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "@ffmpeg", "core", "dist", "umd");
const dest = join(root, "public", "ffmpeg");

mkdirSync(dest, { recursive: true });
for (const f of ["ffmpeg-core.js", "ffmpeg-core.wasm"]) {
  cpSync(join(src, f), join(dest, f));
}
