import type { PortableTextBlock } from "@portabletext/types";

import { slugify } from "@/lib/slugify";
import type {
  ContentGreyFieldBlock,
  ProjectContentBlock,
  ProjectDetail,
  ProjectIndexItem,
} from "@/types/project";

type SpanChild = { _type: "span"; text: string; marks: [] };

const DEMO_TITLES = [
  "I'm the wound, I'm the weapon",
  "Beneath the Surface",
  "Tha Anatomy of Silence",
  "3AM",
  "Partly True Series",
  "Lite Haus Gallery Exhibit",
  "Fleeting Territory",
  "See Through",
  "Visual Diary of my Inner Demons",
  "Feeling Blue",
  "Between Now & Then",
  "Damaged Goods Series",
  "Cloudy Series",
] as const;

function span(text: string): SpanChild {
  return { _type: "span", text, marks: [] };
}

function paragraph(key: string, text: string): PortableTextBlock {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [span(text)] as PortableTextBlock["children"],
  };
}

function grey(
  key: string,
  ratioW: number,
  ratioH: number,
  from: string,
  to: string,
  caption?: string,
): ContentGreyFieldBlock {
  return {
    _type: "greyField",
    _key: key,
    ratioW,
    ratioH,
    from,
    to,
    caption,
  };
}

function greyPlaceholders(seed: number): ContentGreyFieldBlock[] {
  const palettes = [
    ["#ebebeb", "#c4c4c4"],
    ["#e0e0e0", "#9e9e9e"],
    ["#f0f0f0", "#bdbdbd"],
    ["#ececec", "#a8a8a8"],
    ["#efefef", "#d0d0d0"],
    ["#e8e8e8", "#b0b0b0"],
  ] as const;
  const ratios: [number, number][] = [
    [4, 5],
    [3, 2],
    [16, 9],
    [1, 1],
    [5, 4],
    [2, 3],
  ];
  const blocks: ContentGreyFieldBlock[] = [];
  for (let i = 0; i < 5; i += 1) {
    const pi = (seed + i) % palettes.length;
    const ri = (seed + i * 2) % ratios.length;
    const [rw, rh] = ratios[ri]!;
    const [from, to] = palettes[pi]!;
    blocks.push(
      grey(`g-${seed}-${i}`, rw, rh, from, to, i === 0 ? "Placeholder" : undefined),
    );
  }
  return blocks;
}

function buildDetail(title: string, index: number): ProjectDetail {
  const slug = slugify(title);
  const year = 2018 + (index % 8);

  const blocks: ProjectContentBlock[] = [
    paragraph(`intro-${slug}`, "Exhibition documentation (placeholder layout)."),
    ...greyPlaceholders(index),
  ];

  return {
    _id: `demo-${slug}`,
    title,
    slug,
    year,
    date: null,
    summary: null,
    content: blocks,
  };
}

const DETAILS: ProjectDetail[] = DEMO_TITLES.map((title, i) => buildDetail(title, i));

export const DEMO_PROJECT_INDEX: ProjectIndexItem[] = DETAILS.map((p) => ({
  _id: p._id,
  title: p.title,
  slug: p.slug,
  year: p.year,
  summary: p.summary,
}));

const BY_SLUG = Object.fromEntries(DETAILS.map((p) => [p.slug, p]));

export function getDemoProjectBySlug(slug: string): ProjectDetail | null {
  return BY_SLUG[slug] ?? null;
}
