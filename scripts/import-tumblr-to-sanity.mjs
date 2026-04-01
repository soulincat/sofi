#!/usr/bin/env node
/**
 * Puts Tumblr photo posts INTO Sanity (uploads each image to Sanity CDN, creates Project docs).
 *
 * Nothing is "already there" until you run this once (or add projects by hand in /admin).
 *
 * Tumblr API requires a consumer key from https://www.tumblr.com/oauth/register — only the
 * blog owner (or someone they give the key to) can do that. Skip this script if you don’t have that.
 *
 * 1. SANITY_API_WRITE_TOKEN — sanity.io/manage → API → Tokens (Editor).
 * 2. TUMBLR_BLOG + TUMBLR_CONSUMER_KEY — only if you have them.
 * 3. NEXT_PUBLIC_SANITY_PROJECT_ID (defaults to f8lcj2ht in script if unset).
 *
 * Run: npm run import:tumblr-to-sanity
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const DEFAULT_PROJECT_ID = "f8lcj2ht";

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || DEFAULT_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
const tumblrBlog = process.env.TUMBLR_BLOG?.trim();
const tumblrKey = process.env.TUMBLR_CONSUMER_KEY?.trim();

if (!token) {
  console.error(`
Missing SANITY_API_WRITE_TOKEN in .env.local

1. Open https://www.sanity.io/manage
2. Project → API → Tokens → Create token (Editor)
3. Add: SANITY_API_WRITE_TOKEN=sk...
`);
  process.exit(1);
}

if (!tumblrBlog || !tumblrKey) {
  console.error("Set TUMBLR_BLOG and TUMBLR_CONSUMER_KEY in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-03-01",
  useCdn: false,
  token,
});

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(title) {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s*&\s*/g, "-")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function assignSlugs(posts) {
  const used = new Set();
  const idToSlug = new Map();
  for (const p of posts) {
    const summary = p.summary ? stripHtml(p.summary) : "";
    const title =
      summary.slice(0, 300) ||
      (p.slug ? String(p.slug).replace(/-/g, " ") : `Post ${p.id}`);
    let base = slugify(p.slug || title);
    if (!base) base = `post-${p.id}`;
    let s = base;
    if (used.has(s)) s = slugify(`${base}-${p.id}`);
    if (used.has(s)) s = `post-${p.id}`;
    used.add(s);
    idToSlug.set(String(p.id), s);
  }
  return idToSlug;
}

async function uploadFromUrl(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get("content-type") || "image/jpeg";
  const ext = ct.includes("png") ? "png" : ct.includes("webp") ? "webp" : "jpg";
  const asset = await client.assets.upload("image", buf, {
    filename: `tumblr-${Date.now()}.${ext}`,
    source: { url: imageUrl, id: imageUrl },
  });
  return asset._id;
}

async function main() {
  const blogHost = tumblrBlog.includes(".")
    ? tumblrBlog
    : `${tumblrBlog}.tumblr.com`;
  const url = new URL(
    `https://api.tumblr.com/v2/blog/${encodeURIComponent(blogHost)}/posts/photo`,
  );
  url.searchParams.set("api_key", tumblrKey);
  url.searchParams.set("limit", "50");

  const tr = await fetch(url);
  if (!tr.ok) {
    console.error("Tumblr API", tr.status, await tr.text());
    process.exit(1);
  }

  const tj = await tr.json();
  const posts = tj?.response?.posts ?? [];
  const withPhotos = posts.filter((p) => (p.photos?.length ?? 0) > 0);
  const idToSlug = assignSlugs(withPhotos);

  console.log(
    `→ ${withPhotos.length} photo posts → Sanity \`${projectId}\` / \`${dataset}\` (document ids: tumblr-import-<postId>)\n`,
  );

  for (const post of withPhotos) {
    const slug = idToSlug.get(String(post.id));
    const title =
      (
        post.summary
          ? stripHtml(post.summary).slice(0, 200)
          : post.slug || `Post ${post.id}`
      ).trim() || slug;
    const cap = post.caption ? stripHtml(post.caption) : "";
    const y = post.date ? new Date(post.date).getFullYear() : NaN;

    const content = [];

    if (cap.length > 1) {
      const ck = `cap-${post.id}`;
      content.push({
        _type: "block",
        _key: ck,
        style: "normal",
        markDefs: [],
        children: [
          {
            _type: "span",
            _key: `${ck}-s`,
            text: cap.slice(0, 8000),
            marks: [],
          },
        ],
      });
    }

    let imgIdx = 0;
    for (const ph of post.photos || []) {
      const o = ph?.original_size || ph?.alt_sizes?.[0];
      if (!o?.url) continue;
      try {
        const assetId = await uploadFromUrl(o.url);
        content.push({
          _type: "image",
          _key: `img-${post.id}-${imgIdx}`,
          asset: { _type: "reference", _ref: assetId },
          alt: title.slice(0, 140) || "Photo",
        });
        imgIdx += 1;
        await new Promise((r) => setTimeout(r, 250));
      } catch (e) {
        console.warn("  skip image", String(o.url).slice(0, 60), e?.message);
      }
    }

    const doc = {
      _type: "project",
      _id: `tumblr-import-${post.id}`,
      title,
      slug: { _type: "slug", current: slug },
      content,
    };

    if (Number.isFinite(y) && y >= 1900 && y <= 2100) {
      doc.year = y;
    }

    if (content.length === 0) {
      console.warn("  skip (no usable images/caption)", post.id);
      continue;
    }

    await client.createOrReplace(doc);
    console.log("  ✓", slug);
  }

  console.log(`
Done. Documents live in Sanity (not on disk). Open:
  • https://www.sanity.io/manage → Datasets → Vision / Content
  • Your site: /admin  and  /  (after npm run dev + .env.local with NEXT_PUBLIC_SANITY_PROJECT_ID)
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
