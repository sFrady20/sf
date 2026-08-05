//text statistics, dependency-free so it's testable

export type TextStats = {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  uniqueWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingMinutes: number;
  speakingMinutes: number;
};

export function textStats(input: string): TextStats {
  const words = input.match(/\S+/g) ?? [];
  const unique = new Set(
    words.map((w) =>
      w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""),
    ),
  );
  unique.delete("");
  //a sentence ends at ./!/? runs, ellipses count once
  const sentences = (input.match(/[^.!?]+[.!?]+/g) ?? []).filter((s) =>
    /\S/.test(s),
  );
  //unterminated trailing text still counts as one
  const tail = input.replace(/^[\s\S]*[.!?]/, "").trim();
  const sentenceCount = sentences.length + (tail !== "" ? 1 : 0);
  const paragraphs = input.split(/\n\s*\n/).filter((p) => p.trim() !== "");

  return {
    characters: [...input].length,
    charactersNoSpaces: [...input.replace(/\s/g, "")].length,
    words: words.length,
    uniqueWords: unique.size,
    sentences: input.trim() === "" ? 0 : sentenceCount,
    paragraphs: paragraphs.length,
    lines: input === "" ? 0 : input.split("\n").length,
    //200 wpm reading, 130 speaking - the usual estimates
    readingMinutes: Math.ceil(words.length / 200),
    speakingMinutes: Math.ceil(words.length / 130),
  };
}
