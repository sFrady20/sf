//theme registry + derivation, shared by the server layout and the client
//provider. keep this dependency-free so it's safe to import on the server.

export const THEME_COOKIE = "theme";
export const CUSTOM_COOKIE = "theme-custom";

export type Base = "light" | "dark";
export type CustomTheme = { base: Base; primary: string; secondary: string };

export const DEFAULT_CUSTOM: CustomTheme = {
  base: "dark",
  primary: "hsl(265, 90%, 66%)",
  secondary: "hsl(190, 90%, 60%)",
};

export type ThemeMeta = {
  id: string;
  label: string;
  icon: string;
  //preview swatch colors for the picker chips
  bg: string;
  fg: string;
  accent: string;
};

//the sensible defaults
export const BASE_THEMES: ThemeMeta[] = [
  {
    id: "light",
    label: "Light",
    icon: "icon-[ri--sun-fill]",
    bg: "oklch(0.96 0.004 67)",
    fg: "oklch(0.27 0 0)",
    accent: "oklch(0.27 0 0)",
  },
  {
    id: "dark",
    label: "Dark",
    icon: "icon-[ri--moon-fill]",
    bg: "oklch(0.205 0 0)",
    fg: "oklch(0.916 0 0)",
    accent: "oklch(0.916 0 0)",
  },
  {
    id: "system",
    label: "System",
    icon: "icon-[ri--computer-fill]",
    bg: "oklch(0.5 0 0)",
    fg: "oklch(0.95 0 0)",
    accent: "oklch(0.7 0 0)",
  },
];

//the expressive ones, with more liberties taken
export const NAMED_THEMES: ThemeMeta[] = [
  {
    id: "alien",
    label: "Alien",
    icon: "icon-[ri--aliens-fill]",
    bg: "oklch(0.17 0.025 185)",
    fg: "oklch(0.76 0.07 180)",
    accent: "oklch(0.76 0.07 180)",
  },
  {
    id: "gold",
    label: "Gold",
    icon: "icon-[ri--vip-crown-fill]",
    bg: "oklch(0.16 0.005 90)",
    fg: "oklch(0.84 0.09 90)",
    accent: "oklch(0.78 0.13 90)",
  },
  {
    id: "matrix",
    label: "Matrix",
    icon: "icon-[ri--terminal-box-fill]",
    bg: "oklch(0.15 0.02 150)",
    fg: "oklch(0.82 0.17 150)",
    accent: "oklch(0.75 0.2 150)",
  },
];

export type Holiday = {
  id: string;
  label: string;
  from: [number, number]; //[month (1-12), day]
  to: [number, number];
};

//holiday windows (all kept within a single month for simple matching)
export const HOLIDAYS: Holiday[] = [
  { id: "valentine", label: "Valentine's", from: [2, 10], to: [2, 14] },
  { id: "independence", label: "Independence Day", from: [7, 1], to: [7, 4] },
  { id: "halloween", label: "Halloween", from: [10, 25], to: [10, 31] },
  { id: "christmas", label: "Christmas", from: [12, 18], to: [12, 26] },
];

export function getHoliday(date: Date): string | null {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const h of HOLIDAYS) {
    if (m === h.from[0] && d >= h.from[1] && d <= h.to[1]) return h.id;
  }
  return null;
}

//literal class names so tailwind's scanner emits every @utility theme
export const THEME_CLASS_NAMES = [
  "theme-light",
  "theme-dark",
  "theme-alien",
  "theme-synthwave",
  "theme-ember",
  "theme-matrix",
  "theme-vapor",
  "theme-gold",
  "theme-custom",
  "theme-holiday-valentine",
  "theme-holiday-independence",
  "theme-holiday-halloween",
  "theme-holiday-christmas",
];

