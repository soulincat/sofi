/**
 * Turn raw OCR into minimal Portable Text blocks (normal + h2) for ProjectBody.
 * @param {string} text
 * @param {string} keyPrefix slug-safe prefix for _key ids
 * @returns {object[]}
 */
export function ocrTextToPortableBlocks(text, keyPrefix) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!normalized) return [];

  const paras = normalized
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const blocks = [];
  let bi = 0;
  for (const para of paras) {
    const lines = para
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const joined = lines.join(" ").replace(/\s+/g, " ").trim();
    if (!joined) continue;

    const letters = joined.match(/[a-zA-Z]/g) || [];
    const uppers = joined.match(/[A-Z]/g) || [];
    const letterCount = letters.length;
    const upperRatio = letterCount ? uppers.length / letterCount : 0;
    const isHeading =
      joined.length <= 120 && upperRatio > 0.5 && lines.length <= 4;

    const key = `${keyPrefix}-intro-${bi}`;
    blocks.push({
      _type: "block",
      _key: key,
      style: isHeading ? "h2" : "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${key}-span`,
          text: joined.slice(0, 12000),
          marks: [],
        },
      ],
    });
    bi += 1;
  }
  return blocks;
}
