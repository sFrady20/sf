"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { BASE_THEMES, NAMED_THEMES } from "@/lib/theme";
import { shaderData } from "@/data/shaders";
import { allTools } from "@/data/tools";
import { cn } from "@/utils/cn";

export type PaletteLink = { href: string; label: string };

type Command = {
  id: string;
  label: string;
  icon: string;
  group: string;
  keywords?: string;
  run: () => void;
};

//cmd+k everything: nav, themes, music, and a dash of chaos
export function CommandPalette({ links }: { links: PaletteLink[] }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = links.map((l) => ({
      id: `nav-${l.href}`,
      label: l.label,
      icon: "icon-[ri--arrow-right-line]",
      group: "Navigate",
      keywords: l.href,
      run: () => router.push(l.href),
    }));
    const tools: Command[] = allTools.map((t) => ({
      id: `tool-${t.href}`,
      label: t.title,
      icon: t.icon,
      group: "Tools",
      keywords: `${t.keywords} ${t.href}`,
      run: () => router.push(t.href),
    }));
    const themes: Command[] = [...BASE_THEMES, ...NAMED_THEMES].map((t) => ({
      id: `theme-${t.id}`,
      label: t.label,
      icon: t.icon,
      group: "Theme",
      keywords: "theme color mode",
      run: () => setTheme(t.id),
    }));
    const actions: Command[] = [
      {
        id: "music",
        label: "Toggle music",
        icon: "icon-[ri--music-2-fill]",
        group: "Actions",
        keywords: "play pause song audio",
        run: () => window.dispatchEvent(new Event("sf26:music-toggle")),
      },
      {
        id: "random-shader",
        label: "Random shader",
        icon: "icon-[ri--shuffle-fill]",
        group: "Actions",
        keywords: "glsl surprise lucky",
        run: () => {
          const keys = Object.keys(shaderData);
          router.push(
            `/shaders/${keys[Math.floor(Math.random() * keys.length)]}`,
          );
        },
      },
      {
        id: "email",
        label: "Copy email",
        icon: "icon-[ri--mail-fill]",
        group: "Actions",
        keywords: "contact hire",
        run: () => navigator.clipboard?.writeText("sfrady20@gmail.com"),
      },
      {
        id: "resume",
        label: "Open resume",
        icon: "icon-[ri--download-cloud-fill]",
        group: "Actions",
        keywords: "cv hire pdf",
        run: () => window.open("https://resume.stevenfrady.com", "_blank"),
      },
    ];
    return [...nav, ...tools, ...themes, ...actions];
  }, [links, router, setTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) =>
      `${c.label} ${c.group} ${c.keywords ?? ""}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  //snap selection back whenever the list changes
  useEffect(() => setActive(0), [query, open]);

  //keep the selected row in view while arrowing
  useEffect(() => {
    listRef.current
      ?.querySelector("[data-active=true]")
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const runCommand = useCallback((c: Command) => {
    setOpen(false);
    setQuery("");
    c.run();
  }, []);

  const onInputKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      runCommand(filtered[active]);
    }
  };

  //first-appearance order; commands are built group-contiguous
  const groups = Array.from(new Set(filtered.map((c) => c.group)));

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[18svh] z-[100] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl bg-background ring-1 ring-foreground/10 shadow-2xl shadow-black/40"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex flex-row items-center gap-3 border-b border-foreground/10 px-4">
            <i className="icon-[ri--search-line] opacity-50" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Type a command or search…"
              className="h-12 flex-1 bg-transparent font-title text-sm outline-none placeholder:opacity-40"
            />
            <kbd className="font-title text-[10px] uppercase tracking-widest opacity-40">
              esc
            </kbd>
          </div>
          <div ref={listRef} className="max-h-[50svh] overflow-y-auto p-2">
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-center font-title text-sm opacity-50">
                No results
              </div>
            )}
            {groups.map((group) => (
              <div key={group} className="mb-1">
                <div className="px-3 pb-1 pt-2 font-title text-[10px] uppercase tracking-widest opacity-40">
                  {group}
                </div>
                {filtered
                  .filter((c) => c.group === group)
                  .map((c) => {
                    const i = filtered.indexOf(c);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        data-active={i === active}
                        onPointerEnter={() => setActive(i)}
                        onClick={() => runCommand(c)}
                        className={cn(
                          "flex w-full flex-row items-center gap-3 rounded-lg px-3 py-2.5 text-left font-title text-sm",
                          i === active ? "bg-foreground/10" : "opacity-80",
                        )}
                      >
                        <i className={cn(c.icon, "text-base opacity-70")} />
                        <span className="flex-1">{c.label}</span>
                      </button>
                    );
                  })}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
