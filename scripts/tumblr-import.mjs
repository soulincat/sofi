#!/usr/bin/env node
/**
 * Fetches public photo posts from a Tumblr blog and prints a JSON outline that
 * matches this site's hierarchy: one Tumblr post → one "project" with ordered images.
 *
 * Requirements:
 *   1. Register an app at https://www.tumblr.com/oauth/register (OAuth consumer key = API key).
 *   2. Set env:
 *        TUMBLR_BLOG=david          # subdomain only, or full host like david.tumblr.com
 *        TUMBLR_CONSUMER_KEY=...
 *
 * Run: npm run import:tumblr > tumblr-outline.json
 *
 * The live Next.js site can read the same blog directly: set TUMBLR_BLOG and
 * TUMBLR_CONSUMER_KEY in .env (no NEXT_PUBLIC on the key). Data layer: Sanity
 * projects win if any exist; otherwise Tumblr photo posts → work pages.
 *
 * This script only prints JSON (no DB write). For Sanity bulk import, use /admin
 * or extend with @sanity/client + SANITY_API_WRITE_TOKEN.
 */

const blogRaw = process.env.TUMBLR_BLOG?.trim();
const apiKey = process.env.TUMBLR_CONSUMER_KEY?.trim();

if (!blogRaw || !apiKey) {
  console.error(
    "Set TUMBLR_BLOG (e.g. myblog or myblog.tumblr.com) and TUMBLR_CONSUMER_KEY.",
  );
  process.exit(1);
}

const blogHost = blogRaw.includes(".") ? blogRaw : `${blogRaw}.tumblr.com`;

const url = new URL(
  `https://api.tumblr.com/v2/blog/${encodeURIComponent(blogHost)}/posts/photo`,
);
url.searchParams.set("api_key", apiKey);
url.searchParams.set("limit", "50");

const res = await fetch(url);
if (!res.ok) {
  console.error("Tumblr API error", res.status, await res.text());
  process.exit(1);
}

const json = await res.json();
const posts = json?.response?.posts ?? [];

const projects = posts.map((post) => {
  const photos = post.photos ?? [];
  const images = photos.map((p) => {
    const o = p.original_size ?? p.alt_sizes?.[0];
    return o
      ? { url: o.url, width: o.width, height: o.height }
      : null;
  }).filter(Boolean);

  const title =
    (post.summary && String(post.summary).replace(/<[^>]+>/g, "").trim()) ||
    post.slug ||
    `post-${post.id}`;

  return {
    tumblrId: post.id,
    slug: post.slug || String(post.id),
    title: title.slice(0, 200),
    date: post.date,
    imageCount: images.length,
    images,
  };
});

console.log(
  JSON.stringify(
    {
      source: blogHost,
      note:
        "Each entry is one Tumblr photo post → one project with multiple images in order. Import into Sanity via /admin manually, or automate with the Sanity API.",
      projects,
    },
    null,
    2,
  ),
);
