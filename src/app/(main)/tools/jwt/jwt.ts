//jwt decoding, no verification and no network - the whole point is that
//the token never leaves the page

export type DecodedJwt =
  | {
      ok: true;
      header: Record<string, unknown>;
      payload: Record<string, unknown>;
      signature: string;
    }
  | { ok: false; error: string };

const b64urlToBytes = (s: string): Uint8Array | null => {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
};

const decodeSection = (s: string): Record<string, unknown> | null => {
  const bytes = b64urlToBytes(s);
  if (!bytes) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(bytes));
    return typeof json === "object" && json !== null ? json : null;
  } catch {
    return null;
  }
};

export function decodeJwt(token: string): DecodedJwt {
  const parts = token
    .trim()
    .replace(/^bearer\s+/i, "")
    .split(".");
  if (parts.length !== 3)
    return {
      ok: false,
      error: `expected 3 dot-separated sections, got ${parts.length}`,
    };
  const header = decodeSection(parts[0]);
  if (!header) return { ok: false, error: "header isn't valid base64url json" };
  const payload = decodeSection(parts[1]);
  if (!payload)
    return { ok: false, error: "payload isn't valid base64url json" };
  return { ok: true, header, payload, signature: parts[2] };
}

//registered claim names worth explaining inline
export const CLAIM_LABELS: Record<string, string> = {
  iss: "issuer",
  sub: "subject",
  aud: "audience",
  exp: "expires",
  nbf: "not before",
  iat: "issued at",
  jti: "token id",
};

export const TIME_CLAIMS = ["exp", "nbf", "iat"];

//expiry status from the payload, relative to now
export function jwtStatus(
  payload: Record<string, unknown>,
  now: Date,
): { label: string; ok: boolean } | null {
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  const nbf = typeof payload.nbf === "number" ? payload.nbf : null;
  const t = now.getTime() / 1000;
  if (exp !== null && t >= exp) return { label: "expired", ok: false };
  if (nbf !== null && t < nbf) return { label: "not valid yet", ok: false };
  if (exp !== null) return { label: "not expired", ok: true };
  return null;
}

//a harmless sample so the page demos itself (signature is fake)
const b64url = (o: object) =>
  btoa(JSON.stringify(o))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export const SAMPLE_JWT = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({
  sub: "1234567890",
  name: "Ada Lovelace",
  admin: true,
  iat: 1516239022,
})}.c2lnbmF0dXJlLW5vdC1pbmNsdWRlZA`;
