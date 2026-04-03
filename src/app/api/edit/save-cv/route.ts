import { writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

import { hasEditSession } from "@/lib/edit-auth";
import { commitFilesToGitHubOrError } from "@/lib/github-content";
import { normalizeCvFile, type CvFile } from "@/lib/site-content-schema";

const CV_PATH = path.join(process.cwd(), "content", "cv.json");

type Body = {
  intro?: string;
  sections?: CvFile["sections"];
};

export async function POST(req: Request) {
  if (!(await hasEditSession())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || !Array.isArray(body.sections)) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const next: CvFile = {
    version: 1,
    intro: typeof body.intro === "string" ? body.intro : "",
    sections: body.sections,
  };

  const normalized = normalizeCvFile(next);
  if (!normalized) {
    return NextResponse.json({ ok: false, error: "Invalid CV shape" }, { status: 400 });
  }

  const json = JSON.stringify(normalized, null, 2);
  try {
    writeFileSync(CV_PATH, json, "utf8");
  } catch {
    /* Vercel/serverless: read-only FS; GitHub commit persists. */
  }

  const commit = await commitFilesToGitHubOrError({
    message: "Update CV (content/cv.json)",
    files: [
      {
        path: "content/cv.json",
        contentBase64: Buffer.from(json, "utf8").toString("base64"),
      },
    ],
  });

  if (!commit.ok) {
    return NextResponse.json({ ok: false, error: commit.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, commitSha: commit.commitSha });
}
