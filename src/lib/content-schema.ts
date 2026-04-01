import type { PortableTextBlock } from "@portabletext/types";

import { slugify } from "@/lib/slugify";

export type ContentMediaItem = {
  id: string;
  type: "image" | "video" | "audio";
  src: string;
  width?: number;
  height?: number;
  alt?: string | null;
  caption?: string | null;
  title?: string | null;
  sortOrder: number;
};

export type ContentProject = {
  id: string;
  slug: string;
  title: string;
  place?: string | null;
  date?: string | null;
  year?: number | null;
  description?: string | null;
  intro?: PortableTextBlock[] | null;
  media: ContentMediaItem[];
};

export type ContentFile = {
  version: 1;
  generatedAt?: string;
  projects: ContentProject[];
};

export function isPortableTextBlockArray(value: unknown): value is PortableTextBlock[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (b) => !!b && typeof b === "object" && "_type" in b && (b as { _type: string })._type === "block",
  );
}

export function normalizeContentFile(raw: unknown): ContentFile {
  const data = raw as Partial<ContentFile> | null | undefined;
  const projects = Array.isArray(data?.projects) ? data.projects : [];

  const normalized: ContentProject[] = projects
    .map((p): ContentProject | null => {
      if (!p || typeof p !== "object") return null;
      const title = String((p as ContentProject).title || "").trim();
      const baseSlug = String((p as ContentProject).slug || "").trim();
      const slug = slugify(baseSlug || title);
      if (!slug) return null;

      const id = String((p as ContentProject).id || slug).trim() || slug;
      const mediaRaw = Array.isArray((p as ContentProject).media) ? (p as ContentProject).media : [];
      const media: ContentMediaItem[] = mediaRaw
        .map((m, i): ContentMediaItem | null => {
          if (!m || typeof m !== "object") return null;
          const mm = m as ContentMediaItem;
          const type = mm.type;
          if (type !== "image" && type !== "video" && type !== "audio") return null;
          const src = String(mm.src || "").trim();
          if (!src) return null;
          return {
            id: String(mm.id || `${id}-m-${i}`),
            type,
            src,
            width: typeof mm.width === "number" ? mm.width : undefined,
            height: typeof mm.height === "number" ? mm.height : undefined,
            alt: mm.alt ?? null,
            caption: mm.caption ?? null,
            title: mm.title ?? null,
            sortOrder: typeof mm.sortOrder === "number" ? mm.sortOrder : i,
          };
        })
        .filter((m): m is ContentMediaItem => Boolean(m))
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const intro = isPortableTextBlockArray((p as ContentProject).intro)
        ? ((p as ContentProject).intro as PortableTextBlock[])
        : null;
      return {
        id,
        slug,
        title: title || slug,
        place: (p as ContentProject).place ?? null,
        date: (p as ContentProject).date ?? null,
        year: typeof (p as ContentProject).year === "number" ? (p as ContentProject).year : null,
        description: (p as ContentProject).description ?? null,
        intro,
        media,
      };
    })
    .filter((p): p is ContentProject => Boolean(p));

  return {
    version: 1,
    generatedAt: data?.generatedAt,
    projects: normalized,
  };
}
