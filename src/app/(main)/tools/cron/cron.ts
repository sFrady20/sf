//cron parsing + plain-english describing, one preset = one seo page at
///tools/cron/[preset]. standard 5-field syntax, dependency-free so it's
//testable outside the app

export type CronPart = {
  //bare * (step may still apply)
  any: boolean;
  from: number;
  to: number;
  step: number;
};

export type CronField = {
  parts: CronPart[];
  //expanded allowed values, sorted (dow normalized to 0-6)
  values: number[];
  //plain * with no step - matters for the dom/dow or-rule and phrasing
  any: boolean;
};

export type Cron = {
  minute: CronField;
  hour: CronField;
  dom: CronField;
  month: CronField;
  dow: CronField;
};

export type CronResult =
  { ok: true; cron: Cron; tokens: string[] } | { ok: false; error: string };

const ALIASES: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

type FieldDef = {
  key: keyof Cron;
  label: string;
  min: number;
  max: number;
  names: string[] | null;
};

export const FIELD_DEFS: FieldDef[] = [
  { key: "minute", label: "minute", min: 0, max: 59, names: null },
  { key: "hour", label: "hour", min: 0, max: 23, names: null },
  { key: "dom", label: "day of month", min: 1, max: 31, names: null },
  {
    key: "month",
    label: "month",
    min: 1,
    max: 12,
    names: "jan feb mar apr may jun jul aug sep oct nov dec".split(" "),
  },
  {
    key: "dow",
    label: "day of week",
    min: 0,
    max: 7,
    names: "sun mon tue wed thu fri sat".split(" "),
  },
];

//numbers or names, names matched on their first three letters
const resolve = (tok: string, def: FieldDef): number | null => {
  if (/^\d+$/.test(tok)) return +tok;
  if (def.names) {
    const i = def.names.indexOf(tok.slice(0, 3));
    if (i >= 0) return def.min + i;
  }
  return null;
};

export function parseCron(input: string): CronResult {
  const raw = input.trim().toLowerCase();
  const expanded = ALIASES[raw] ?? raw;
  const tokens = expanded.split(/\s+/).filter(Boolean);
  if (tokens.length !== 5)
    return {
      ok: false,
      error: `expected 5 fields (minute hour day month weekday), got ${tokens.length}`,
    };

  const cron = {} as Cron;
  for (let i = 0; i < 5; i++) {
    const def = FIELD_DEFS[i];
    const parts: CronPart[] = [];
    const values = new Set<number>();

    for (const src of tokens[i].split(",")) {
      const m = src.match(/^([^/]*)(?:\/(\d+))?$/);
      if (!m) return { ok: false, error: `${def.label}: can't read "${src}"` };
      const step = m[2] ? +m[2] : 1;
      if (step < 1)
        return { ok: false, error: `${def.label}: step must be at least 1` };

      let any = false;
      let from: number;
      let to: number;
      if (m[1] === "*") {
        any = true;
        from = def.min;
        to = def.max;
      } else if (m[1].includes("-")) {
        const [a, b] = m[1].split("-");
        const lo = resolve(a, def);
        const hi = resolve(b, def);
        if (lo == null || hi == null)
          return { ok: false, error: `${def.label}: can't read "${src}"` };
        if (lo > hi)
          return {
            ok: false,
            error: `${def.label}: range ${lo}-${hi} is backwards`,
          };
        from = lo;
        to = hi;
      } else {
        const v = resolve(m[1], def);
        if (v == null)
          return { ok: false, error: `${def.label}: can't read "${src}"` };
        from = v;
        //a bare value with a step runs from that value to the max
        to = m[2] ? def.max : v;
      }

      if (from < def.min || to > def.max)
        return {
          ok: false,
          error: `${def.label}: "${src}" is out of range (${def.min}-${def.max})`,
        };

      parts.push({ any, from, to, step });
      for (let v = from; v <= to; v += step)
        values.add(def.key === "dow" ? v % 7 : v);
    }

    cron[def.key] = {
      parts,
      values: [...values].sort((a, b) => a - b),
      any: parts.length === 1 && parts[0].any && parts[0].step === 1,
    };
  }

  return { ok: true, cron, tokens };
}

// --- plain english ---

const MONTHS =
  "January February March April May June July August September October November December".split(
    " ",
  );
const DAYS = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(
  " ",
);
export const monthName = (n: number) => MONTHS[n - 1];
export const dowName = (n: number) => DAYS[n % 7];

const ord = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

const pad = (n: number) => `${n}`.padStart(2, "0");

//"a, b and c" - no oxford comma, this is a terse tool
const listJoin = (items: string[]) =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

type PhraseCfg = { unit: string; name?: (n: number) => string };

const partPhrase = (p: CronPart, cfg: PhraseCfg): string => {
  const name = cfg.name ?? ((n: number) => `${n}`);
  if (p.any)
    return p.step > 1
      ? `every ${ord(p.step)} ${cfg.unit}`
      : `every ${cfg.unit}`;
  if (p.from === p.to) return cfg.name ? name(p.from) : `${cfg.unit} ${p.from}`;
  if (p.step > 1)
    return `every ${ord(p.step)} ${cfg.unit} from ${name(p.from)} through ${name(p.to)}`;
  return cfg.name
    ? `${name(p.from)} through ${name(p.to)}`
    : `${cfg.unit}s ${p.from} through ${p.to}`;
};

export function fieldPhrase(f: CronField, cfg: PhraseCfg): string {
  const singles = f.parts.every((p) => !p.any && p.from === p.to);
  if (singles) {
    const names = f.parts.map((p) =>
      cfg.name ? cfg.name(p.from) : `${p.from}`,
    );
    const label = cfg.name
      ? ""
      : f.parts.length > 1
        ? `${cfg.unit}s `
        : `${cfg.unit} `;
    return `${label}${listJoin(names)}`;
  }
  return listJoin(f.parts.map((p) => partPhrase(p, cfg)));
}

