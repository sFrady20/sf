import { basePairs } from "@/app/(main)/tools/base/bases";
import { colorPairs } from "@/app/(main)/tools/color/spaces";
import { conversionPairs } from "@/app/(main)/tools/convert/formats";
import { cronPresets } from "@/app/(main)/tools/cron/cron";
import { generators } from "@/app/(main)/tools/generate/generators";
import { hashAlgos } from "@/app/(main)/tools/hash/hashes";
import {
  textTransformGroups,
  textTransforms,
} from "@/app/(main)/tools/text/transforms";

//single source of truth for the tools index, cmd+k palette, and sitemap

export type ToolVariant = { href: string; label: string };

export type Tool = {
  href: string;
  title: string;
  description: string;
  icon: string;
  keywords: string;
  variants?: ToolVariant[];
};

export type ToolCategory = {
  id: string;
  label: string;
  icon: string;
  tools: Tool[];
};

const textGroupMeta: Record<
  string,
  { title: string; icon: string; description: string; keywords: string }
> = {
  "Change Case": {
    title: "Case Converter",
    icon: "icon-[ri--font-size-2]",
    description:
      "Convert text between UPPERCASE, camelCase, snake_case, kebab-case, slugs, and more.",
    keywords:
      "case converter, uppercase, camelcase, snake case, kebab case, slugify",
  },
  "Whitespace & Lines": {
    title: "Whitespace & Line Tools",
    icon: "icon-[ri--align-left]",
    description:
      "Trim whitespace, collapse spaces, dedupe and sort lines, remove line breaks.",
    keywords: "trim whitespace, remove line breaks, sort lines, dedupe lines",
  },
  "Data Formats": {
    title: "Encode, Decode & Format",
    icon: "icon-[ri--code-s-slash-line]",
    description:
      "Format and minify JSON, encode and decode Base64, URLs, and HTML entities.",
    keywords: "json formatter, base64, url encode, html entities",
  },
};

const generatorIcons: Record<string, string> = {
  password: "icon-[ri--key-2-line]",
  uuid: "icon-[ri--fingerprint-line]",
  "hex-color": "icon-[ri--palette-line]",
  "hex-string": "icon-[ri--hashtag]",
  "lorem-ipsum": "icon-[ri--file-text-line]",
  name: "icon-[ri--user-3-line]",
  email: "icon-[ri--mail-line]",
  "phone-number": "icon-[ri--phone-line]",
  "ip-address": "icon-[ri--global-line]",
  "mac-address": "icon-[ri--router-line]",
  "credit-card": "icon-[ri--bank-card-line]",
  date: "icon-[ri--calendar-line]",
};

