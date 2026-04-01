import type { PortableTextBlock } from "@portabletext/types";

import { GREY_PALETTES, THUMB_RATIOS } from "@/lib/grey-art";
import { slugify } from "@/lib/slugify";
import type {
  ContentAudioBlock,
  ContentGreyFieldBlock,
  ContentVideoBlock,
  ProjectContentBlock,
  ProjectDetail,
  ProjectIndexItem,
} from "@/types/project";

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

/** Short MDN-hosted samples for demo media (replace in production). */
const DEMO_VIDEO_SRC =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const DEMO_AUDIO_SRC =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

function ptNormal(text: string, key: string): PortableTextBlock {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `${key}-s`,
        text,
        marks: [],
      },
    ],
  };
}

function grey(
  key: string,
  ratioW: number,
  ratioH: number,
  from: string,
  to: string,
  layout?: { widthPct?: number },
): ContentGreyFieldBlock {
  return {
    _type: "greyField",
    _key: key,
    ratioW,
    ratioH,
    from,
    to,
    ...layout,
  };
}

function videoBlock(key: string): ContentVideoBlock {
  return { _type: "embeddedVideo", _key: key, src: DEMO_VIDEO_SRC };
}

function audioBlock(key: string, title?: string): ContentAudioBlock {
  return { _type: "embeddedAudio", _key: key, src: DEMO_AUDIO_SRC, title };
}

function buildContent(seed: number): ProjectContentBlock[] {
  /** Varied widths; all blocks are centered in the column (see GreyField). */
  const widthCycle = [100, 92, 58, 76, 88, 64, 98, 72, 84, 68];
  const blocks: ProjectContentBlock[] = [];

  blocks.push(
    ptNormal(
      "Notes from the process: material, light, and what stays when the frame cuts away. This piece sits between documentation and fiction.",
      `t-${seed}-open`,
    ),
  );

  const panelCount = 5 + (seed % 3);
  for (let i = 0; i < panelCount; i += 1) {
    const ri = (seed * 11 + i * 7) % THUMB_RATIOS.length;
    const [rw, rh] = THUMB_RATIOS[ri]!;
    const pi = (seed + i * 3) % GREY_PALETTES.length;
    const [from, to] = GREY_PALETTES[pi]!;
    const widthPct = widthCycle[(seed + i) % widthCycle.length]!;

    blocks.push(
      grey(`g-${seed}-${i}`, rw, rh, from, to, {
        widthPct,
      }),
    );

    if (i === 1) {
      blocks.push(
        ptNormal(
          "A second passage: rhythm and repetition. The sequence is edited so silence does as much work as sound.",
          `t-${seed}-mid`,
        ),
      );
    }

    if (i === 2 && seed % 2 === 0) {
      blocks.push(videoBlock(`v-${seed}`));
    }

    if (i === 4 && seed % 3 !== 0) {
      blocks.push(audioBlock(`a-${seed}`, "Study — ambient layer"));
    }
  }

  blocks.push(
    ptNormal(
      "Thanks for looking. Contact is open for commissions, prints, and installation versions of this work.",
      `t-${seed}-close`,
    ),
  );

  return blocks;
}

function buildDetail(title: string, index: number): ProjectDetail {
  const slug = slugify(title);
  const year = 2018 + (index % 8);
  return {
    _id: `demo-${slug}`,
    title,
    slug,
    year,
    date: null,
    summary:
      index % 2 === 0
        ? "Mixed media — installation and stills. Demo copy for layout."
        : null,
    content: buildContent(index + 1),
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
