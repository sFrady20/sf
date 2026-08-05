//shareable ?p= param for the palette tool, dependency-free so it's testable

//compact form, the 4 rgb rows flattened to 12 comma-joined numbers
export const toPaletteParam = (palette: number[][]) =>
  palette
    .flat()
    .map((x) => Number(x.toFixed(3)))
    .join(",");

//reads the compact form, plus the old json links so they don't break
export const parsePaletteParam = (raw: string | null): number[][] | null => {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw);
    if (
      Array.isArray(j) &&
      j.length === 4 &&
      j.every(
        (r) =>
          Array.isArray(r) &&
          r.length === 3 &&
          r.every((n) => typeof n === "number" && Number.isFinite(n)),
      )
    )
      return j as number[][];
  } catch {}
  const n = raw.split(",").map(parseFloat);
  if (n.length === 12 && n.every((x) => Number.isFinite(x)))
    return [n.slice(0, 3), n.slice(3, 6), n.slice(6, 9), n.slice(9, 12)];
  return null;
};
