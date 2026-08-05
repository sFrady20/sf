//number base conversions, one from/to pair = one seo page at /tools/base/[pair]
//bigint underneath so 256-bit hashes convert as happily as 255

export type NumberBase = {
  slug: string;
  label: string;
  radix: 2 | 8 | 10 | 16;
  //prefix people paste in (0x etc), stripped on parse
  prefix: string;
  sample: string;
  digits: RegExp;
  //a couple of plain sentences for the seo prose under the tool
  about: string;
};

export const numberBases: NumberBase[] = [
  {
    slug: "binary",
    label: "Binary",
    radix: 2,
    prefix: "0b",
    sample: "11010110",
    digits: /^[01]+$/,
    about:
      "Binary is base 2 — every digit is a bit, 0 or 1. It's what hardware actually stores, and it surfaces anywhere bit flags, masks, or permissions do. Code usually writes it with a 0b prefix.",
  },
  {
    slug: "octal",
    label: "Octal",
    radix: 8,
    prefix: "0o",
    sample: "755",
    digits: /^[0-7]+$/,
    about:
      "Octal is base 8, using digits 0–7. Each octal digit maps to exactly three bits, which is why Unix file permissions like 755 are octal. Code writes it with a 0o prefix.",
  },
  {
    slug: "decimal",
    label: "Decimal",
    radix: 10,
    prefix: "",
    sample: "1024",
    digits: /^[0-9]+$/,
    about:
      "Decimal is base 10 — ordinary numbers. Most code displays values in decimal even when they're stored as bits underneath, so it's usually one side of any base conversion.",
  },
  {
    slug: "hex",
    label: "Hex",
    radix: 16,
    prefix: "0x",
    sample: "7c3aed",
    digits: /^[0-9a-f]+$/i,
    about:
      "Hexadecimal is base 16 — digits 0–9 then a–f. One hex digit is exactly four bits, so bytes read as tidy two-digit pairs. Colors, memory addresses, and hashes are all conventionally written in hex with a 0x prefix.",
  },
];

export const getBase = (slug: string) =>
  numberBases.find((b) => b.slug === slug);

//spaces and underscores are just formatting, prefixes are optional
export function parseInBase(input: string, base: NumberBase): bigint | null {
  let s = input.trim().toLowerCase().replace(/[\s_]/g, "");
  let negative = false;
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  }
  if (base.prefix && s.startsWith(base.prefix)) s = s.slice(base.prefix.length);
  if (s === "" || !base.digits.test(s)) return null;
  try {
    //bigint reads 0x/0o/0b natively, decimal needs no prefix
    const v = BigInt(`${base.prefix}${s}`);
    return negative ? -v : v;
  } catch {
    return null;
  }
}

export const formatInBase = (value: bigint, base: NumberBase) =>
  value < 0n ? `-${(-value).toString(base.radix)}` : value.toString(base.radix);

//explicit prefixes identify a pasted number no matter the selected mode
export function detectBase(input: string): string | null {
  const t = input.trim().toLowerCase().replace(/^-/, "");
  if (t.startsWith("0x")) return "hex";
  if (t.startsWith("0b")) return "binary";
  if (t.startsWith("0o")) return "octal";
  return null;
}

export type BasePair = { slug: string; from: NumberBase; to: NumberBase };

export const basePairs: BasePair[] = numberBases.flatMap((from) =>
  numberBases
    .filter((to) => to.slug !== from.slug)
    .map((to) => ({ slug: `${from.slug}-to-${to.slug}`, from, to })),
);

export const getBasePair = (slug: string) =>
  basePairs.find((p) => p.slug === slug);
