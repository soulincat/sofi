import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { normalizeContactFile, type ContactFile } from "@/lib/site-content-schema";
import { instagramUrl as envInstagramUrl } from "@/lib/site";

const CONTACT_PATH = path.join(process.cwd(), "content", "contact.json");

export function getContactContent(): ContactFile {
  if (existsSync(CONTACT_PATH)) {
    try {
      const raw = JSON.parse(readFileSync(CONTACT_PATH, "utf8"));
      const parsed = normalizeContactFile(raw);
      if (parsed) return parsed;
    } catch {
      /* fall through */
    }
  }
  return {
    version: 1,
    heading: "Contact",
    body: "",
    instagramUrl: envInstagramUrl,
    substackUrl: "https://substack.com/@corroborovix955642",
  };
}
