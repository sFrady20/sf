"use client";

import { Tool, toolCategories } from "@/data/tools";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function ToolCard(props: { tool: Tool }) {
  const { tool } = props;
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const variants = tool.variants ?? [];
  const shown = expanded ? variants : variants.slice(0, 5);

  return (
    <div
      className="group bg-foreground/10 hover:bg-foreground/15 p-5 flex flex-col gap-2 transition h-full cursor-pointer"
      onClick={(e) => {
        //anywhere on the block navigates, unless a chip/button caught it
        if ((e.target as HTMLElement).closest("a,button")) return;
        router.push(tool.href);
      }}
    >
      <div className="flex flex-row items-start justify-between">
        <i className={cn(tool.icon, "text-2xl opacity-80")} />
        <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-full relative">
          <i className="icon-[ri--arrow-right-up-line] absolute group-hover:translate-x-[40px] group-hover:-translate-y-[40px] transition group-hover:opacity-0" />
          <i className="icon-[ri--arrow-right-up-line] absolute -translate-x-[40px] translate-y-[40px] opacity-0 transition group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
        </div>
      </div>
      <h3 className="font-title font-bold">
        {/* real anchor so crawlers still see the link */}
        <Link href={tool.href}>{tool.title}</Link>
      </h3>
      <p className="text-sm opacity-70 flex-1">{tool.description}</p>
      {variants.length > 0 && (
        <div className="flex flex-row flex-wrap gap-1.5">
          {shown.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="text-[11px] bg-foreground/10 hover:bg-foreground/20 rounded-full px-2.5 py-1 transition"
            >
              {v.label}
            </Link>
          ))}
          {variants.length > shown.length && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-[11px] opacity-60 hover:opacity-100 rounded-full px-2.5 py-1 cursor-pointer transition"
            >
              +{variants.length - shown.length} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ToolsIndex() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return toolCategories;
    return toolCategories
      .map((cat) => ({
        ...cat,
        tools: cat.tools.filter((t) =>
          `${t.title} ${t.description} ${t.keywords} ${(t.variants ?? [])
            .map((v) => v.label)
            .join(" ")}`
            .toLowerCase()
            .includes(q),
        ),
      }))
      .filter((cat) => cat.tools.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-title font-bold text-3xl md:text-4xl">Tools</h1>
          <p className="opacity-70 text-sm max-w-[600px]">
            Free utilities for developers and designers. Everything runs on
            this site — no signups, no uploads kept, no nonsense.
          </p>
        </div>
        <div className="flex flex-row items-center gap-3 bg-foreground/5 focus-within:bg-foreground/10 border rounded-full px-5 max-w-[480px] transition">
          <i className="icon-[ri--search-line] opacity-50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
          />
          <kbd className="font-title text-[10px] uppercase tracking-widest opacity-40 max-md:hidden">
            ⌘K
          </kbd>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center font-title text-sm opacity-50">
          Nothing matches “{query}”
        </div>
      )}

      {filtered.map((cat) => (
        <section key={cat.id} className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-3">
            <i className={cn(cat.icon, "opacity-60")} />
            <h2 className="font-title text-xs uppercase tracking-widest opacity-60">
              {cat.label}
            </h2>
            <div className="flex-1 h-[1px] bg-foreground/10" />
            <div className="text-xs opacity-40">{cat.tools.length}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] rounded overflow-hidden">
            {cat.tools.map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
