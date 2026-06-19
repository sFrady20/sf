"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CUSTOM_COOKIE,
  THEME_CLASS_NAMES,
  THEME_COOKIE,
  TOKEN_VARS,
  deriveTheme,
  resolveThemeClass,
  type CustomTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  selection: string;
  custom: CustomTheme;
  setTheme: (selection: string) => void;
  setCustom: (custom: CustomTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=31536000; samesite=lax`;
}

//owns documentElement: swaps the theme-* class + (for custom) inline vars
function applyTheme(selection: string, custom: CustomTheme) {
  const root = document.documentElement;

  //clear any custom inline vars first so a named theme's @utility wins
  for (const v of TOKEN_VARS) root.style.removeProperty(v);

  for (const c of Array.from(root.classList)) {
    if (c.startsWith("theme-")) root.classList.remove(c);
  }

  //dev-only: ?theme-holiday=<id> forces a holiday preset for testing
  const override = new URLSearchParams(window.location.search).get(
    "theme-holiday",
  );

  let cls: string;
  if (override && THEME_CLASS_NAMES.includes(`theme-holiday-${override}`)) {
    cls = `theme-holiday-${override}`;
  } else if (selection === "custom") {
    cls = "theme-custom";
    const vars = deriveTheme(custom);
    for (const [k, val] of Object.entries(vars)) root.style.setProperty(k, val);
  } else {
    cls = resolveThemeClass({
      selection,
      date: new Date(),
      prefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    });
  }
  root.classList.add(cls);
}

export function ThemeProvider(props: {
  initialSelection: string;
  initialCustom: CustomTheme;
  children: ReactNode;
}) {
  const { initialSelection, initialCustom, children } = props;

  const [selection, setSelection] = useState(initialSelection);
  const [custom, setCustomState] = useState(initialCustom);

  //re-assert on mount + whenever selection/custom changes
  useEffect(() => {
    applyTheme(selection, custom);
  }, [selection, custom]);

  //follow the OS while on system
  useEffect(() => {
    if (selection !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system", custom);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [selection, custom]);

  const setTheme = useCallback((next: string) => {
    setSelection(next);
    writeCookie(THEME_COOKIE, next);
  }, []);

  //editing the custom theme applies it live + selects it
  const setCustom = useCallback((next: CustomTheme) => {
    setCustomState(next);
    setSelection("custom");
    writeCookie(CUSTOM_COOKIE, JSON.stringify(next));
    writeCookie(THEME_COOKIE, "custom");
  }, []);

  const value = useMemo(
    () => ({ selection, custom, setTheme, setCustom }),
    [selection, custom, setTheme, setCustom],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
