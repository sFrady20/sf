//color space conversions, one from/to pair = one seo page at /tools/color/[pair]
//all hand-rolled and dependency-free - hex/rgb/hsl are the classics, oklch
//uses björn ottosson's oklab matrices

//srgb floats 0-1 plus alpha, the canonical middle everything converts through
export type Rgba = [number, number, number, number];

type Rgb = [number, number, number];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const toSrgb = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h =
    max === r
      ? ((g - b) / d) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r, g, b] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x];
  const m = l - c / 2;
  return [clamp01(r + m), clamp01(g + m), clamp01(b + m)];
}

function rgbToOklch(rgb: Rgb): [number, number, number] {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

//out-of-gamut oklch clamps per channel, same as what browsers render
function oklchToRgb(L: number, C: number, H: number): Rgb {
  const hr = (H * Math.PI) / 180;
  const a = Math.cos(hr) * C;
  const bb = Math.sin(hr) * C;
  const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [clamp01(toSrgb(r)), clamp01(toSrgb(g)), clamp01(toSrgb(b))];
}

//pull numeric tokens out of whatever punctuation the user typed
const nums = (input: string) =>
  (input.match(/-?\d*\.?\d+%?/g) ?? []).map((t) => ({
    value: parseFloat(t),
    pct: t.endsWith("%"),
  }));

const trim = (x: number, decimals: number) => Number(x.toFixed(decimals));

//4th token, when present, is alpha - raw 0-1 or a percentage
const alphaFrom = (t: { value: number; pct: boolean }[]) =>
  t.length === 4 ? clamp01(t[3].pct ? t[3].value / 100 : t[3].value) : 1;

export type ColorSpace = {
  slug: string;
  label: string;
  //what an unreadable input should suggest
  sample: string;
  //a couple of plain sentences for the seo prose under the tool
  about: string;
  parse: (input: string) => Rgba | null;
  format: (rgba: Rgba) => string;
};

export const colorSpaces: ColorSpace[] = [
  {
    slug: "hex",
    label: "HEX",
    sample: "#7c3aed",
    about:
      "HEX colors are six hexadecimal digits — two each for red, green, and blue — usually prefixed with #. A three-digit shorthand doubles each digit, and an optional fourth pair adds alpha, so #7c3aed80 is the same purple at half opacity.",
    parse: (input) => {
      const m = input.trim().match(/^#?([0-9a-f]{3,8})$/i);
      if (!m) return null;
      let hex = m[1];
      //3/4 digit shorthand doubles up, 4 and 8 digit forms carry alpha
      if (hex.length === 3 || hex.length === 4)
        hex = [...hex].map((c) => c + c).join("");
      if (hex.length !== 6 && hex.length !== 8) return null;
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      const n = parseInt(hex.slice(0, 6), 16);
      return [
        ((n >> 16) & 255) / 255,
        ((n >> 8) & 255) / 255,
        (n & 255) / 255,
        a,
      ];
    },
    format: ([r, g, b, a]) => {
      const byte = (c: number) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, "0");
      return `#${byte(r)}${byte(g)}${byte(b)}${a < 1 ? byte(a) : ""}`;
    },
  },
  {
    slug: "rgb",
    label: "RGB",
    sample: "rgb(124, 58, 237)",
    about:
      "RGB lists red, green, and blue as numbers from 0 to 255, matching how screens mix light. It's the format most APIs, canvas code, and design tools expect, and rgba() adds an opacity value from 0 to 1.",
    parse: (input) => {
      const t = nums(input);
      if (t.length !== 3 && t.length !== 4) return null;
      const ch = t
        .slice(0, 3)
        .map(({ value, pct }) => clamp01(pct ? value / 100 : value / 255));
      return [ch[0], ch[1], ch[2], alphaFrom(t)];
    },
    format: ([r, g, b, a]) => {
      const ch = [r, g, b].map((c) => Math.round(c * 255));
      return a < 1
        ? `rgba(${ch[0]}, ${ch[1]}, ${ch[2]}, ${trim(a, 3)})`
        : `rgb(${ch[0]}, ${ch[1]}, ${ch[2]})`;
    },
  },
  {
    slug: "hsl",
    label: "HSL",
    sample: "hsl(262, 83%, 58%)",
    about:
      "HSL describes a color by hue (0–360 on the color wheel), saturation, and lightness. It's easier to reason about than raw channels — rotating a hue or dimming a color is a single number change — which makes it popular for theming.",
    parse: (input) => {
      const t = nums(input);
      if (t.length !== 3 && t.length !== 4) return null;
      return [
        ...hslToRgb(
          t[0].value,
          clamp01(t[1].value / 100),
          clamp01(t[2].value / 100),
        ),
        alphaFrom(t),
      ];
    },
    format: ([r, g, b, a]) => {
      const [h, s, l] = rgbToHsl([r, g, b]);
      const core = `${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
      return a < 1 ? `hsla(${core}, ${trim(a, 3)})` : `hsl(${core})`;
    },
  },
  {
    slug: "oklch",
    label: "OKLCH",
    sample: "oklch(0.541 0.247 293)",
    about:
      "OKLCH is the perceptual color space from CSS Color 4 — lightness, chroma, and hue that track how colors actually look. Equal lightness values appear equally bright, which makes it the best base for design systems and generated palettes. Every modern browser supports it.",
    parse: (input) => {
      const t = nums(input);
      if (t.length !== 3 && t.length !== 4) return null;
      //css allows lightness as a percentage
      const L = clamp01(t[0].pct ? t[0].value / 100 : t[0].value);
      return [
        ...oklchToRgb(L, Math.max(0, t[1].value), t[2].value),
        alphaFrom(t),
      ];
    },
    format: ([r, g, b, a]) => {
      const [L, C, H] = rgbToOklch([r, g, b]);
      const core = `${trim(L, 3)} ${trim(C, 3)} ${trim(H, 1)}`;
      return a < 1 ? `oklch(${core} / ${trim(a, 3)})` : `oklch(${core})`;
    },
  },
];

export const getSpace = (slug: string) =>
  colorSpaces.find((s) => s.slug === slug);

//explicit prefixes identify a pasted color no matter which mode is selected
export function detectSpace(input: string): string | null {
  const t = input.trim().toLowerCase();
  const m = t.match(/^(rgba?|hsla?|oklch)\(/);
  if (m) return m[1] === "oklch" ? m[1] : m[1].replace(/a$/, "");
  if (/^#[0-9a-f]{3,8}$/.test(t)) return "hex";
  return null;
}

//compact ?color= form - bare hex digits or comma-joined numbers, nothing
//that needs percent-encoding. the pair in the path pins the space
export function toColorParam(space: ColorSpace, rgba: Rgba): string {
  const formatted = space.format(rgba);
  if (space.slug === "hex") return formatted.slice(1);
  return (formatted.match(/-?\d*\.?\d+/g) ?? []).join(",");
}

export type ColorPair = { slug: string; from: ColorSpace; to: ColorSpace };

export const colorPairs: ColorPair[] = colorSpaces.flatMap((from) =>
  colorSpaces
    .filter((to) => to.slug !== from.slug)
    .map((to) => ({ slug: `${from.slug}-to-${to.slug}`, from, to })),
);

export const getColorPair = (slug: string) =>
  colorPairs.find((p) => p.slug === slug);
