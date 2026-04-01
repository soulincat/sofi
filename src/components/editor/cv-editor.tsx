"use client";

import { useState } from "react";

import type { CvFile, CvSectionJson } from "@/lib/site-content-schema";

function cloneCv(data: CvFile): { intro: string; sections: CvSectionJson[] } {
  return {
    intro: data.intro,
    sections: JSON.parse(JSON.stringify(data.sections)) as CvSectionJson[],
  };
}

export function CvEditor({ initial }: { initial: CvFile }) {
  const seeded = cloneCv(initial);
  const [intro, setIntro] = useState(seeded.intro);
  const [sections, setSections] = useState<CvSectionJson[]>(seeded.sections);
  const [status, setStatus] = useState<string | null>(null);

  function addSection() {
    const id = `section-${Date.now()}`;
    setSections((s) => [...s, { id, title: "New section", entries: [] }]);
  }

  function removeSection(i: number) {
    setSections((s) => s.filter((_, j) => j !== i));
  }

  function updateSectionTitle(i: number, title: string) {
    setSections((s) => s.map((sec, j) => (j === i ? { ...sec, title } : sec)));
  }

  function updateSectionId(i: number, id: string) {
    setSections((s) => s.map((sec, j) => (j === i ? { ...sec, id } : sec)));
  }

  function addEntry(si: number) {
    setSections((s) =>
      s.map((sec, j) =>
        j === si ? { ...sec, entries: [...sec.entries, { period: "", lines: [""] }] } : sec,
      ),
    );
  }

  function removeEntry(si: number, ei: number) {
    setSections((s) =>
      s.map((sec, j) =>
        j === si ? { ...sec, entries: sec.entries.filter((_, k) => k !== ei) } : sec,
      ),
    );
  }

  function updateEntryPeriod(si: number, ei: number, period: string) {
    setSections((s) =>
      s.map((sec, j) =>
        j === si
          ? {
              ...sec,
              entries: sec.entries.map((en, k) =>
                k === ei ? { ...en, period: period || undefined } : en,
              ),
            }
          : sec,
      ),
    );
  }

  function updateEntryLines(si: number, ei: number, text: string) {
    const lines = text.split("\n").map((l) => l.trimEnd());
    setSections((s) =>
      s.map((sec, j) =>
        j === si
          ? {
              ...sec,
              entries: sec.entries.map((en, k) => (k === ei ? { ...en, lines } : en)),
            }
          : sec,
      ),
    );
  }

  function moveSection(from: number, to: number) {
    if (to < 0 || to >= sections.length) return;
    setSections((s) => {
      const next = [...s];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x!);
      return next;
    });
  }

  async function save() {
    setStatus("Saving...");
    const res = await fetch("/api/edit/save-cv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intro, sections }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setStatus(json.error || "Save failed");
      return;
    }
    setStatus("Saved.");
    window.location.reload();
  }

  return (
    <section className="mb-10 rounded border border-neutral-300 bg-neutral-50 p-4 text-left">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-neutral-500">Editing CV</p>
      <label className="mb-4 block text-xs text-neutral-500">
        Intro (optional)
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800"
        />
      </label>

      <div className="space-y-6">
        {sections.map((sec, si) => (
          <div key={sec.id + si} className="rounded border border-neutral-200 bg-white p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <input
                value={sec.id}
                onChange={(e) => updateSectionId(si, e.target.value)}
                placeholder="id"
                className="w-28 rounded border border-neutral-300 px-2 py-1 text-xs"
              />
              <input
                value={sec.title}
                onChange={(e) => updateSectionTitle(si, e.target.value)}
                placeholder="Section title"
                className="min-w-[10rem] flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
              />
              <button
                type="button"
                className="text-xs text-neutral-500"
                onClick={() => moveSection(si, si - 1)}
                disabled={si === 0}
              >
                ↑
              </button>
              <button
                type="button"
                className="text-xs text-neutral-500"
                onClick={() => moveSection(si, si + 1)}
                disabled={si === sections.length - 1}
              >
                ↓
              </button>
              <button type="button" className="text-xs text-red-600" onClick={() => removeSection(si)}>
                Remove section
              </button>
            </div>
            <div className="space-y-3 pl-2">
              {sec.entries.map((en, ei) => (
                <div key={ei} className="rounded bg-neutral-50 p-2">
                  <input
                    value={en.period ?? ""}
                    onChange={(e) => updateEntryPeriod(si, ei, e.target.value)}
                    placeholder="Period (e.g. 2024)"
                    className="mb-2 w-full rounded border border-neutral-300 px-2 py-1 text-xs"
                  />
                  <textarea
                    value={en.lines.join("\n")}
                    onChange={(e) => updateEntryLines(si, ei, e.target.value)}
                    placeholder="Lines (one per line)"
                    rows={3}
                    className="w-full rounded border border-neutral-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    className="mt-1 text-xs text-red-600"
                    onClick={() => removeEntry(si, ei)}
                  >
                    Remove entry
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-xs text-neutral-600 underline"
                onClick={() => addEntry(si)}
              >
                + Add entry
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addSection}
          className="rounded border border-neutral-400 px-3 py-2 text-xs uppercase tracking-[0.12em]"
        >
          Add section
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded bg-neutral-900 px-3 py-2 text-xs uppercase tracking-[0.14em] text-white"
        >
          Save CV
        </button>
        {status ? <span className="text-xs text-neutral-600">{status}</span> : null}
      </div>
    </section>
  );
}
