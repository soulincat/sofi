import type { PortableTextBlock } from "@portabletext/types";

export type ProjectIndexItem = {
  _id: string;
  title: string;
  slug: string;
  year: number | null;
  summary: string | null;
};

export type ContentGreyFieldBlock = {
  _type: "greyField";
  _key: string;
  ratioW: number;
  ratioH: number;
  from: string;
  to: string;
  caption?: string;
};

export type ContentRemoteImageBlock = {
  _type: "remoteImage";
  _key: string;
  src: string;
  width: number;
  height: number;
  alt?: string;
};

export type ProjectContentBlock =
  | PortableTextBlock
  | ContentGreyFieldBlock
  | ContentRemoteImageBlock;

export type ProjectDetail = {
  _id: string;
  title: string;
  slug: string;
  year: number | null;
  date: string | null;
  summary: string | null;
  content: ProjectContentBlock[] | null;
};
