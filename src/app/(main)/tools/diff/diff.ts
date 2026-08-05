//line diff, dependency-free. common prefix/suffix get trimmed first, the
//middle goes through lcs - and if the middle is huge we degrade to a plain
//replace instead of freezing the tab

export type DiffLine = { type: "same" | "add" | "del"; text: string };

const MAX_LCS = 3000;

export function lineDiff(a: string, b: string): DiffLine[] {
  const al = a.split("\n");
  const bl = b.split("\n");

  //trim matching prefix
  let start = 0;
  while (start < al.length && start < bl.length && al[start] === bl[start])
    start++;
  //trim matching suffix
  let endA = al.length;
  let endB = bl.length;
  while (endA > start && endB > start && al[endA - 1] === bl[endB - 1]) {
    endA--;
    endB--;
  }

  const midA = al.slice(start, endA);
  const midB = bl.slice(start, endB);

  const out: DiffLine[] = al
    .slice(0, start)
    .map((text) => ({ type: "same" as const, text }));

  if (midA.length > MAX_LCS || midB.length > MAX_LCS) {
    //too big to be clever about
    out.push(...midA.map((text) => ({ type: "del" as const, text })));
    out.push(...midB.map((text) => ({ type: "add" as const, text })));
  } else if (midA.length || midB.length) {
    //classic lcs table over the changed middle
    const n = midA.length;
    const m = midB.length;
    const table = new Uint32Array((n + 1) * (m + 1));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        table[i * (m + 1) + j] =
          midA[i] === midB[j]
            ? table[(i + 1) * (m + 1) + j + 1] + 1
            : Math.max(
                table[(i + 1) * (m + 1) + j],
                table[i * (m + 1) + j + 1],
              );
      }
    }
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (midA[i] === midB[j]) {
        out.push({ type: "same", text: midA[i] });
        i++;
        j++;
      } else if (table[(i + 1) * (m + 1) + j] >= table[i * (m + 1) + j + 1]) {
        out.push({ type: "del", text: midA[i] });
        i++;
      } else {
        out.push({ type: "add", text: midB[j] });
        j++;
      }
    }
    while (i < n) out.push({ type: "del", text: midA[i++] });
    while (j < m) out.push({ type: "add", text: midB[j++] });
  }

  out.push(...al.slice(endA).map((text) => ({ type: "same" as const, text })));
  return out;
}

export const diffStats = (lines: DiffLine[]) => ({
  added: lines.filter((l) => l.type === "add").length,
  removed: lines.filter((l) => l.type === "del").length,
});
