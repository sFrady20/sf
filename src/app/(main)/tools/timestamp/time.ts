//timestamp parsing, dependency-free so it's testable

export type ParsedTime =
  | { ok: true; date: Date; source: "seconds" | "millis" | "micros" | "date" }
  | { ok: false; error: string };

//numbers get their unit sniffed by magnitude - 10-digit epochs are seconds
//until 5138, 13-digit are millis, 16-digit are micros
export function parseTime(input: string): ParsedTime {
  const t = input.trim();
  if (t === "") return { ok: false, error: "type a timestamp or a date" };

  if (/^-?\d+(\.\d+)?$/.test(t)) {
    const n = Number(t);
    if (!Number.isFinite(n)) return { ok: false, error: "number is too big" };
    const abs = Math.abs(n);
    let ms: number;
    let source: "seconds" | "millis" | "micros";
    if (abs < 1e11) {
      ms = n * 1000;
      source = "seconds";
    } else if (abs < 1e14) {
      ms = n;
      source = "millis";
    } else if (abs < 1e17) {
      ms = n / 1000;
      source = "micros";
    } else {
      return { ok: false, error: "that's past microseconds, trim some digits" };
    }
    const date = new Date(ms);
    if (isNaN(date.getTime()))
      return { ok: false, error: "out of range for a date" };
    return { ok: true, date, source };
  }

  const parsed = Date.parse(t);
  if (isNaN(parsed))
    return {
      ok: false,
      error: "can't read that — try an epoch number or an ISO date",
    };
  return { ok: true, date: new Date(parsed), source: "date" };
}

export const toIsoUtc = (d: Date) => d.toISOString().replace(".000", "");

//coarse relative phrasing, both directions
export function relativeTime(d: Date, now: Date): string {
  const diff = d.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const suffix = diff >= 0 ? "from now" : "ago";
  const mins = Math.round(abs / 60000);
  if (mins < 1) return diff >= 0 ? "in under a minute" : "just now";
  if (mins < 120) return `${mins} min ${suffix}`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} hours ${suffix}`;
  const days = Math.round(hours / 24);
  if (days < 366) return `${days} days ${suffix}`;
  return `${Math.round(days / 365.25)} years ${suffix}`;
}
