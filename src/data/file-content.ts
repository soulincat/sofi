import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { PortableTextBlock } from "@portabletext/types";

import type {
  ContentAudioBlock,
  ContentRemoteImageBlock,
  ContentVideoBlock,
  ProjectContentBlock,
  ProjectDetail,
  ProjectIndexItem,
} from "@/types/project";
import { normalizeContentFile, type ContentFile, type ContentProject } from "@/lib/content-schema";

const CONTENT_FILE = path.join(process.cwd(), "content", "projects.json");

export function readContentFile(): ContentFile | null {
  if (!existsSync(CONTENT_FILE)) return null;
  try {
    const raw = JSON.parse(readFileSync(CONTENT_FILE, "utf8"));
    const normalized = normalizeContentFile(raw);
    if (!normalized.projects.length) return null;
    return normalized;
  } catch {
    return null;
  }
}

function toIndexItem(p: ContentProject): ProjectIndexItem {
  const firstImage = p.media.find((m) => m.type === "image" && m.width && m.height);
  return {
    _id: `file-${p.id}`,
    title: p.title,
    slug: p.slug,
    year: p.year ?? null,
    summary: p.description ?? null,
    cover: firstImage
      ? {
          src: firstImage.src,
          width: firstImage.width as number,
          height: firstImage.height as number,
        }
      : null,
  };
}

function toDetail(p: ContentProject): ProjectDetail {
  const intro = (p.intro ?? []) as PortableTextBlock[];
  const mediaBlocks: ProjectContentBlock[] = p.media.map((m, i) => {
    if (m.type === "image") {
      const b: ContentRemoteImageBlock = {
        _type: "remoteImage",
        _key: m.id || `${p.slug}-img-${i}`,
        src: m.src,
        width: Math.max(1, m.width || 1600),
        height: Math.max(1, m.height || 1200),
        alt: m.alt ?? p.title,
        caption: m.caption ?? undefined,
      };
      return b;
    }
    if (m.type === "video") {
      const b: ContentVideoBlock = {
        _type: "embeddedVideo",
        _key: m.id || `${p.slug}-vid-${i}`,
        src: m.src,
      };
      return b;
    }
    const b: ContentAudioBlock = {
      _type: "embeddedAudio",
      _key: m.id || `${p.slug}-aud-${i}`,
      src: m.src,
      title: m.title ?? p.title,
    };
    return b;
  });

  const content = [...intro, ...mediaBlocks];
  return {
    _id: `file-${p.id}`,
    title: p.title,
    slug: p.slug,
    place: p.place ?? null,
    year: p.year ?? null,
    date: p.date ?? null,
    summary: p.description ?? null,
    content,
  };
}

export function getFileProjectIndex(): ProjectIndexItem[] {
  const file = readContentFile();
  if (!file) return [];
  return file.projects.map(toIndexItem);
}

export function getFileProjectBySlug(slug: string): ProjectDetail | null {
  const file = readContentFile();
  if (!file) return null;
  const p = file.projects.find((x) => x.slug === slug);
  return p ? toDetail(p) : null;
}

export function getFileProjectSlugs(): string[] {
  const file = readContentFile();
  if (!file) return [];
  return file.projects.map((p) => p.slug);
}