export const toolCategories: ToolCategory[] = [
  {
    id: "text",
    label: "Text & Data",
    icon: "icon-[ri--text]",
    tools: [
      ...textTransformGroups.map((group) => {
        const meta = textGroupMeta[group];
        const members = textTransforms.filter((t) => t.group === group);
        return {
          href: `/tools/text/${members[0].slug}`,
          title: meta.title,
          description: meta.description,
          icon: meta.icon,
          keywords: `${meta.keywords} ${members.map((t) => t.label).join(" ")}`,
          variants: members.map((t) => ({
            href: `/tools/text/${t.slug}`,
            label: t.label,
          })),
        };
      }),
      {
        href: "/tools/cron",
        title: "Cron Expression Explainer",
        description:
          "Type a cron schedule, get plain English, a field breakdown, and the next run times.",
        icon: "icon-[ri--time-line]",
        keywords:
          "cron expression, crontab, cron schedule, cron every 5 minutes " +
          cronPresets.map((p) => p.slug).join(" "),
        variants: cronPresets.map((p) => ({
          href: `/tools/cron/${p.slug}`,
          label: p.label,
        })),
      },
      {
        href: "/tools/base",
        title: "Number Base Converter",
        description:
          "Convert numbers between binary, octal, decimal, and hex — any size, via BigInt.",
        icon: "icon-[ri--calculator-line]",
        keywords:
          "number base converter, binary to decimal, decimal to hex, hex to binary, radix " +
          basePairs.map((p) => p.slug).join(" "),
        variants: basePairs.map((p) => ({
          href: `/tools/base/${p.slug}`,
          label: `${p.from.label} → ${p.to.label}`,
        })),
      },
      {
        href: "/tools/hash/sha256",
        title: "Hash Generator",
        description:
          "MD5, SHA-1, SHA-256, SHA-384, and SHA-512 digests of any text, computed in your browser.",
        icon: "icon-[ri--shield-keyhole-line]",
        keywords:
          "hash generator, md5, sha1, sha256, sha512, checksum, hash text online",
        variants: hashAlgos.map((a) => ({
          href: `/tools/hash/${a.slug}`,
          label: a.label,
        })),
      },
      {
        href: "/tools/timestamp",
        title: "Unix Timestamp Converter",
        description:
          "Epoch seconds, millis, or micros to human dates and back — with a live current timestamp.",
        icon: "icon-[ri--time-zone-line]",
        keywords:
          "unix timestamp converter, epoch converter, timestamp to date, current unix time",
      },
      {
        href: "/tools/jwt",
        title: "JWT Decoder",
        description:
          "Inspect a JSON Web Token's header and claims without it ever leaving your browser.",
        icon: "icon-[ri--braces-line]",
        keywords:
          "jwt decoder, decode jwt, json web token, jwt claims, jwt debugger",
      },
      {
        href: "/tools/word-counter",
        title: "Word Counter",
        description:
          "Live word, character, sentence, and paragraph counts with reading time.",
        icon: "icon-[ri--character-recognition-line]",
        keywords:
          "word counter, character counter, count words, sentence counter, reading time",
      },
      {
        href: "/tools/diff",
        title: "Text Diff Checker",
        description:
          "Compare two versions of a text line by line, entirely in your browser.",
        icon: "icon-[ri--contrast-line]",
        keywords: "diff checker, text compare, compare texts, text difference",
      },
    ],
  },
  {
    id: "images",
    label: "Images & Icons",
    icon: "icon-[ri--image-line]",
    tools: [
      {
        href: "/tools/convert",
        title: "Image Converter",
        description:
          "Convert images between PNG, JPG, WebP, and AVIF with quality control.",
        icon: "icon-[ri--exchange-2-line]",
        keywords:
          "image converter, png to webp, jpg to png, avif converter " +
          conversionPairs.map((p) => p.slug).join(" "),
        variants: conversionPairs.map((p) => ({
          href: `/tools/convert/${p.slug}`,
          label: `${p.from.label} → ${p.to.label}`,
        })),
      },
      {
        href: "/tools/resize",
        title: "Image Resizer",
        description:
          "Resize images to exact dimensions — crop, letterbox, or stretch.",
        icon: "icon-[ri--aspect-ratio-line]",
        keywords: "image resizer, resize image, scale image, crop",
      },
      {
        href: "/tools/icon-set",
        title: "App Icon Set Generator",
        description:
          "One image in, complete icon sets out — PWA, Expo / React Native, and Android, with JSON configs.",
        icon: "icon-[ri--apps-2-line]",
        keywords:
          "app icon generator, pwa icons, expo icons, react native, android launcher, webmanifest",
      },
    ],
  },
  {
    id: "generators",
    label: "Generators",
    icon: "icon-[ri--shuffle-line]",
    tools: generators.map((g) => ({
      href: `/tools/generate/${g.slug}`,
      title: g.title,
      description: g.description
        .replace(/^Free online /, "")
        .replace(/^./, (c) => c.toUpperCase()),
      icon: generatorIcons[g.slug] ?? "icon-[ri--shuffle-line]",
      keywords: g.keywords,
    })),
  },
  {
    id: "creative",
    label: "Color & Shaders",
    icon: "icon-[ri--paint-brush-line]",
    tools: [
      {
        href: "/tools/color",
        title: "Color Converter",
        description:
          "Convert colors between HEX, RGB, HSL, and OKLCH — paste one format, copy any other.",
        icon: "icon-[ri--contrast-drop-line]",
        keywords:
          "color converter, hex to rgb, rgba to hex, rgb to hsl, hex to oklch, css colors, alpha, transparency " +
          colorPairs.map((p) => p.slug).join(" "),
        variants: colorPairs.map((p) => ({
          href: `/tools/color/${p.slug}`,
          label: `${p.from.label} → ${p.to.label}`,
        })),
      },
      {
        href: "/tools/palette",
        title: "Procedural Shader Palette Generator",
        description:
          "Create customizable color palettes for GLSL shaders using a simple cosine-based formula.",
        icon: "icon-[ri--palette-line]",
        keywords: "glsl palette, cosine palette, shader colors",
      },
      {
        href: "/tools/shader-fn-lib",
        title: "Shader Function Library",
        description:
          "Explore 2D and 3D SDFs, ops, transformations, and other GLSL shader functions.",
        icon: "icon-[ri--functions]",
        keywords: "glsl functions, sdf library, shader snippets",
      },
    ],
  },
];

export const allTools = toolCategories.flatMap((c) => c.tools);

//every indexable tool route, for the sitemap
export const toolRoutes: string[] = [
  "/tools",
  "/tools/convert",
  "/tools/color",
  "/tools/cron",
  "/tools/base",
  "/tools/timestamp",
  "/tools/jwt",
  "/tools/word-counter",
  "/tools/diff",
  "/tools/resize",
  "/tools/icon-set",
  "/tools/palette",
  "/tools/shader-fn-lib",
  ...textTransforms.map((t) => `/tools/text/${t.slug}`),
  ...generators.map((g) => `/tools/generate/${g.slug}`),
  ...conversionPairs.map((p) => `/tools/convert/${p.slug}`),
  ...colorPairs.map((p) => `/tools/color/${p.slug}`),
  ...cronPresets.map((p) => `/tools/cron/${p.slug}`),
  ...basePairs.map((p) => `/tools/base/${p.slug}`),
  ...hashAlgos.map((a) => `/tools/hash/${a.slug}`),
];
