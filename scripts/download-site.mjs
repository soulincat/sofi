#!/usr/bin/env node
/**
 * Downloads a public Tumblr-backed site from its RSS feed — no API keys.
 * Parses <item> titles, permalinks, dates, and all <img> URLs in each description,
 * saves files under public/site-import/{slug}/ and writes src/data/site-import.json
 *
 * Usage:
 *   npm run download:site
 *   SITE_IMPORT_BASE=https://example.art npm run download:site
 */

import * as cheerio from "cheerio";
import { createWorker } from "tesseract.js";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sizeOf from "image-size";

import { config } from "dotenv";

import { ocrTextToPortableBlocks } from "./ocr-to-portable.mjs";

config({ path: ".env.local" });
config({ path: ".env" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "site-import");
const MANIFEST = join(ROOT, "src", "data", "site-import.json");

const BASE = (process.env.SITE_IMPORT_BASE || "https://sofiadimitrova.art").replace(
  /\/$/,
  "",
);

const UA =
  "Mozilla/5.0 (compatible; SofiSiteImporter/1; +https://github.com/)";

/** Set SITE_IMPORT_OCR=0 to skip (faster). */
const OCR_ENABLED = process.env.SITE_IMPORT_OCR !== "0";
const OCR_MIN_WORDS = Math.max(
  6,
  Number.parseInt(process.env.SITE_IMPORT_OCR_MIN_WORDS || "14", 10) || 14,
);
/** Skip photos where OCR is guessing (typographic slides are usually 65+). */
const OCR_MIN_CONFIDENCE = Math.min(
  95,
  Math.max(
    35,
    Number.parseInt(process.env.SITE_IMPORT_OCR_MIN_CONFIDENCE || "62", 10) || 62,
  ),
);

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

async function fetchText(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.text();
}

function parseRssItems(rssXml) {
  const $ = cheerio.load(rssXml, { xmlMode: true, decodeEntities: true });
  const items = [];
  $("item").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    const link = $(el).find("link").first().text().trim();
    const pubDate = $(el).find("pubDate").first().text().trim();
    const description = $(el).find("description").first().text() || "";
    const $desc = cheerio.load(description);
    const srcs = [];
    $desc("img[src]").each((__, img) => {
      let src = $desc(img).attr("src");
      if (!src) return;
      if (src.startsWith("//")) src = `https:${src}`;
      if (!src.startsWith("http")) return;
      if (!src.includes("media.tumblr.com")) return;
      srcs.push(src);
    });
    items.push({ title, link, pubDate, imageUrls: [...new Set(srcs)] });
  });
  return items;
}

