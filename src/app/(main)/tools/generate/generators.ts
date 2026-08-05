//random generators, one entry = one seo page at /tools/generate/[slug]

export type GeneratorOption =
  | {
      key: string;
      label: string;
      type: "number";
      min: number;
      max: number;
      defaultValue: number;
      //one-tap chips for the values people actually want
      presets?: number[];
    }
  | { key: string; label: string; type: "boolean"; defaultValue: boolean };

export type GeneratorOptions = Record<string, number | boolean>;

export type Generator = {
  slug: string;
  label: string;
  title: string;
  description: string;
  keywords: string;
  //a couple of plain sentences for the seo prose under the tool
  about?: string;
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
  return words.join(" ").replace(/^./, (c) => c.toUpperCase()) + ".";
};

// --- mock data pools + helpers ---

const pickFrom = <T>(arr: T[]) => arr[randomInt(arr.length)];

//ascii-only on purpose so the email generator can reuse them
const FIRST_NAMES =
  "James Maria Wei Aisha Liam Sofia Noah Amara Lucas Yuki Elena Omar Ava Mateo Priya Ethan Zara Felix Ingrid Diego Chloe Ravi Nadia Oscar Freya Kenji Layla Marcus Anya Tomas Isla Jamal Vera Andre Mei Stefan Rosa Dmitri Hana Kofi".split(
    " ",
  );
const LAST_NAMES =
  "Smith Garcia Chen Okafor Johnson Rossi Kim Patel Brown Tanaka Novak Ali Martinez Wilson Nguyen Schmidt Silva Ivanov Dubois Kowalski Andersson Haddad Lopez Murphy Sato Osei Petrov Costa Larsen Khan Moreau Fischer Romano Diaz Yamamoto Berg Nakamura Olsen Vargas Adeyemi".split(
    " ",
  );

//rfc 2606 reserved domains, can never be real inboxes
const EMAIL_DOMAINS = ["example.com", "example.net", "example.org"];

