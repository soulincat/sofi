import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

import { hasEditSession } from "@/lib/edit-auth";
import { commitFilesToGitHub } from "@/lib/github-content";
import { normalizeContentFile, type ContentMediaItem, type ContentProject } from "@/lib/content-schema";
import { slugify } from "@/lib/slugify";

type UploadItem = {
  tempId: string;
  filename: string;
  mimeType: string;
  dataBase64: string;
  width?: number;
  height?: number;
};

type MediaInput = {
  id?: string;
  type: "image" | "video" | "audio";
  src?: string;
  uploadTempId?: string;
  width?: number;
  height?: number;
  alt?: string | null;
  caption?: string | null;
  title?: string | null;
  sortOrder: number;
};

type SavePayload = {
  project: {
    id?: string;
    slug?: string;
    title: string;
    place?: string | null;
    date?: string | null;
    year?: number | null;
    description?: string | null;
    intro?: unknown;
    media: MediaInput[];
  };
  uploads?: UploadItem[];
};

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function extFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("wav")) return "wav";
  return "jpg";
}

const CONTENT_PATH = path.join(process.cwd(), "content", "projects.json");

export async function POST(req: Request) {
  if (!(await hasEditSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as SavePayload | null;
  if (!body?.project?.title) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const raw = JSON.parse(readFileSync(CONTENT_PATH, "utf8"));
  const current = normalizeContentFile(raw);

  const title = body.project.title.trim();
  const slug = slugify(body.project.slug || title);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Missing slug/title" }, { status: 400 });
  }

  const uploads = body.uploads ?? [];
  const uploadMap = new Map(uploads.map((u) => [u.tempId, u]));
  const filesToCommit: Array<{ path: string; contentBase64: string }> = [];

  const media: ContentMediaItem[] = [];
  for (let i = 0; i < body.project.media.length; i++) {
    const m = body.project.media[i]!;
    let src = m.src || "";
    let width = m.width;
    let height = m.height;
    if (m.uploadTempId) {
      const up = uploadMap.get(m.uploadTempId);
      if (!up) continue;
      const ext = extFromMime(up.mimeType);
      const filename = `${Date.now()}-${i}-${safeName(up.filename || `media.${ext}`)}`;
      const repoPath = `public/uploads/${slug}/${filename}`;
      src = `/uploads/${slug}/${filename}`;
      width = up.width ?? width;
      height = up.height ?? height;
      filesToCommit.push({ path: repoPath, contentBase64: up.dataBase64 });
    }
    if (!src) continue;
    media.push({
      id: m.id || `${slug}-m-${i}`,
      type: m.type,
      src,
      width,
      height,
      alt: m.alt ?? null,
      caption: m.caption ?? null,
      title: m.title ?? null,
      sortOrder: typeof m.sortOrder === "number" ? m.sortOrder : i,
    });
  }

  const project: ContentProject = {
    id: body.project.id?.trim() || slug,
    slug,
    title,
    place: body.project.place ?? null,
    date: body.project.date ?? null,
    year: body.project.year ?? null,
    description: body.project.description ?? null,
    intro: Array.isArray(body.project.intro) ? (body.project.intro as ContentProject["intro"]) : null,
    media: media.sort((a, b) => a.sortOrder - b.sortOrder),
  };

  const idx = current.projects.findIndex((p) => p.id === project.id || p.slug === project.slug);
  if (idx >= 0) {
    current.projects[idx] = project;
  } else {
    current.projects.unshift(project);
  }
  current.generatedAt = new Date().toISOString();

  const json = JSON.stringify(current, null, 2);
  writeFileSync(CONTENT_PATH, json, "utf8");
  filesToCommit.push({
    path: "content/projects.json",
    contentBase64: Buffer.from(json, "utf8").toString("base64"),
  });

  const commit = await commitFilesToGitHub({
    message: `Update project: ${project.title}`,
    files: filesToCommit,
  });

  return NextResponse.json({
    ok: true,
    slug: project.slug,
    commitSha: commit.commitSha,
  });
}