//the per-field configs the breakdown panel reuses
export const PHRASE_CFGS: Record<keyof Cron, PhraseCfg> = {
  minute: { unit: "minute" },
  hour: { unit: "hour" },
  dom: { unit: "day-of-month" },
  month: { unit: "month", name: monthName },
  dow: { unit: "day-of-week", name: dowName },
};

export function describeCron(c: Cron): string {
  const singles = (f: CronField) =>
    f.parts.every((p) => !p.any && p.from === p.to);

  let s: string;
  if (
    singles(c.minute) &&
    singles(c.hour) &&
    c.minute.values.length * c.hour.values.length <= 4
  ) {
    //clean clock times when the combo count stays readable
    const times = c.hour.values.flatMap((h) =>
      c.minute.values.map((m) => `${pad(h)}:${pad(m)}`),
    );
    s = `At ${listJoin(times)}`;
  } else {
    s = `At ${fieldPhrase(c.minute, PHRASE_CFGS.minute)}`;
    if (!c.hour.any) s += ` past ${fieldPhrase(c.hour, PHRASE_CFGS.hour)}`;
    //"at minute 5" alone reads ambiguous, "every 5th minute" doesn't
    else if (singles(c.minute)) s += " past every hour";
  }

  if (!c.dom.any) s += ` on ${fieldPhrase(c.dom, PHRASE_CFGS.dom)}`;
  if (!c.month.any) s += ` in ${fieldPhrase(c.month, PHRASE_CFGS.month)}`;
  if (!c.dow.any)
    s += `${c.dom.any ? "" : " and"} on ${fieldPhrase(c.dow, PHRASE_CFGS.dow)}`;
  return s;
}

// --- next occurrences ---

export function nextRuns(cron: Cron, count: number, from: Date): Date[] {
  const runs: Date[] = [];
  const minuteOk = new Set(cron.minute.values);
  const hourOk = new Set(cron.hour.values);
  const domOk = new Set(cron.dom.values);
  const monthOk = new Set(cron.month.values);
  const dowOk = new Set(cron.dow.values);

  //vixie cron quirk: when both dom and dow are restricted, either matching
  //counts. any-fields hold their full range so the && path stays correct
  const dayMatches = (d: Date) => {
    const dom = domOk.has(d.getDate());
    const dow = dowOk.has(d.getDay());
    return !cron.dom.any && !cron.dow.any ? dom || dow : dom && dow;
  };

  const start = new Date(from);
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);

  //walk days, then allowed hours/minutes inside each - bounded at 5 years
  //so impossible dates (feb 30) give up instead of spinning
  for (let day = 0; day < 366 * 5 && runs.length < count; day++) {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + day,
    );
    if (!monthOk.has(d.getMonth() + 1) || !dayMatches(d)) continue;
    for (const h of cron.hour.values) {
      if (!hourOk.has(h)) continue;
      for (const m of cron.minute.values) {
        const t = new Date(d);
        t.setHours(h, m);
        if (t >= start) {
          runs.push(t);
          if (runs.length >= count) return runs;
        }
      }
    }
  }
  return runs;
}

// --- presets, each one an seo page ---

export type CronPreset = { slug: string; label: string; expression: string };

export const cronPresets: CronPreset[] = [
  { slug: "every-minute", label: "Every minute", expression: "* * * * *" },
  {
    slug: "every-5-minutes",
    label: "Every 5 minutes",
    expression: "*/5 * * * *",
  },
  {
    slug: "every-10-minutes",
    label: "Every 10 minutes",
    expression: "*/10 * * * *",
  },
  {
    slug: "every-15-minutes",
    label: "Every 15 minutes",
    expression: "*/15 * * * *",
  },
  {
    slug: "every-30-minutes",
    label: "Every 30 minutes",
    expression: "*/30 * * * *",
  },
  { slug: "every-hour", label: "Every hour", expression: "0 * * * *" },
  { slug: "every-2-hours", label: "Every 2 hours", expression: "0 */2 * * *" },
  { slug: "every-6-hours", label: "Every 6 hours", expression: "0 */6 * * *" },
  {
    slug: "every-12-hours",
    label: "Every 12 hours",
    expression: "0 */12 * * *",
  },
  {
    slug: "every-day-at-midnight",
    label: "Every day at midnight",
    expression: "0 0 * * *",
  },
  {
    slug: "every-day-at-9am",
    label: "Every day at 9am",
    expression: "0 9 * * *",
  },
  {
    slug: "every-day-at-noon",
    label: "Every day at noon",
    expression: "0 12 * * *",
  },
  { slug: "every-weekday", label: "Every weekday", expression: "0 0 * * 1-5" },
  { slug: "every-weekend", label: "Every weekend", expression: "0 0 * * 6,0" },
  { slug: "every-sunday", label: "Every Sunday", expression: "0 0 * * 0" },
  { slug: "every-monday", label: "Every Monday", expression: "0 0 * * 1" },
  {
    slug: "first-of-the-month",
    label: "First of the month",
    expression: "0 0 1 * *",
  },
  { slug: "every-quarter", label: "Every quarter", expression: "0 0 1 */3 *" },
  { slug: "every-year", label: "Every year", expression: "0 0 1 1 *" },
];

export const getCronPreset = (slug: string) =>
  cronPresets.find((p) => p.slug === slug);

const normalize = (expr: string) =>
  expr.trim().toLowerCase().split(/\s+/).join(" ");

export const findPresetByExpression = (expr: string) => {
  const n = normalize(expr);
  return cronPresets.find((p) => normalize(p.expression) === n);
};
