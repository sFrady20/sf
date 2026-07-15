import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { TextTool } from "../components";
import { getTextTransform, textTransforms } from "../transforms";

//prerender every transform, same tool + preset switcher = free seo pages
export const dynamicParams = false;

export async function generateStaticParams() {
  return textTransforms.map((t) => ({ transform: t.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ transform: string }>;
}): Promise<Metadata> {
  const { transform: slug } = await props.params;
  const transform = getTextTransform(slug);
  if (!transform) return {};

  return {
    title: `${transform.title} - Steven Frady`,
    description: transform.description,
    keywords: transform.keywords,
    alternates: { canonical: `https://www.stevenfrady.com/tools/text/${slug}` },
  };
}

export default async function (props: {
  params: Promise<{ transform: string }>;
}) {
  const { transform: slug } = await props.params;
  const transform = getTextTransform(slug);
  if (!transform) notFound();

  return (
    <ToolShell>
      <TextTool initialSlug={slug} />
    </ToolShell>
  );
}