async function downloadToFile(url, destPath) {
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`img ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(destPath, buf);
  try {
    const dim = sizeOf(buf);
    return { width: dim.width || 1200, height: dim.height || 900 };
  } catch {
    return { width: 1200, height: 900 };
  }
}

function extFromUrl(url) {
  const m = url.match(/\.(jpe?g|png|webp|gif)(\?|$)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

function meaningfulWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z']/g, "").toLowerCase())
    .filter((w) => w.length >= 3);
}

function meaningfulWordCount(text) {
  return meaningfulWords(text).length;
}

function avgVowelRatio(text) {
  const words = meaningfulWords(text);
  if (!words.length) return 0;
  let sum = 0;
  for (const w of words) {
    const v = (w.match(/[aeiouy]/g) || []).length;
    sum += v / w.length;
  }
  return sum / words.length;
}

function looksLikeArtLabel(text) {
  const t = text.slice(0, 500);
  return (
    /\b(19|20)\d{2}\b/.test(t) ||
    /\b(cm|mm|ink|oil|canvas|paper|plaster|textile|series|gallery|exhibition|mixed\s+media)\b/i.test(
      t,
    )
  );
}

/**
 * Pick the image with the most OCR words (typographic / statement slides),
 * turn it into portable text, delete that file, remove it from the list.
 */
function textPanelScore(text, confidence) {
  const conf = typeof confidence === "number" ? confidence : 0;
  const words = meaningfulWordCount(text);
  const vowels = avgVowelRatio(text);
  const strict =
    conf >= OCR_MIN_CONFIDENCE &&
    words >= OCR_MIN_WORDS &&
    vowels >= 0.2 &&
    (looksLikeArtLabel(text) || words >= 25);
  const relaxed =
    conf >= 45 &&
    words >= Math.max(OCR_MIN_WORDS, 12) &&
    vowels >= 0.22 &&
    (looksLikeArtLabel(text) || words >= 22);
  if (!strict && !relaxed) return null;
  const tier = strict ? 2 : 1;
  const score = words * (conf / 100) * (0.85 + vowels);
  return { score, tier, words, conf, text };
}

/** Weaker gate: only at common title-card positions, and must look like a caption (not artwork OCR noise). */
function textPanelScoreFallback(text, confidence) {
  const conf = typeof confidence === "number" ? confidence : 0;
  const words = meaningfulWordCount(text);
  const vowels = avgVowelRatio(text);
  if (conf < 38 || words < 5 || vowels < 0.19 || !looksLikeArtLabel(text)) return null;
  const tier = 0;
  const score = words * (conf / 100) * (0.85 + vowels);
  return { score, tier, words, conf, text };
}

async function extractTextPanel(worker, slug, images) {
  if (!OCR_ENABLED || images.length < 2) {
    return { intro: null, images };
  }

  let bestIdx = -1;
  let bestPick = null;

  for (let i = 0; i < images.length; i++) {
    const rel = images[i].localPath.replace(/^\//, "");
    const diskPath = join(ROOT, "public", rel);
    try {
      const {
        data: { text, confidence },
      } = await worker.recognize(diskPath);
      const pick = textPanelScore(text, confidence);
      if (!pick) continue;
      const beats =
        !bestPick ||
        pick.tier > bestPick.tier ||
        (pick.tier === bestPick.tier && pick.score > bestPick.score);
      if (beats) {
        bestPick = { ...pick, idx: i };
        bestIdx = i;
      }
    } catch (e) {
      console.warn("  OCR failed", rel, e.message);
    }
  }

  if (bestIdx < 0 || !bestPick) {
    const order = [1, images.length - 1, 0].filter(
      (i, j, a) => i >= 0 && i < images.length && a.indexOf(i) === j,
    );
    for (const i of order) {
      const rel = images[i].localPath.replace(/^\//, "");
      const diskPath = join(ROOT, "public", rel);
      try {
        const {
          data: { text, confidence },
        } = await worker.recognize(diskPath);
        const pick = textPanelScoreFallback(text, confidence);
        if (pick) {
          bestPick = { ...pick, idx: i };
          bestIdx = i;
          break;
        }
      } catch {
        /* skip */
      }
    }
  }

  if (bestIdx < 0 || !bestPick) {
    return { intro: null, images };
  }

  const bestText = bestPick.text;

  const intro = ocrTextToPortableBlocks(bestText, slug);
  if (!intro.length) {
    return { intro: null, images };
  }

  const removed = images[bestIdx];
  const rel = removed.localPath.replace(/^\//, "");
  const diskPath = join(ROOT, "public", rel);
  try {
    unlinkSync(diskPath);
  } catch (e) {
    console.warn("  could not delete text slide", rel, e.message);
  }

  const nextImages = images.filter((_, j) => j !== bestIdx);
  console.log(
    `  OCR: ${bestPick.words} words (~${Math.round(bestPick.conf)}% conf) → intro; removed ${removed.localPath}`,
  );
  return { intro, images: nextImages };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const rssUrl = `${BASE}/rss`;
  console.log("Fetching", rssUrl);
  const rssXml = await fetchText(rssUrl);
  const rawItems = parseRssItems(rssXml);
  const items = rawItems.filter((i) => i.imageUrls.length > 0);

  console.log(`Found ${items.length} posts with images (from ${rawItems.length} RSS items)`);

  const usedSlugs = new Set();
  const projects = [];

  let ocrWorker = null;
  if (OCR_ENABLED) {
    console.log("Starting Tesseract (first run may download eng traineddata)…");
    ocrWorker = await createWorker("eng");
  }

  for (const item of items) {
    const postId = item.link.match(/\/post\/(\d+)/)?.[1] || "x";
    let slug = slugify(item.title) || `post-${postId}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${postId}`;
    usedSlugs.add(slug);

    const dir = join(OUT_DIR, slug);
    mkdirSync(dir, { recursive: true });

    const images = [];
    let idx = 0;
    for (const url of item.imageUrls) {
      const ext = extFromUrl(url);
      const filename = `${String(idx).padStart(3, "0")}.${ext}`;
      const diskPath = join(dir, filename);
      try {
        const dim = await downloadToFile(url, diskPath);
        images.push({
          localPath: `/site-import/${slug}/${filename}`,
          width: dim.width,
          height: dim.height,
        });
        idx += 1;
        await new Promise((r) => setTimeout(r, 120));
      } catch (e) {
        console.warn("  skip", url.slice(0, 70), e.message);
      }
    }

    if (images.length === 0) continue;

    let year = null;
    if (item.pubDate) {
      const y = new Date(item.pubDate).getFullYear();
      if (Number.isFinite(y) && y >= 1990 && y <= 2100) year = y;
    }

    let intro = null;
    let finalImages = images;
    if (ocrWorker) {
      const extracted = await extractTextPanel(ocrWorker, slug, images);
      intro = extracted.intro;
      finalImages = extracted.images;
    }

    if (finalImages.length === 0) continue;

    const row = {
      slug,
      title: item.title || slug,
      year,
      sourceUrl: item.link,
      images: finalImages,
    };
    if (intro?.length) row.intro = intro;
    projects.push(row);
    console.log(" ✓", slug, `(${finalImages.length} images${intro ? ", +intro" : ""})`);
  }

  if (ocrWorker) {
    await ocrWorker.terminate();
  }

  const manifest = {
    source: rssUrl,
    base: BASE,
    generatedAt: new Date().toISOString(),
    projects,
  };

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nWrote ${MANIFEST}`);
  console.log(`Images under ${OUT_DIR}`);
  console.log(
    "The Next app uses this when src/data/site-import.json exists (takes priority over Sanity/Tumblr/demo).",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
