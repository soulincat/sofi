import type { PortableTextBlock } from "@portabletext/types";

export type ProjectIndexItem = {
  _id: string;
  title: string;
  slug: string;
  year: number | null;
  summary: string | null;
  /** First image for index tiles; when missing, the home grid uses a neutral placeholder. */
  cover?: { src: string; width: number; height: number } | null;
};

export type ContentGreyFieldBlock = {
  _type: "greyField";
  _key: string;
  ratioW: number;
  ratioH: number;
  from: string;
  to: string;
  caption?: string;
  /** Visual width as % of column; default 100. Centered in the column. */
  widthPct?: number;
};

export type ContentRemoteImageBlock = {
  _type: "remoteImage";
  _key: string;
  src: string;
  width: number;
  height: number;
  alt?: string;
  caption?: string;
};

export type ContentVideoBlock = {
  _type: "embeddedVideo";
  _key: string;
  src: string;
  poster?: string;
};

export type ContentAudioBlock = {
  _type: "embeddedAudio";
  _key: string;
  src: string;
  title?: string;
};

export type ProjectContentBlock =
  | PortableTextBlock
  | ContentGreyFieldBlock
  | ContentRemoteImageBlock
  | ContentVideoBlock
  | ContentAudioBlock;

export type ProjectDetail = {
  _id: string;
  title: string;
  slug: string;
  place?: string | null;
  year: number | null;
  date: string | null;
  summary: string | null;
  content: ProjectContentBlock[] | null;
};
