import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { GeneratorTool } from "../components";
import { generators, getGenerator } from "../generators";

export const dynamicParams = false;

export async function generateStaticParams() {
  return generators.map((g) => ({ generator: g.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ generator: string }>;
}): Promise<Metadata> {
  const { generator: slug } = await props.params;
  const generator = getGenerator(slug);
  if (!generator) return {};

  return {
    title: `${generator.title} - Steven Frady`,
    description: generator.description,
    keywords: generator.keywords,
    alternates: {
      canonical: `https://www.stevenfrady.com/tools/generate/${slug}`,
    },
  };
}

export default async function (props: {
  params: Promise<{ generator: string }>;
}) {
  const { generator: slug } = await props.params;
  const generator = getGenerator(slug);
  if (!generator) notFound();

  return (
    <ToolShell>
      <GeneratorTool initialSlug={slug} />
    </ToolShell>
  );
}