//luhn check digit for a card number missing its last digit
const luhnDigit = (partial: string) => {
  let sum = 0;
  const digits = partial.split("").reverse();
  for (let i = 0; i < digits.length; i++) {
    let d = +digits[i];
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return (10 - (sum % 10)) % 10;
};

const CARD_BRANDS = {
  visa: { prefixes: ["4"], length: 16, cvcLength: 3 },
  mastercard: {
    prefixes: ["51", "52", "53", "54", "55"],
    length: 16,
    cvcLength: 3,
  },
  amex: { prefixes: ["34", "37"], length: 15, cvcLength: 4 },
  discover: { prefixes: ["6011"], length: 16, cvcLength: 3 },
};

const cardNumber = (brand: keyof typeof CARD_BRANDS) => {
  const { prefixes, length } = CARD_BRANDS[brand];
  let digits = pickFrom(prefixes);
  while (digits.length < length - 1) digits += randomInt(10);
  digits += luhnDigit(digits);
  //amex groups 4-6-5, everyone else 4-4-4-4
  return length === 15
    ? `${digits.slice(0, 4)} ${digits.slice(4, 10)} ${digits.slice(10)}`
    : digits.replace(/(.{4})(?=.)/g, "$1 ");
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
    about:
      "Passwords come from crypto.getRandomValues, the browser's cryptographically secure random source, with rejection sampling to avoid modulo bias. Every character set you enable is guaranteed to appear at least once, and the result is shuffled so those guaranteed characters don't cluster at the front. Nothing is stored or sent anywhere.",
    mono: true,
    options: [
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 4,
        max: 128,
        defaultValue: 20,
      },
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 20,
        defaultValue: 5,
      },
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
          ...Array.from({ length: Math.max(0, length - pool.length) }, () =>
            pick(all),
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
    about:
      "A UUID v4 contains 122 random bits, generated here with the browser's native crypto.randomUUID. The chance of two colliding is negligible for any realistic workload, which is why v4 UUIDs are the default for database keys and distributed ids.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 5,
      },
      {
        key: "uppercase",
        label: "Uppercase",
        type: "boolean",
        defaultValue: false,
      },
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
    about:
      "Each color is three cryptographically random bytes formatted as #RRGGBB, drawn uniformly across the whole RGB cube. Useful for placeholders, chart series, and the occasional accidental inspiration.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 10,
      },
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
    about:
      "Every byte comes from crypto.getRandomValues, so the output is suitable for session tokens, API secrets, and salts. 16 bytes (128 bits) covers most tokens, 32 bytes matches a SHA-256 key, and nothing you generate here leaves the browser.",
    mono: true,
    options: [
      {
        key: "bytes",
        label: "Bytes",
        type: "number",
        min: 1,
        max: 128,
        defaultValue: 16,
        presets: [16, 32, 64, 128],
      },
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 20,
        defaultValue: 5,
      },
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
    about:
      "Lorem ipsum is scrambled Latin from Cicero, used as placeholder text since the 1500s. Its word lengths roughly match English prose, which is exactly what makes it useful for judging a layout before the real copy exists.",
    options: [
      {
        key: "paragraphs",
        label: "Paragraphs",
        type: "number",
        min: 1,
        max: 20,
        defaultValue: 3,
      },
      {
        key: "sentences",
        label: "Sentences each",
        type: "number",
        min: 1,
        max: 15,
        defaultValue: 5,
      },
    ],
    generate: (opts) =>
      Array.from({ length: opts.paragraphs as number }, (_, i) => {
        const sentences = Array.from(
          { length: opts.sentences as number },
          loremSentence,
        );
        //tradition demands the first paragraph opens properly
        if (i === 0)
          sentences[0] =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
        return sentences.join(" ");
      }),
  },
  {
    slug: "name",
    label: "Name",
    title: "Random Name Generator",
    description:
      "Free online random name generator. Create realistic placeholder names for mockups, tests, and sample data.",
    keywords:
      "random name generator, fake name generator, placeholder names, test names, sample names",
    about:
      "Names combine a pool of common first and last names drawn from many languages and regions, so generated lists look plausibly diverse instead of ten variations of the same name. Any resemblance to a real person is coincidence.",
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 10,
      },
    ],
    generate: (opts) =>
      Array.from(
        { length: opts.count as number },
        () => `${pickFrom(FIRST_NAMES)} ${pickFrom(LAST_NAMES)}`,
      ),
  },
  {
    slug: "email",
    label: "Email",
    title: "Random Email Generator",
    description:
      "Free online random email generator. Fake addresses on reserved example domains — safe for mockups, seeds, and form testing because they can never be real inboxes.",
    keywords:
      "random email generator, fake email, test email address, placeholder email, sample emails",
    about:
      "Every address ends in example.com, example.net, or example.org — domains RFC 2606 reserves so they can never be registered. Seed a database with these and no test email can ever reach a real inbox.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 10,
      },
    ],
    generate: (opts) =>
      Array.from({ length: opts.count as number }, () => {
        const f = pickFrom(FIRST_NAMES).toLowerCase();
        const l = pickFrom(LAST_NAMES).toLowerCase();
        const local = pickFrom([
          `${f}.${l}`,
          `${f}${l}${randomInt(100)}`,
          `${f[0]}${l}`,
          `${f}_${l}`,
        ]);
        return `${local}@${pickFrom(EMAIL_DOMAINS)}`;
      }),
  },
  {
    slug: "phone-number",
    label: "Phone",
    title: "Random Phone Number Generator",
    description:
      "Free online random phone number generator. Fictional US numbers from the reserved 555-01XX range, so they never reach a real person.",
    keywords:
      "random phone number generator, fake phone number, test phone number, 555 number, placeholder phone",
    about:
      "All numbers come from the 555-01XX block, which the North American Numbering Plan reserves for fictional use — the same range films and TV use. Whatever you generate here cannot ring a real phone.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 10,
      },
      {
        key: "countryCode",
        label: "+1 prefix",
        type: "boolean",
        defaultValue: false,
      },
    ],
    generate: (opts) =>
      Array.from({ length: opts.count as number }, () => {
        //any area code except n11 service codes, always the fictional
        //555-0100..0199 block hollywood uses
        let area: number;
        do {
          area = 200 + randomInt(800);
        } while (area % 100 === 11);
        const line = `01${`${randomInt(100)}`.padStart(2, "0")}`;
        return opts.countryCode
          ? `+1 ${area} 555 ${line}`
          : `(${area}) 555-${line}`;
      }),
  },
  {
    slug: "ip-address",
    label: "IP Address",
    title: "Random IP Address Generator",
    description:
      "Free online random IP address generator. Create IPv4 addresses, private-range addresses, or IPv6 addresses from the reserved documentation prefix.",
    keywords:
      "random ip address generator, fake ip, test ip address, random ipv4, random ipv6, private ip",
    about:
      "IPv4 addresses avoid loopback and, unless you toggle it, the private RFC 1918 ranges. IPv6 addresses come from 2001:db8::/32, the prefix RFC 3849 reserves for documentation, so generated addresses route nowhere by design.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 10,
      },
      { key: "ipv6", label: "IPv6", type: "boolean", defaultValue: false },
      {
        key: "privateRange",
        label: "Private range",
        type: "boolean",
        defaultValue: false,
      },
    ],
    generate: (opts) =>
      Array.from({ length: opts.count as number }, () => {
        if (opts.ipv6) {
          //2001:db8::/32 is reserved for documentation, so these route nowhere
          const groups = Array.from({ length: 6 }, () =>
            randomInt(0x10000).toString(16),
          );
          return `2001:db8:${groups.join(":")}`;
        }
        const r = () => randomInt(256);
        if (opts.privateRange) {
          return pickFrom([
            `10.${r()}.${r()}.${r()}`,
            `172.${16 + randomInt(16)}.${r()}.${r()}`,
            `192.168.${r()}.${r()}`,
          ]);
        }
        //public-looking: skip loopback and the private blocks
        let a: number, b: number;
        do {
          a = 1 + randomInt(223);
          b = r();
        } while (
          a === 10 ||
          a === 127 ||
          (a === 172 && b >= 16 && b <= 31) ||
          (a === 192 && b === 168)
        );
        return `${a}.${b}.${r()}.${r()}`;
      }),
  },
  {
    slug: "mac-address",
    label: "MAC Address",
    title: "Random MAC Address Generator",
    description:
      "Free online random MAC address generator. Locally administered addresses that never collide with real hardware vendors.",
    keywords:
      "random mac address generator, fake mac address, test mac address, locally administered mac",
    about:
      "Every address has the locally administered bit set and the multicast bit clear, so it can never collide with a real vendor's hardware — the same convention operating systems use for MAC randomization.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 10,
      },
      {
        key: "uppercase",
        label: "Uppercase",
        type: "boolean",
        defaultValue: false,
      },
      { key: "dashes", label: "Dashes", type: "boolean", defaultValue: false },
    ],
    generate: (opts) =>
      Array.from({ length: opts.count as number }, () => {
        const bytes = Array.from({ length: 6 }, () => randomInt(256));
        //locally administered unicast bit pattern, so no vendor oui collisions
        bytes[0] = (bytes[0] & 0xfc) | 0x02;
        const mac = bytes
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(opts.dashes ? "-" : ":");
        return opts.uppercase ? mac.toUpperCase() : mac;
      }),
  },
  {
    slug: "credit-card",
    label: "Credit Card",
    title: "Test Credit Card Number Generator",
    description:
      "Free online test credit card number generator. Luhn-valid numbers for Visa, Mastercard, Amex, and Discover — they pass checkout form validation but aren't issued cards, so they can't be charged.",
    keywords:
      "test credit card numbers, fake credit card for testing, luhn valid card number, test visa number, payment form testing",
    about:
      "Numbers carry real brand prefixes and a valid Luhn check digit, so they pass checkout form validation — but they are not issued cards and cannot be charged. Use them to test payment forms, never to misrepresent a real payment method.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 20,
        defaultValue: 5,
      },
      { key: "visa", label: "Visa", type: "boolean", defaultValue: true },
      {
        key: "mastercard",
        label: "Mastercard",
        type: "boolean",
        defaultValue: true,
      },
      { key: "amex", label: "Amex", type: "boolean", defaultValue: true },
      {
        key: "discover",
        label: "Discover",
        type: "boolean",
        defaultValue: true,
      },
      {
        key: "details",
        label: "Expiry + CVC",
        type: "boolean",
        defaultValue: true,
      },
    ],
    generate: (opts) => {
      const brands = (
        Object.keys(CARD_BRANDS) as (keyof typeof CARD_BRANDS)[]
      ).filter((b) => opts[b]);
      if (brands.length === 0) return [];
      return Array.from({ length: opts.count as number }, () => {
        const brand = pickFrom(brands);
        const number = cardNumber(brand);
        if (!opts.details) return number;
        const mm = `${1 + randomInt(12)}`.padStart(2, "0");
        const yy = (new Date().getFullYear() % 100) + 1 + randomInt(5);
        const { cvcLength } = CARD_BRANDS[brand];
        const cvc = `${randomInt(10 ** cvcLength)}`.padStart(cvcLength, "0");
        return `${number} · ${mm}/${yy} · ${cvc}`;
      });
    },
  },
  {
    slug: "date",
    label: "Date",
    title: "Random Date Generator",
    description:
      "Free online random date generator. Create random ISO dates within a year range for fixtures, seeds, and sample data.",
    keywords:
      "random date generator, random date, test dates, sample dates, iso date generator",
    about:
      "Dates are drawn uniformly across the year range and formatted as ISO 8601 (YYYY-MM-DD), the least ambiguous choice for fixtures and seeds.",
    mono: true,
    options: [
      {
        key: "count",
        label: "How many",
        type: "number",
        min: 1,
        max: 50,
        defaultValue: 10,
      },
      {
        key: "fromYear",
        label: "From",
        type: "number",
        min: 1900,
        max: 2100,
        defaultValue: 1970,
      },
      {
        key: "toYear",
        label: "To",
        type: "number",
        min: 1900,
        max: 2100,
        defaultValue: 2030,
      },
    ],
    generate: (opts) => {
      const lo = Math.min(opts.fromYear as number, opts.toYear as number);
      const hi = Math.max(opts.fromYear as number, opts.toYear as number);
      const start = Date.UTC(lo, 0, 1);
      //random whole days, since the ms range overflows the 32-bit rng
      const days = Math.floor((Date.UTC(hi, 11, 31) - start) / 86400000) + 1;
      return Array.from({ length: opts.count as number }, () =>
        new Date(start + randomInt(days) * 86400000).toISOString().slice(0, 10),
      );
    },
  },
];

export const getGenerator = (slug: string) =>
  generators.find((g) => g.slug === slug);
