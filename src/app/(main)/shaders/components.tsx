"use client";

import { useMemo, useState } from "react";
import { ShaderCard } from "@/components/shader";
import { Button } from "earthling-ui/button";

export interface ShaderEntry {
  id: string;
  title: string;
  subtitle: string;
  frag: string;
}

export function ShadersGallery(props: { entries: ShaderEntry[] }) {
  const { entries } = props;

  const [year, setYear] = useState<string>("all");

  const years = useMemo(
    () =>
      [...new Set(entries.map((e) => e.id.split("/")[1]))].sort().reverse(),
    [entries]
  );

  const filtered = useMemo(
    () =>
      year === "all" ? entries : entries.filter((e) => e.id.split("/")[1] === year),
    [entries, year]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="container flex flex-row flex-wrap items-center gap-2">
        {["all", ...years].map((y) => (
          <Button
            key={y}
            size={"sm"}
            material={year === y ? "paper" : "outline"}
            aria-pressed={year === y}
            onClick={() => setYear(y)}
          >
            {y === "all" ? `All (${entries.length})` : y}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-12 w-full">
        {filtered.map((e) => (
          <ShaderCard
            key={e.id}
            frag={e.frag}
            title={e.title}
            subtitle={e.subtitle}
            shaderPath={e.id}
            className="col-span-12 md:col-span-6 xl:col-span-4 relative"
          />
        ))}
      </div>
    </div>
  );
}
