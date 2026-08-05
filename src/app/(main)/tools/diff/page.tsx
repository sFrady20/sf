import { Metadata } from "next";
import { ToolShell } from "../shell";
import { ToolProse } from "../ui";
import { DiffTool } from "./components";

export const metadata: Metadata = {
  title: "Text Diff Checker - Steven Frady",
  description:
    "Free online text diff checker. Compare two versions of a text line by line — everything runs in your browser, nothing is uploaded.",
  keywords:
    "diff checker, text compare, compare two texts, text difference, online diff tool",
  alternates: { canonical: "https://www.stevenfrady.com/tools/diff" },
};

export default async function () {
  return (
    <ToolShell>
      <DiffTool />

      <ToolProse>
        <h2>How the comparison works</h2>
        <p>
          The two texts are compared line by line using the longest common
          subsequence — the same idea behind <code>git diff</code>. Lines
          present only in the changed version show as additions, lines missing
          from it show as removals, and everything shared stays unmarked.
        </p>
        <p>
          Comparison runs entirely in your browser, so it&apos;s safe for config
          files, contracts, and anything else you&apos;d rather not upload to a
          diff site. Very large texts fall back to a simpler comparison to stay
          fast.
        </p>
      </ToolProse>
    </ToolShell>
  );
}
