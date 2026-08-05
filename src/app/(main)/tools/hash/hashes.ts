//hash digests, one algorithm = one seo page at /tools/hash/[algo]
//sha comes from webcrypto, md5 is hand-rolled because webcrypto refuses
//and the internet still asks for it

const toHex = (bytes: Uint8Array) =>
  [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

const subtleDigest = async (name: string, input: string) => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest(name, data);
  return toHex(new Uint8Array(digest));
};

//rfc 1321, straight off the reference flow
export function md5Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const paddedLen = (((bytes.length + 8) >> 6) + 1) << 6;
  const buf = new Uint8Array(paddedLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 8, bitLen >>> 0, true);
  view.setUint32(paddedLen - 4, Math.floor(bitLen / 0x100000000), true);

  // prettier-ignore
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const K = Array.from({ length: 64 }, (_, i) =>
    Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000),
  );

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let off = 0; off < paddedLen; off += 64) {
    const M = Array.from({ length: 16 }, (_, i) =>
      view.getUint32(off + i * 4, true),
    );
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) | 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) | 0;
    }
    a0 = (a0 + A) | 0;
    b0 = (b0 + B) | 0;
    c0 = (c0 + C) | 0;
    d0 = (d0 + D) | 0;
  }

  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, a0 >>> 0, true);
  ov.setUint32(4, b0 >>> 0, true);
  ov.setUint32(8, c0 >>> 0, true);
  ov.setUint32(12, d0 >>> 0, true);
  return toHex(out);
}

export type HashAlgo = {
  slug: string;
  label: string;
  //hex digest length, for the ui meta
  bits: number;
  //note shown under the result, mostly to warn about the broken ones
  note?: string;
  //a couple of plain sentences for the seo prose under the tool
  about: string;
  digest: (input: string) => Promise<string>;
};

export const hashAlgos: HashAlgo[] = [
  {
    slug: "md5",
    label: "MD5",
    bits: 128,
    note: "broken for security, fine for checksums and cache keys",
    about:
      "MD5 dates to 1992 and produces a 128-bit digest. Collisions can be manufactured cheaply, so it's unsuitable for anything security-related — but it remains everywhere as a fast checksum for downloads, cache keys, and deduplication.",
    digest: async (input) => md5Hex(input),
  },
  {
    slug: "sha1",
    label: "SHA-1",
    bits: 160,
    note: "broken for security, still common in legacy systems and git",
    about:
      "SHA-1 produces a 160-bit digest. Practical collisions were demonstrated in 2017 and browsers and certificate authorities have retired it, but it still appears in git object ids and older protocols.",
    digest: (input) => subtleDigest("SHA-1", input),
  },
  {
    slug: "sha256",
    label: "SHA-256",
    bits: 256,
    about:
      'SHA-256 is the workhorse of the SHA-2 family — a 256-bit digest with no practical attacks. It\'s the default choice for integrity checks, signatures, content addressing, and most things labeled "checksum" today.',
    digest: (input) => subtleDigest("SHA-256", input),
  },
  {
    slug: "sha384",
    label: "SHA-384",
    bits: 384,
    about:
      "SHA-384 is SHA-512 truncated to 384 bits with different initial values, which also makes it immune to length-extension attacks. It's common in TLS certificate chains and anywhere a middle ground between SHA-256 and SHA-512 is wanted.",
    digest: (input) => subtleDigest("SHA-384", input),
  },
  {
    slug: "sha512",
    label: "SHA-512",
    bits: 512,
    about:
      "SHA-512 produces a 512-bit digest and is often faster than SHA-256 on 64-bit hardware because it processes bigger words. Use it when you want the widest SHA-2 security margin.",
    digest: (input) => subtleDigest("SHA-512", input),
  },
];

export const getHashAlgo = (slug: string) =>
  hashAlgos.find((a) => a.slug === slug);
