export type CvEntryJson = { period?: string; lines: string[] };

export type CvSectionJson = {
  id: string;
  title: string;
  entries: CvEntryJson[];
};

export type CvFile = {
  version: 1;
  intro: string;
  sections: CvSectionJson[];
};

export type ContactFile = {
  version: 1;
  heading: string;
  body: string;
  instagramUrl: string;
};

export function normalizeCvFile(raw: unknown): CvFile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<CvFile>;
  if (o.version !== 1) return null;
  const sections = Array.isArray(o.sections) ? o.sections : [];
  const normalized: CvSectionJson[] = sections
    .map((s): CvSectionJson | null => {
      if (!s || typeof s !== "object") return null;
      const id = String((s as CvSectionJson).id || "").trim();
      const title = String((s as CvSectionJson).title || "").trim();
      if (!id || !title) return null;
      const entries = Array.isArray((s as CvSectionJson).entries)
        ? (s as CvSectionJson).entries
        : [];
      return {
        id,
        title,
        entries: entries
          .map((e): CvEntryJson | null => {
            if (!e || typeof e !== "object") return null;
            const lines = Array.isArray((e as CvEntryJson).lines)
              ? (e as CvEntryJson).lines.map((l) => String(l))
              : [];
            return {
              period:
                (e as CvEntryJson).period != null
                  ? String((e as CvEntryJson).period)
                  : undefined,
              lines,
            };
          })
          .filter((e): e is CvEntryJson => Boolean(e)),
      };
    })
    .filter((s): s is CvSectionJson => Boolean(s));

  return {
    version: 1,
    intro: typeof o.intro === "string" ? o.intro : "",
    sections: normalized,
  };
}

export function normalizeContactFile(raw: unknown): ContactFile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<ContactFile>;
  if (o.version !== 1) return null;
  const instagramUrl = String(o.instagramUrl || "").trim();
  if (!instagramUrl) return null;
  return {
    version: 1,
    heading: typeof o.heading === "string" && o.heading.trim() ? o.heading.trim() : "Contact",
    body: typeof o.body === "string" ? o.body : "",
    instagramUrl,
  };
}
