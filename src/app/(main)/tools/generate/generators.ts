//random generators, one entry = one seo page at /tools/generate/[slug]

export type GeneratorOption =
  | {
      key: string;
      label: string;
      type: "number";
      min: number;
      max: number;
      defaultValue: number;
    }
  | { key: string; label: string; type: "boolean"; defaultValue: boolean };

export type GeneratorOptions = Record<string, number | boolean>;

export type Generator = {
  slug: string;
  label: string;
  title: string;
  description: string;
  keywords: string;
  mono?: boolean;
  options: GeneratorOption[];
  generate: (opts: GeneratorOptions) => string[];
};

//unbiased random int in [0, max) via rejection sampling
const randomInt = (max: number) => {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
};

const pick = (chars: string) => chars[randomInt(chars.length)];

const randomHexBytes = (bytes: number) =>
  Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};

const LOREM_WORDS =
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(
    " ",
  );

const loremSentence = () => {
  const len = 8 + randomInt(7);
  const words = Array.from(
    { length: len },
    () => LOREM_WORDS[randomInt(LOREM_WORDS.length)],
  );
  return (
    words.join(" ").replace(/^./, (c) => c.toUpperCase()) + "."
  );
};

export const generators: Generator[] = [
  {
    slug: "password",
    label: "Password",
    title: "Strong Password Generator",
    description:
      "Free online strong password generator. Cryptographically secure random passwords created entirely in your browser — nothing is sent to a server.",
    keywords:
      "password generator, strong password, secure random password, create password online",
    mono: true,
    options: [
      { key: "length", label: "Length", type: "number", min: 4, max: 128, defaultValue: 20 },
      { key: "count", label: "How many", type: "number", min: 1, max: 20, defaultValue: 5 },
      { key: "lowercase", label: "a-z", type: "boolean", defaultValue: true },
      { key: "uppercase", label: "A-Z", type: "boolean", defaultValue: true },
      { key: "digits", label: "0-9", type: "boolean", defaultValue: true },
      { key: "symbols", label: "!@#$", type: "boolean", defaultValue: true },
    ],
    generate: (opts) => {
      const pool = (
        ["lowercase", "uppercase", "digits", "symbols"] as const
      ).filter((k) => opts[k]);
      if (pool.length === 0) return [];
      const length = opts.length as number;
      return Array.from({ length: opts.count as number }, () => {
        //guarantee one char from each enabled set, fill the rest from all
        const all = pool.map((k) => CHARSETS[k]).join("");
        const chars = [
          ...pool.map((k) => pick(CHARSETS[k])),
          ...Array.from(
            { length: Math.max(0, length - pool.length) },
            () => pick(all),
          ),
        ];
        //shuffle so the guaranteed chars don't cluster at the front
        for (let i = chars.length - 1; i > 0; i--) {
          const j = randomInt(i + 1);
          [chars[i], chars[j]] = [chars[j], chars[i]];
        }
        return chars.slice(0, length).join("");
      });
    },
  },
  {
    slug: "uuid",
    label: "UUID",
    title: "UUID v4 Generator",
    description:
      "Free online UUID v4 generator. Create one or many random universally unique identifiers, generated locally in your browser.",
    keywords: "uuid generator, uuid v4, guid generator, random uuid online",
    mono: true,
    options: [
      { key: "count", label: "How many", type: "number", min: 1, max: 50, defaultValue: 5 },
      { key: "uppercase", label: "Uppercase", type: "boolean", defaultValue: false },
    ],
    generate: (opts) =>
      Array.from({ length: opts.count as number }, () => {
        const id = crypto.randomUUID();
        return opts.uppercase ? id.toUpperCase() : id;
      }),
  },
  {
    slug: "hex-color",
    label: "Hex Color",
    title: "Random Hex Color Generator",
    description:
      "Free online random hex color generator. Create random #RRGGBB color codes for palettes, placeholders, and inspiration.",
    keywords: "random hex color, color generator, random color code",
    mono: true,
    options: [
      { key: "count", label: "How many", type: "number", min: 1, max: 50, defaultValue: 10 },
    ],
    generate: (opts) =>
      Array.from(
        { length: opts.count as number },
        () => `#${randomHexBytes(3)}`,
      ),
  },
  {
    slug: "hex-string",
    label: "Hex String",
    title: "Random Hex String Generator",
    description:
      "Free online random hex string generator. Create cryptographically secure random hex bytes for tokens, keys, and salts — all in your browser.",
    keywords:
      "random hex string, random bytes, hex token generator, secret key generator",
    mono: true,
    options: [
      { key: "bytes", label: "Bytes", type: "number", min: 1, max: 128, defaultValue: 16 },
      { key: "count", label: "How many", type: "number", min: 1, max: 20, defaultValue: 5 },
    ],
    generate: (opts) =>
      Array.from({ length: opts.count as number }, () =>
        randomHexBytes(opts.bytes as number),
      ),
  },
  {
    slug: "lorem-ipsum",
    label: "Lorem Ipsum",
    title: "Lorem Ipsum Generator",
    description:
      "Free online lorem ipsum generator. Create paragraphs of placeholder text for mockups and layouts.",
    keywords: "lorem ipsum generator, placeholder text, dummy text",
    options: [
      { key: "paragraphs", label: "Paragraphs", type: "number", min: 1, max: 20, defaultValue: 3 },
    ],
    generate: (opts) =>
      Array.from({ length: opts.paragraphs as number }, (_, i) => {
        const sentences = Array.from(
          { length: 4 + randomInt(4) },
          loremSentence,
        );
        //tradition demands the first paragraph opens properly
        if (i === 0)
          sentences[0] =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        return sentences.join(" ");
      }),
  },
];

export const getGenerator = (slug: string) =>
  generators.find((g) => g.slug === slug);
