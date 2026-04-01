import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { normalizeCvFile, type CvFile, type CvSectionJson } from "@/lib/site-content-schema";
import { CV_INTRO, CV_SECTIONS, type CvSection } from "@/data/cv";

const CV_PATH = path.join(process.cwd(), "content", "cv.json");

function fileCv(): CvFile | null {
  if (!existsSync(CV_PATH)) return null;
  try {
    const raw = JSON.parse(readFileSync(CV_PATH, "utf8"));
    return normalizeCvFile(raw);
  } catch {
    return null;
  }
}

function sectionsFromTs(): CvSectionJson[] {
  return CV_SECTIONS.map((s: CvSection) => ({
    id: s.id,
    title: s.title,
    entries: s.entries.map((e) => ({
      period: e.period,
      lines: [...e.lines],
    })),
  }));
}

export function getCvContent(): CvFile {
  const fromFile = fileCv();
  if (fromFile) {
    return fromFile;
  }
  return {
    version: 1,
    intro: CV_INTRO,
    sections: sectionsFromTs(),
  };
}
