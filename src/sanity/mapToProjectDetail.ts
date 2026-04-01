import type { PortableTextBlock } from "@portabletext/types";

import type {
  ContentAudioBlock,
  ContentRemoteImageBlock,
  ContentVideoBlock,
  ProjectContentBlock,
  ProjectDetail,
  ProjectIndexItem,
} from "@/types/project";

type SanityIndexRow = {
  _id: string;
  title: string;
  slug: string;
  year?: number | null;
  summary?: string | null;
};

type SanityImageItem = {
  _key: string;
  _type: "image";
  alt?: string;
  caption?: string;
  src: string | null;
  width?: number | null;
  height?: number | null;
};

type SanityVideoItem = { _key: string; _type: "videoEmbed"; url?: string | null };

type SanityAudioItem = {
  _key: string;
  _type: "audioEmbed";
  url?: string | null;
  label?: string | null;
};

type SanityContentItem =
  | PortableTextBlock
  | SanityImageItem
  | SanityVideoItem
  | SanityAudioItem;

export function mapSanityIndexRow(row: SanityIndexRow): ProjectIndexItem {
  return {
    _id: row._id,
    title: row.title,
    slug: row.slug,
    year: row.year ?? null,
    summary: row.summary ?? null,
  };
}

function mapContentItem(item: SanityContentItem): ProjectContentBlock | null {
  if (!item || typeof item !== "object" || !("_type" in item)) return null;

  if (item._type === "block") {
    return item as PortableTextBlock;
  }

  if (item._type === "image") {
    const img = item as SanityImageItem;
    const src = img.src;
    const w = img.width ?? 800;
    const h = img.height ?? 600;
    if (!src) return null;
    const block: ContentRemoteImageBlock = {
      _type: "remoteImage",
      _key: img._key,
      src,
      width: w,
      height: h,
      alt: img.alt,
      caption: img.caption ?? undefined,
    };
    return block;
  }

  if (item._type === "videoEmbed") {
    const v = item as SanityVideoItem;
    const url = v.url;
    if (!url) return null;
    return {
      _type: "embeddedVideo",
      _key: v._key,
      src: url,
    } satisfies ContentVideoBlock;
  }

  if (item._type === "audioEmbed") {
    const a = item as SanityAudioItem;
    const url = a.url;
    if (!url) return null;
    return {
      _type: "embeddedAudio",
      _key: a._key,
      src: url,
      title: a.label ?? undefined,
    } satisfies ContentAudioBlock;
  }

  return null;
}

export function mapSanityProjectDetail(raw: {
  _id: string;
  title: string;
  slug: string;
  year?: number | null;
  summary?: string | null;
  content?: SanityContentItem[] | null;
}): ProjectDetail {
  const content = (raw.content ?? [])
    .map(mapContentItem)
    .filter((b): b is ProjectContentBlock => b != null);

  return {
    _id: raw._id,
    title: raw.title,
    slug: raw.slug,
    year: raw.year ?? null,
    date: null,
    summary: raw.summary ?? null,
    content: content.length ? content : null,
  };
}
