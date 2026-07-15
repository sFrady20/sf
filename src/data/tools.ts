import { conversionPairs } from "@/app/(main)/tools/convert/formats";
import { generators } from "@/app/(main)/tools/generate/generators";
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

const textGroupMeta: Record<string, { title: string; icon: string; description: string; keywords: string }> = {
  "Change Case": {
    title: "Case Converter",
    icon: "icon-[ri--font-size-2]",
    description:
      "Convert text between UPPERCASE, camelCase, snake_case, kebab-case, slugs, and more.",
    keywords: "case converter, uppercase, camelcase, snake case, kebab case, slugify",
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
};

export const toolCategories: ToolCategory[] = [
  {
    id: "text",
    label: "Text & Data",
    icon: "icon-[ri--text]",
    tools: textTransformGroups.map((group) => {
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
      description: g.description.replace(/^Free online /, "").replace(/^./, (c) => c.toUpperCase()),
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
  "/tools/resize",
  "/tools/icon-set",
  "/tools/palette",
  "/tools/shader-fn-lib",
  ...textTransforms.map((t) => `/tools/text/${t.slug}`),
  ...generators.map((g) => `/tools/generate/${g.slug}`),
  ...conversionPairs.map((p) => `/tools/convert/${p.slug}`),
];
