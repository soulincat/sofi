import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { PortableTextBlock } from "@portabletext/types";
import { cache } from "react";

import type {
  ContentRemoteImageBlock,
  ProjectContentBlock,
  ProjectDetail,
  ProjectIndexItem,
} from "@/types/project";

export type SiteImportManifest = {
  source?: string;
  base?: string;
  generatedAt?: string;
  projects: Array<{
    slug: string;
    title: string;
    year: number | null;
    sourceUrl?: string;
    /** OCR’d typographic slide → portable text, shown above gallery images */
    intro?: PortableTextBlock[] | null;
    images: Array<{ localPath: string; width: number; height: number }>;
  }>;
};

function readManifestFromDisk(): SiteImportManifest | null {
  const filePath = path.join(process.cwd(), "src/data/site-import.json");
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    const raw = JSON.parse(readFileSync(filePath, "utf8")) as SiteImportManifest;
    if (!Array.isArray(raw?.projects) || raw.projects.length === 0) {
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

/** Cached per request in RSC — RSS download output + local files under /public/site-import */
export const loadSiteImportManifest = cache(readManifestFromDisk);

export function siteImportToIndexItems(): ProjectIndexItem[] {
  const m = loadSiteImportManifest();
  if (!m) return [];
  return m.projects.map((p) => {
    const first = p.images[0];
    return {
      _id: `import-${p.slug}`,
      title: p.title,
      slug: p.slug,
      year: p.year,
      summary: null,
      cover: first
        ? { src: first.localPath, width: first.width, height: first.height }
        : null,
    };
  });
}

export function siteImportToDetail(slug: string): ProjectDetail | null {
  const m = loadSiteImportManifest();
  if (!m) return null;
  const p = m.projects.find((x) => x.slug === slug);
  if (!p || !p.images.length) return null;

  const introBlocks = (p.intro ?? []).filter(
    (b): b is PortableTextBlock =>
      Boolean(b && typeof b === "object" && (b as PortableTextBlock)._type === "block"),
  );

  const imageBlocks: ProjectContentBlock[] = p.images.map((img, i) => {
    const block: ContentRemoteImageBlock = {
      _type: "remoteImage",
      _key: `${p.slug}-img-${i}`,
      src: img.localPath,
      width: img.width,
      height: img.height,
      alt: p.title,
    };
    return block;
  });

  const content: ProjectContentBlock[] = [...introBlocks, ...imageBlocks];

  return {
    _id: `import-${p.slug}`,
    title: p.title,
    slug: p.slug,
    year: p.year,
    date: null,
    summary: null,
    content,
  };
}

export function siteImportSlugs(): string[] {
  const m = loadSiteImportManifest();
  if (!m) return [];
  return m.projects.map((p) => p.slug);
}
