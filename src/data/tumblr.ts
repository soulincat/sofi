import { cache } from "react";
import type { PortableTextBlock } from "@portabletext/types";

import { slugify } from "@/lib/slugify";
import type {
  ContentRemoteImageBlock,
  ProjectContentBlock,
  ProjectDetail,
  ProjectIndexItem,
} from "@/types/project";

/** Server-side only — do not use NEXT_PUBLIC for the consumer key. */
export const tumblrConfigured = Boolean(
  process.env.TUMBLR_BLOG?.trim() && process.env.TUMBLR_CONSUMER_KEY?.trim(),
);

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

type TumblrPhotoPost = {
  id: number | string;
  slug?: string;
  summary?: string;
  caption?: string;
  date?: string;
  photos?: Array<{
    original_size?: { url: string; width: number; height: number };
    alt_sizes?: Array<{ url: string; width: number; height: number }>;
  }>;
};

function postTitle(p: TumblrPhotoPost): string {
  const s = p.summary ? stripHtml(p.summary) : "";
  if (s) return s.slice(0, 300);
  if (p.slug) return String(p.slug).replace(/-/g, " ");
  return `Post ${p.id}`;
}

function assignSlugs(posts: TumblrPhotoPost[]): Map<string, string> {
  const used = new Set<string>();
  const idToSlug = new Map<string, string>();
  for (const p of posts) {
    const title = postTitle(p);
    let base = slugify(p.slug || title);
    if (!base) base = `post-${p.id}`;
    let s = base;
    if (used.has(s)) {
      s = slugify(`${base}-${p.id}`);
    }
    if (used.has(s)) {
      s = `post-${p.id}`;
    }
    used.add(s);
    idToSlug.set(String(p.id), s);
  }
  return idToSlug;
}

const fetchPhotoPosts = cache(async (): Promise<TumblrPhotoPost[]> => {
  const blogRaw = process.env.TUMBLR_BLOG!.trim();
  const apiKey = process.env.TUMBLR_CONSUMER_KEY!.trim();
  const blogHost = blogRaw.includes(".") ? blogRaw : `${blogRaw}.tumblr.com`;

  const url = new URL(
    `https://api.tumblr.com/v2/blog/${encodeURIComponent(blogHost)}/posts/photo`,
  );
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("limit", "50");

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Tumblr API ${res.status}: ${body.slice(0, 200)}`);
  }
  const json: { response?: { posts?: TumblrPhotoPost[] } } = await res.json();
  return json?.response?.posts ?? [];
});

function captionBlock(postId: string | number, text: string): PortableTextBlock {
  const key = `cap-${postId}`;
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `${key}-s`,
        text: text.slice(0, 8000),
        marks: [],
      },
    ],
  };
}

export const getTumblrProjectIndex = cache(async (): Promise<ProjectIndexItem[]> => {
  const posts = await fetchPhotoPosts();
  const idToSlug = assignSlugs(posts);
  return posts
    .filter((p) => (p.photos?.length ?? 0) > 0)
    .map((p) => {
      const slug = idToSlug.get(String(p.id))!;
      const title = postTitle(p).slice(0, 200) || slug;
      const y = p.date ? new Date(p.date).getFullYear() : NaN;
      return {
        _id: `tumblr-${p.id}`,
        title,
        slug,
        year: Number.isFinite(y) ? y : null,
        summary: null,
      } satisfies ProjectIndexItem;
    });
});

export const getTumblrProjectBySlug = cache(
  async (slug: string): Promise<ProjectDetail | null> => {
    const posts = await fetchPhotoPosts();
    const idToSlug = assignSlugs(posts);
    const post = posts.find((p) => idToSlug.get(String(p.id)) === slug);
    if (!post || !(post.photos?.length)) {
      return null;
    }

    const title = postTitle(post).slice(0, 300);
    const blocks: ProjectContentBlock[] = [];
    const cap = post.caption ? stripHtml(post.caption) : "";
    if (cap.length > 1) {
      blocks.push(captionBlock(post.id, cap));
    }

    post.photos.forEach((ph, i) => {
      const o = ph?.original_size ?? ph?.alt_sizes?.[0];
      if (!o?.url) return;
      const img: ContentRemoteImageBlock = {
        _type: "remoteImage",
        _key: `t-${post.id}-img-${i}`,
        src: o.url,
        width: Math.max(1, o.width || 1600),
        height: Math.max(1, o.height || 1200),
        alt: title.slice(0, 140),
      };
      blocks.push(img);
    });

    const y = post.date ? new Date(post.date).getFullYear() : NaN;
    return {
      _id: `tumblr-${post.id}`,
      title,
      slug: idToSlug.get(String(post.id))!,
      year: Number.isFinite(y) ? y : null,
      date: post.date ?? null,
      summary: null,
      content: blocks.length ? blocks : null,
    };
  },
);

export async function getTumblrSlugsForStatic(): Promise<string[]> {
  const idx = await getTumblrProjectIndex();
  return idx.map((p) => p.slug);
}
