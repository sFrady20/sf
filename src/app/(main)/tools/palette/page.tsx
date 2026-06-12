import Intro from "./intro.mdx";
import {
  PaletteEditor,
  PaletteExamples,
  PaletteExport,
  PaletteProvider,
  SavedPalettes,
} from "./components";
import { Metadata } from "next";
import { Button } from "earthling-ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Procedural Palette Generation Tool - Steven Frady",
  description:
    "Create customizable color palettes for GLSL shaders using a simple cosine-based formula",
  openGraph: {
    title: "Procedural Palette Generation Tool - Steven Frady",
    images: [
      {
        alt: "Procedural Palette Generation Tool - Steven Frady",
        type: "image/png",
        width: 1200,
        height: 675,
        url: `https://stevenfrady.com/palette-tool.png`,
      },
    ],
  },
};

export default async function (props: {
  searchParams: Promise<{ p: string }>;
}) {
  const { p: paletteStr } = await props.searchParams;

  try {
    var palette = JSON.parse(paletteStr) as number[][] | undefined;
  } catch (e) {
    palette = undefined;
  }

  return (
    <div className="py-[100px] md:pt-[132px] flex-1">
      <div className="container flex flex-col max-w-[1000px]">
        <div>
          <Button material={"ghost"} className="gap-2 -ml-4" asChild>
            <Link href="/tools">
              <i className="icon-[ri--arrow-left-line]" />
              <div>More tools</div>
            </Link>
          </Button>
        </div>
        <article>
          <Intro />
        </article>
        <div className="flex flex-col gap-10 mt-10">
          <PaletteProvider defaultPalette={palette}>
            <PaletteEditor />
            <PaletteExamples />
            <PaletteExport />
            <SavedPalettes />
          </PaletteProvider>
        </div>
      </div>
    </div>
  );
}
