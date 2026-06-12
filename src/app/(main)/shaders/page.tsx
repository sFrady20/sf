import { shaderData } from "@/data/shaders";
import { ShadersGallery, type ShaderEntry } from "./components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shaders - Steven Frady",
  description:
    "A growing collection of GLSL fragment shaders from Genuary and beyond.",
};

export default async function ShadersPage() {
  const entries: ShaderEntry[] = await Promise.all(
    Object.entries(shaderData)
      .reverse()
      .map(async ([id, shader]) => ({
        id,
        title: shader.title,
        subtitle: shader.subtitle,
        frag: (await import(`@/shaders/${id}.frag.glsl`)).default,
      }))
  );

  return (
    <div className="flex flex-col w-full mt-[100px] md:mt-[132px] gap-10">
      <div className="container flex flex-col gap-4">
        <div className="font-title text-xs uppercase tracking-widest opacity-50">
          daily glsl, every genuary
        </div>
        <h1 className="text-3xl md:text-5xl font-title">Shaders</h1>
        <p className="text-sm md:text-base opacity-80 max-w-[620px] text-balance">
          Fragment shaders written one-a-day for{" "}
          <a
            href="https://genuary.art"
            target="_blank"
            className="underline"
            rel="noreferrer"
          >
            Genuary
          </a>{" "}
          since 2022. Hover to play, fullscreen for the good stuff, source on
          GitHub for the curious.
        </p>
      </div>
      <ShadersGallery entries={entries} />
    </div>
  );
}
