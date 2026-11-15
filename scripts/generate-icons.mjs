//renders every icon size from src/app/icon.svg so nobody has to open figma again
//run with `bun run icons`

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = join(root, "src/app");
const pub = join(root, "public/icons");

const BG = "#171717";
const FG = "#DDDDDD";

const source = await readFile(join(app, "icon.svg"), "utf8");
const [, w] = source.match(/viewBox="0 0 (\d+) \d+"/);
const S = Number(w);
const glyph = [...source.matchAll(/<path d="[^"]+" fill="#DDDDDD"\/>/g)]
  .map((m) => m[0])
  .join("");
if (!glyph) throw new Error("no glyph paths in icon.svg, someone redrew it");

//full bleed square, glyph scaled around the middle
const bleed = (scale) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}">` +
  `<rect width="${S}" height="${S}" fill="${BG}"/>` +
  `<g transform="translate(${(S * (1 - scale)) / 2} ${(S * (1 - scale)) / 2}) scale(${scale})">${glyph}</g>` +
  `</svg>`;

//renders at 2x+ then squishes down, crisper edges
const png = (svg, size, { intrinsic = S, opaque = false } = {}) => {
  const img = sharp(Buffer.from(svg), {
    density: 72 * Math.max(1, (size * 2) / intrinsic),
  }).resize(size, size);
  //full bleed stuff has no business carrying an alpha channel
  return (opaque ? img.flatten({ background: BG }) : img)
    .png({ compressionLevel: 9 })
    .toBuffer();
};

//ico that just wraps pngs, every browser since vista is fine with it
const ico = (pngs) => {
  const head = Buffer.alloc(6 + pngs.length * 16);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(pngs.length, 4);
  let offset = head.length;
  pngs.forEach(({ size, buf }, i) => {
    const o = 6 + i * 16;
    head.writeUInt8(size >= 256 ? 0 : size, o);
    head.writeUInt8(size >= 256 ? 0 : size, o + 1);
    head.writeUInt8(0, o + 2);
    head.writeUInt8(0, o + 3);
    head.writeUInt16LE(1, o + 4);
    head.writeUInt16LE(32, o + 6);
    head.writeUInt32LE(buf.length, o + 8);
    head.writeUInt32LE(offset, o + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.buf)]);
};

//remix glyph on a dark tile, glyph stays inside the maskable safe zone
const ri = require("@iconify-json/ri/icons.json");
const tile = (name, size) => {
  const icon = ri.icons[name];
  if (!icon) throw new Error(`ri--${name} doesnt exist`);
  const box = icon.width ?? ri.width ?? 24;
  const body = icon.body.replaceAll("currentColor", FG);
  const g = size / 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">` +
    `<rect width="${size}" height="${size}" fill="${BG}"/>` +
    `<g transform="translate(${(size - g) / 2} ${(size - g) / 2}) scale(${g / box})">${body}</g>` +
    `</svg>`
  );
};

//keep in sync with the shortcuts in src/app/manifest.ts
const shortcuts = {
  shaders: "sparkling-2-line",
  tools: "tools-line",
  palette: "palette-line",
  uses: "macbook-line",
};

await mkdir(pub, { recursive: true });

const out = [];
const put = async (path, buf) => {
  await writeFile(path, buf);
  out.push(path.replace(root, "").replaceAll("\\", "/"));
};

//favicon.ico, the old faithful
const small = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, buf: await png(source, size) })),
);
await put(join(app, "favicon.ico"), ico(small));

//ios rounds the corners itself and turns transparency black, so full bleed
await put(join(app, "apple-icon.png"), await png(bleed(1), 180, { opaque: true }));

//manifest icons
for (const size of [192, 512]) {
  await put(join(pub, `icon-${size}.png`), await png(source, size));
  //glyph shrunk to 0.8 so it survives any mask shape
  await put(
    join(pub, `icon-maskable-${size}.png`),
    await png(bleed(0.8), size, { opaque: true }),
  );
}

//shortcut tiles
for (const [slug, name] of Object.entries(shortcuts)) {
  for (const size of [96, 192]) {
    await put(
      join(pub, `shortcut-${slug}-${size}.png`),
      await png(tile(name, size), size, { intrinsic: size, opaque: true }),
    );
  }
}

console.log(out.join("\n"));
