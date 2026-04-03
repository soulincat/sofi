import { writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

import { hasEditSession } from "@/lib/edit-auth";
import { commitFilesToGitHubOrError } from "@/lib/github-content";
import { normalizeContactFile, type ContactFile } from "@/lib/site-content-schema";

const CONTACT_PATH = path.join(process.cwd(), "content", "contact.json");

type Body = Pick<ContactFile, "heading" | "body" | "instagramUrl" | "substackUrl">;

export async function POST(req: Request) {
  if (!(await hasEditSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body.instagramUrl !== "string" || !body.instagramUrl.trim()) {
    return NextResponse.json({ ok: false, error: "Instagram URL required" }, { status: 400 });
  }

  const next: ContactFile = {
    version: 1,
    heading: typeof body.heading === "string" && body.heading.trim() ? body.heading.trim() : "Contact",
    body: typeof body.body === "string" ? body.body : "",
    instagramUrl: body.instagramUrl.trim(),
    substackUrl: typeof body.substackUrl === "string" ? body.substackUrl.trim() : "",
  };

  const normalized = normalizeContactFile(next);
  if (!normalized) {
    return NextResponse.json({ ok: false, error: "Invalid contact shape" }, { status: 400 });
  }

  const json = JSON.stringify(normalized, null, 2);
  try {
    writeFileSync(CONTACT_PATH, json, "utf8");
  } catch {
    /* Vercel/serverless: read-only FS; GitHub commit persists. */
  }

  const commit = await commitFilesToGitHubOrError({
    message: "Update contact (content/contact.json)",
    files: [
      {
        path: "content/contact.json",
        contentBase64: Buffer.from(json, "utf8").toString("base64"),
      },
    ],
  });

  if (!commit.ok) {
    return NextResponse.json({ ok: false, error: commit.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, commitSha: commit.commitSha });
}
