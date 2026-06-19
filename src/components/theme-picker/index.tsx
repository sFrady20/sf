"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "earthling-ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "earthling-ui/popover";
import { ToggleGroup, ToggleGroupItem } from "earthling-ui/toggle-group";
import { Separator } from "earthling-ui/separator";
import {
  ColorPicker,
  ColorArea,
  ColorSlider,
  parseColor,
} from "earthling-ui/color-picker";
import { useTheme } from "@/components/theme-provider";
import { BASE_THEMES, NAMED_THEMES, type CustomTheme } from "@/lib/theme";
import { cn } from "@/utils/cn";

function iconFor(selection: string) {
  if (selection === "system") return "icon-[ri--computer-fill]";
  if (selection === "light") return "icon-[ri--sun-fill]";
  if (selection === "dark") return "icon-[ri--moon-fill]";
  if (selection === "custom") return "icon-[ri--palette-fill]";
  return (
    NAMED_THEMES.find((t) => t.id === selection)?.icon ??
    "icon-[ri--contrast-2-fill]"
  );
}

function ThemeChip(props: {
  label: string;
  bg: string;
  accent: string;
  selected: boolean;
  onClick: () => void;
}) {
  const { label, bg, accent, selected, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors hover:bg-foreground/5",
        selected && "bg-foreground/5",
      )}
    >
      <span
        className={cn(
          "relative h-10 w-full overflow-hidden rounded-md ring-1 ring-foreground/10",
          selected && "ring-2 ring-primary",
        )}
        style={{ background: bg }}
      >
        <span
          className="absolute bottom-1 right-1 h-3 w-3 rounded-full ring-1 ring-black/20"
          style={{ background: accent }}
        />
      </span>
      <span className="font-title text-[11px] leading-none opacity-80">
        {label}
      </span>
    </button>
  );
}

export function ThemePicker() {
  const { selection, custom, setTheme, setCustom } = useTheme();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "custom">("list");

  const baseValue = ["light", "dark", "system"].includes(selection)
    ? selection
    : "";

  const update = (patch: Partial<CustomTheme>) =>
    setCustom({ ...custom, ...patch });

  return (
    <Popover
      open={open}
      onOpenChange={(o: boolean) => {
        setOpen(o);
        if (!o) setView("list");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          shape="icon"
          material="ghost"
          aria-label="Change theme"
          className="grid rounded-full"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.i
              key={iconFor(selection)}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className={cn(
                iconFor(selection),
                "text-lg col-start-1 row-start-1",
              )}
            />
          </AnimatePresence>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80">
        {view === "list" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="font-title text-xs uppercase tracking-widest opacity-50">
                Mode
              </div>
              <ToggleGroup
                type="single"
                value={baseValue}
                onValueChange={(v: string) => v && setTheme(v)}
                className="w-full"
              >
                {BASE_THEMES.map((t) => (
                  <ToggleGroupItem
                    key={t.id}
                    value={t.id}
                    className="flex-1 gap-1.5 font-title"
                  >
                    <i className={cn(t.icon, "text-base")} />
                    {t.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="font-title text-xs uppercase tracking-widest opacity-50">
                Themes
              </div>
              <div className="grid grid-cols-3 gap-1">
                {NAMED_THEMES.map((t) => (
                  <ThemeChip
                    key={t.id}
                    label={t.label}
                    bg={t.bg}
                    accent={t.accent}
                    selected={selection === t.id}
                    onClick={() => setTheme(t.id)}
                  />
                ))}
                {/* <ThemeChip
                  label="Custom"
                  bg="repeating-conic-gradient(from 0deg, #f0f0f0 0deg 90deg, #d0d0d0 90deg 180deg) 0 0 / 14px 14px"
                  accent={custom.primary}
                  selected={selection === "custom"}
                  onClick={() => setView("custom")}
                /> */}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Button
                shape="icon"
                material="ghost"
                size="sm"
                aria-label="Back"
                className="rounded-full"
                onClick={() => setView("list")}
              >
                <i className="icon-[ri--arrow-left-line] text-base" />
              </Button>
              <div className="font-title text-sm">Custom theme</div>
            </div>

            <ToggleGroup
              type="single"
              value={custom.base}
              onValueChange={(v: string) =>
                v && update({ base: v as CustomTheme["base"] })
              }
              className="w-full"
            >
              <ToggleGroupItem
                value="light"
                className="flex-1 gap-1.5 font-title"
              >
                <i className="icon-[ri--sun-fill] text-base" />
                Light
              </ToggleGroupItem>
              <ToggleGroupItem
                value="dark"
                className="flex-1 gap-1.5 font-title"
              >
                <i className="icon-[ri--moon-fill] text-base" />
                Dark
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="flex flex-col gap-2">
              <div className="font-title text-xs uppercase tracking-widest opacity-50">
                Primary
              </div>
              <ColorPicker
                value={parseColor(custom.primary)}
                onChange={(c: ReturnType<typeof parseColor>) =>
                  update({ primary: c.toString("hsl") })
                }
              >
                <ColorArea
                  xChannel="saturation"
                  yChannel="lightness"
                  className="h-24 w-full"
                />
                <ColorSlider channel="hue" className="mt-2" />
              </ColorPicker>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-title text-xs uppercase tracking-widest opacity-50">
                Secondary
              </div>
              <ColorPicker
                value={parseColor(custom.secondary)}
                onChange={(c: ReturnType<typeof parseColor>) =>
                  update({ secondary: c.toString("hsl") })
                }
              >
                <ColorArea
                  xChannel="saturation"
                  yChannel="lightness"
                  className="h-24 w-full"
                />
                <ColorSlider channel="hue" className="mt-2" />
              </ColorPicker>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
