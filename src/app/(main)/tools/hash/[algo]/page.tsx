import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolShell } from "../../shell";
import { HashTool } from "../components";
import { getHashAlgo, hashAlgos } from "../hashes";

export const dynamicParams = false;

export async function generateStaticParams() {
  return hashAlgos.map((a) => ({ algo: a.slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ algo: string }>;
}): Promise<Metadata> {
  const { algo: slug } = await props.params;
  const algo = getHashAlgo(slug);
  if (!algo) return {};

  return {
    title: `${algo.label} Hash Generator - Steven Frady`,
    description: `Free online ${algo.label} hash generator. Type or paste text and get its ${algo.label} digest instantly — hashing runs entirely in your browser.`,
    keywords: `${algo.label.toLowerCase()} hash generator, ${algo.label.toLowerCase()} online, ${algo.label.toLowerCase()} checksum, hash text online`,
    alternates: {
      canonical: `https://www.stevenfrady.com/tools/hash/${slug}`,
    },
  };
}

export default async function (props: { params: Promise<{ algo: string }> }) {
  const { algo: slug } = await props.params;
  const algo = getHashAlgo(slug);
  if (!algo) notFound();

  return (
    <ToolShell>
      {/* the tool renders its own prose, so it follows the algorithm select */}
      <HashTool initialAlgo={slug} />
    </ToolShell>
  );
}
