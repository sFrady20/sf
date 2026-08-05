import { Metadata } from "next";
import { ToolShell } from "../shell";
import { ToolProse } from "../ui";
import { WordCounterTool } from "./components";

export const metadata: Metadata = {
  title: "Word Counter - Steven Frady",
  description:
    "Free online word counter. Live word, character, sentence, and paragraph counts with reading and speaking time estimates.",
  keywords:
    "word counter, character counter, count words online, sentence counter, reading time calculator",
  alternates: { canonical: "https://www.stevenfrady.com/tools/word-counter" },
};

export default async function () {
  return (
    <ToolShell>
      <WordCounterTool />

      <ToolProse>
        <h2>How the counts work</h2>
        <p>
          Words are runs of characters separated by whitespace. Sentences end at
          periods, exclamation points, or question marks; paragraphs are
          separated by blank lines. Unique words are counted case-insensitively
          with surrounding punctuation stripped, so &ldquo;The&rdquo; and
          &ldquo;the.&rdquo; count as one word.
        </p>
        <p>
          Reading time assumes 200 words per minute, the common average for
          silent reading; speaking time assumes 130, a comfortable presentation
          pace. Both round up, so a 30-word paragraph still shows a minute.
          Everything updates as you type and nothing you paste leaves the page.
        </p>
      </ToolProse>
    </ToolShell>
  );
}