//resolves a selection to the theme-* class to apply
export function resolveThemeClass(opts: {
  selection: string;
  date: Date;
  prefersDark: boolean;
}): string {
  const { selection, date, prefersDark } = opts;
  if (selection === "system") {
    const h = getHoliday(date);
    if (h) return `theme-holiday-${h}`;
    return prefersDark ? "theme-dark" : "theme-light";
  }
  if (selection === "custom") return "theme-custom";
  return `theme-${selection}`;
}

// --- custom theme derivation (dependency-free) ---

function parseHsl(input: string): { h: number; s: number; l: number } {
  const m = input.match(/([\d.]+)[,\s]+([\d.]+)%?[,\s]+([\d.]+)%?/);
  if (!m) return { h: 265, s: 80, l: 60 };
  return { h: +m[1], s: +m[2], l: +m[3] };
}

const hsl = (h: number, s: number, l: number) =>
  `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;

//keep accents in a readable lightness band so buttons never go unreadable
const clampL = (l: number) => Math.min(78, Math.max(42, l));
//pick a foreground that contrasts the accent's lightness
const accentFg = (l: number) =>
  l < 58 ? "oklch(0.985 0 0)" : "oklch(0.205 0 0)";

export function deriveTheme(c: CustomTheme): Record<string, string> {
  const p = parseHsl(c.primary);
  const s = parseHsl(c.secondary);
  const pL = clampL(p.l);
  const sL = clampL(s.l);
  const primary = hsl(p.h, p.s, pL);
  const secondary = hsl(s.h, s.s, sL);

  const light = c.base === "light";
  const background = light ? "oklch(0.96 0.004 67)" : "oklch(0.205 0 0)";
  const foreground = light ? "oklch(0.27 0 0)" : "oklch(0.916 0 0)";
  const surface = light ? "oklch(0.99 0 0)" : "oklch(0.25 0 0)";
  const outline = light ? "oklch(0.2 0 0)" : "oklch(0.916 0 0)";
  const neutral = light ? "oklch(0.94 0 0)" : "oklch(0.35 0 0)";
  const neutralFg = light ? "oklch(0.27 0 0)" : "oklch(0.95 0 0)";
  const muted = light ? "oklch(0.92 0 0)" : "oklch(0.3 0 0)";
  const mutedFg = light ? "oklch(0.45 0 0)" : "oklch(0.6 0 0)";

  return {
    "--radius-control": "999px",
    "--color-background": background,
    "--color-foreground": foreground,
    "--color-surface": surface,
    "--color-outline": outline,
    "--color-light": "oklch(1 0 0 / 0.2)",
    "--color-shadow": "oklch(0.2 0 0)",
    "--color-accent": primary,
    "--color-primary": primary,
    "--color-primary-foreground": accentFg(pL),
    "--color-primary-accent": primary,
    "--color-secondary": secondary,
    "--color-secondary-foreground": accentFg(sL),
    "--color-secondary-accent": secondary,
    "--color-tertiary": secondary,
    "--color-tertiary-foreground": accentFg(sL),
    "--color-tertiary-accent": secondary,
    "--color-neutral": neutral,
    "--color-neutral-foreground": neutralFg,
    "--color-neutral-accent": neutral,
    "--color-muted": muted,
    "--color-muted-foreground": mutedFg,
    "--color-muted-accent": muted,
    "--color-good": "oklch(0.6 0.17 140)",
    "--color-good-foreground": "oklch(0.98 0 0)",
    "--color-good-accent": "oklch(0.6 0.17 140)",
    "--color-caution": "oklch(0.6 0.2 90)",
    "--color-caution-foreground": "oklch(0.98 0 0)",
    "--color-caution-accent": "oklch(0.6 0.2 90)",
    "--color-bad": "oklch(0.55 0.2 30)",
    "--color-bad-foreground": "oklch(0.98 0 0)",
    "--color-bad-accent": "oklch(0.55 0.2 30)",
  };
}

//every css var deriveTheme controls - the provider clears these when leaving
//a custom theme so a named theme's @utility vars take back over
export const TOKEN_VARS = Object.keys(deriveTheme(DEFAULT_CUSTOM));
