/** Shared gradient palettes and aspect helpers for placeholder imagery. */

export const GREY_PALETTES = [
  ["#e8e8e8", "#b0b0b0"],
  ["#ececec", "#9ca3af"],
  ["#f3f3f3", "#c7c7c7"],
  ["#e5e5e5", "#a3a3a3"],
  ["#eeeeee", "#d4d4d4"],
] as const;

/** Distinct ratios for index thumbnails and project panels. */
export const THUMB_RATIOS: [number, number][] = [
  [3, 4],
  [16, 9],
  [1, 1],
  [4, 5],
  [2, 3],
  [21, 9],
  [5, 4],
  [3, 2],
  [9, 16],
  [2, 1],
];

/**
 * Legacy four-slot project layout (still used as a base list to pick from).
 */
export const PANEL_SLOT_RATIOS: [number, number][] = [
  [2, 3],
  [21, 9],
  [1, 1],
  [4, 5],
];

export function greyThumbVisual(seed: number): {
  ratioW: number;
  ratioH: number;
  from: string;
  to: string;
} {
  const pi = seed % GREY_PALETTES.length;
  const ri = (seed * 3 + 1) % THUMB_RATIOS.length;
  const [rw, rh] = THUMB_RATIOS[ri]!;
  const [from, to] = GREY_PALETTES[pi]!;
  return { ratioW: rw, ratioH: rh, from, to };
}

/** Deterministic PRNG for stable SSR row splits and layouts. */
export function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

/**
 * Split items into rows of 1 or 2 (max 2 per row), deterministic from seed.
 */
export function splitIndexIntoRows<T>(items: T[], seed: number): T[][] {
  const rand = lcg(seed);
  const rows: T[][] = [];
  let i = 0;
  while (i < items.length) {
    const remaining = items.length - i;
    let size = rand() < 0.5 ? 1 : 2;
    if (size > remaining) size = remaining;
    rows.push(items.slice(i, i + size));
    i += size;
  }
  return rows;
}

/**
 * Index grid: each tile gets a non-full width (keeps aspect ratio) and a vertical
 * offset so items in the same row don’t share the same top edge.
 */
export function homeTileLayout(
  baseSeed: number,
  rowIndex: number,
  colIndex: number,
  rowLen: 1 | 2,
): { widthPct: number; marginTopPx: number } {
  const rand = lcg(baseSeed + rowIndex * 997 + colIndex * 503 + rowLen * 7);
  let widthPct: number;
  if (rowLen === 1) {
    widthPct = 52 + Math.floor(rand() * 33);
  } else {
    /* Keep pair under ~88% + gap so two tiles don’t wrap to a third row */
    widthPct = 36 + Math.floor(rand() * 9);
  }
  const marginTopPx = Math.floor(rand() * 52);
  return { widthPct, marginTopPx };
}
