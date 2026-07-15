//pure text transforms, one entry = one seo page at /tools/text/[slug]

export type TextTransform = {
  slug: string;
  label: string;
  title: string;
  description: string;
  keywords: string;
  group: string;
  placeholder?: string;
  //syntax highlight hints, otherwise auto-detect handles it
  inputLanguage?: string;
  outputLanguage?: string;
  apply: (input: string) => string;
};

//split into words for case conversions, handles camel, snake, kebab, spaces
const words = (input: string) =>
  input
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

const capitalize = (w: string) =>
  w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

//per-line helper, keeps trailing structure intact
const byLine = (fn: (lines: string[]) => string[]) => (input: string) =>
  fn(input.split(/\r?\n/)).join("\n");

export const textTransforms: TextTransform[] = [
  //cases
  {
    slug: "uppercase",
    label: "UPPERCASE",
    title: "Convert Text to UPPERCASE",
    description:
      "Free online tool to convert any text to uppercase letters instantly. Paste your text and copy the result.",
    keywords: "uppercase converter, capital letters, all caps",
    group: "Change Case",
    apply: (x) => x.toUpperCase(),
  },
  {
    slug: "lowercase",
    label: "lowercase",
    title: "Convert Text to lowercase",
    description:
      "Free online tool to convert any text to lowercase letters instantly. Paste your text and copy the result.",
    keywords: "lowercase converter, small letters",
    group: "Change Case",
    apply: (x) => x.toLowerCase(),
  },
  {
    slug: "title-case",
    label: "Title Case",
    title: "Convert Text to Title Case",
    description:
      "Free online tool to convert text to title case, capitalizing the first letter of every word.",
    keywords: "title case converter, capitalize words, headline case",
    group: "Change Case",
    apply: (x) =>
      x.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1)),
  },
  {
    slug: "sentence-case",
    label: "Sentence case",
    title: "Convert Text to Sentence case",
    description:
      "Free online tool to convert text to sentence case, capitalizing only the first letter of each sentence.",
    keywords: "sentence case converter, capitalize sentences",
    group: "Change Case",
    apply: (x) =>
      x
        .toLowerCase()
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase()),
  },
  {
    slug: "camel-case",
    label: "camelCase",
    title: "Convert Text to camelCase",
    description:
      "Free online camelCase converter. Turn any string, snake_case, or kebab-case into camelCase for variable names.",
    keywords: "camelcase converter, camel case, variable name",
    group: "Change Case",
    apply: (x) =>
      words(x)
        .map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w)))
        .join(""),
  },
  {
    slug: "pascal-case",
    label: "PascalCase",
    title: "Convert Text to PascalCase",
    description:
      "Free online PascalCase converter. Turn any string into PascalCase for class and component names.",
    keywords: "pascalcase converter, pascal case, upper camel case",
    group: "Change Case",
    apply: (x) => words(x).map(capitalize).join(""),
  },
  {
    slug: "snake-case",
    label: "snake_case",
    title: "Convert Text to snake_case",
    description:
      "Free online snake_case converter. Turn any string, camelCase, or kebab-case into snake_case.",
    keywords: "snakecase converter, snake case, underscore case",
    group: "Change Case",
    apply: (x) =>
      words(x)
        .map((w) => w.toLowerCase())
        .join("_"),
  },
  {
    slug: "kebab-case",
    label: "kebab-case",
    title: "Convert Text to kebab-case",
    description:
      "Free online kebab-case converter. Turn any string, camelCase, or snake_case into kebab-case for URLs and CSS.",
    keywords: "kebabcase converter, kebab case, dash case, css class",
    group: "Change Case",
    apply: (x) =>
      words(x)
        .map((w) => w.toLowerCase())
        .join("-"),
  },
  {
    slug: "constant-case",
    label: "CONSTANT_CASE",
    title: "Convert Text to CONSTANT_CASE",
    description:
      "Free online CONSTANT_CASE converter. Turn any string into SCREAMING_SNAKE_CASE for constants and env vars.",
    keywords: "constant case, screaming snake case, env var name",
    group: "Change Case",
    apply: (x) =>
      words(x)
        .map((w) => w.toUpperCase())
        .join("_"),
  },
  {
    slug: "slugify",
    label: "Slugify",
    title: "Slugify Text for URLs",
    description:
      "Free online slug generator. Convert any text into a clean, lowercase, URL-safe slug.",
    keywords: "slugify, url slug generator, seo friendly url",
    group: "Change Case",
    apply: (x) =>
      x
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
  },

  //whitespace + lines
  {
    slug: "trim-whitespace",
    label: "Trim Whitespace",
    title: "Trim Whitespace from Text",
    description:
      "Free online tool to trim leading and trailing whitespace from every line of your text.",
    keywords: "trim whitespace, remove spaces, strip text",
    group: "Whitespace & Lines",
    apply: byLine((lines) => lines.map((l) => l.trim())),
  },
  {
    slug: "remove-extra-spaces",
    label: "Remove Extra Spaces",
    title: "Remove Extra Spaces from Text",
    description:
      "Free online tool to collapse repeated spaces and tabs into single spaces.",
    keywords: "remove extra spaces, collapse whitespace, clean text",
    group: "Whitespace & Lines",
    apply: byLine((lines) => lines.map((l) => l.replace(/[ \t]+/g, " ").trim())),
  },
  {
    slug: "remove-line-breaks",
    label: "Remove Line Breaks",
    title: "Remove Line Breaks from Text",
    description:
      "Free online tool to remove all line breaks and join text into a single continuous line.",
    keywords: "remove line breaks, remove newlines, join lines",
    group: "Whitespace & Lines",
    apply: (x) => x.replace(/\s*\r?\n\s*/g, " ").trim(),
  },
  {
    slug: "remove-empty-lines",
    label: "Remove Empty Lines",
    title: "Remove Empty Lines from Text",
    description:
      "Free online tool to strip blank and whitespace-only lines from your text.",
    keywords: "remove empty lines, remove blank lines",
    group: "Whitespace & Lines",
    apply: byLine((lines) => lines.filter((l) => l.trim() !== "")),
  },
  {
    slug: "remove-duplicate-lines",
    label: "Remove Duplicate Lines",
    title: "Remove Duplicate Lines from Text",
    description:
      "Free online tool to deduplicate lines in a list while preserving the original order.",
    keywords: "remove duplicate lines, dedupe list, unique lines",
    group: "Whitespace & Lines",
    apply: byLine((lines) => Array.from(new Set(lines))),
  },
  {
    slug: "sort-lines",
    label: "Sort Lines",
    title: "Sort Lines Alphabetically",
    description:
      "Free online tool to sort the lines of your text alphabetically.",
    keywords: "sort lines, alphabetize list, sort text",
    group: "Whitespace & Lines",
    apply: byLine((lines) => [...lines].sort((a, b) => a.localeCompare(b))),
  },
  {
    slug: "reverse-text",
    label: "Reverse Text",
    title: "Reverse Text",
    description:
      "Free online tool to reverse the characters of your text. Works with unicode and emoji.",
    keywords: "reverse text, mirror text, backwards text",
    group: "Whitespace & Lines",
    apply: (x) => Array.from(x).reverse().join(""),
  },

  //data formats
  {
    slug: "json-format",
    label: "Format JSON",
    title: "JSON Formatter & Prettifier",
    description:
      "Free online JSON formatter. Validate and pretty-print JSON with 2-space indentation, right in your browser.",
    keywords: "json formatter, json prettifier, json beautifier, json validator",
    group: "Data Formats",
    placeholder: '{"paste":"your json here"}',
    inputLanguage: "json",
    outputLanguage: "json",
    apply: (x) => JSON.stringify(JSON.parse(x), null, 2),
  },
  {
    slug: "json-minify",
    label: "Minify JSON",
    title: "JSON Minifier",
    description:
      "Free online JSON minifier. Validate and strip all whitespace from JSON, right in your browser.",
    keywords: "json minifier, compact json, minify json online",
    group: "Data Formats",
    placeholder: '{ "paste": "your json here" }',
    inputLanguage: "json",
    outputLanguage: "json",
    apply: (x) => JSON.stringify(JSON.parse(x)),
  },
  {
    slug: "base64-encode",
    label: "Base64 Encode",
    title: "Base64 Encode Text",
    description:
      "Free online Base64 encoder. Convert text (including unicode) to Base64, right in your browser.",
    keywords: "base64 encode, base64 converter, text to base64",
    group: "Data Formats",
    apply: (x) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(x))),
  },
  {
    slug: "base64-decode",
    label: "Base64 Decode",
    title: "Base64 Decode Text",
    description:
      "Free online Base64 decoder. Convert Base64 back to plain text, right in your browser.",
    keywords: "base64 decode, base64 to text, decode base64 online",
    group: "Data Formats",
    placeholder: "aGVsbG8gd29ybGQ=",
    apply: (x) =>
      new TextDecoder().decode(
        Uint8Array.from(atob(x.trim()), (c) => c.charCodeAt(0)),
      ),
  },
  {
    slug: "url-encode",
    label: "URL Encode",
    title: "URL Encode Text",
    description:
      "Free online URL encoder. Percent-encode text for safe use in URLs and query strings.",
    keywords: "url encode, percent encoding, uri encode",
    group: "Data Formats",
    apply: (x) => encodeURIComponent(x),
  },
  {
    slug: "url-decode",
    label: "URL Decode",
    title: "URL Decode Text",
    description:
      "Free online URL decoder. Decode percent-encoded URLs and query strings back to plain text.",
    keywords: "url decode, percent decoding, uri decode",
    group: "Data Formats",
    placeholder: "hello%20world",
    apply: (x) => decodeURIComponent(x.replace(/\+/g, "%20")),
  },
  {
    slug: "html-encode",
    label: "HTML Encode",
    title: "HTML Encode Text",
    description:
      "Free online HTML entity encoder. Escape special characters like <, >, and & for safe embedding in HTML.",
    keywords: "html encode, escape html, html entities",
    group: "Data Formats",
    placeholder: "<div>hello & welcome</div>",
    inputLanguage: "xml",
    apply: (x) =>
      x
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;"),
  },
  {
    slug: "html-decode",
    label: "HTML Decode",
    title: "HTML Decode Text",
    description:
      "Free online HTML entity decoder. Convert HTML entities like &amp;lt; back to plain characters.",
    keywords: "html decode, unescape html, decode html entities",
    group: "Data Formats",
    placeholder: "&lt;div&gt;hello &amp; welcome&lt;/div&gt;",
    outputLanguage: "xml",
    apply: (x) =>
      x
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
        .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
          String.fromCodePoint(parseInt(n, 16)),
        )
        .replace(/&amp;/g, "&"),
  },
];

export const getTextTransform = (slug: string) =>
  textTransforms.find((t) => t.slug === slug);

//first-appearance order for the switcher optgroups
export const textTransformGroups = Array.from(
  new Set(textTransforms.map((t) => t.group)),
);
