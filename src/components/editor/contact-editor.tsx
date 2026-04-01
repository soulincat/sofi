"use client";

import { useState } from "react";

import type { ContactFile } from "@/lib/site-content-schema";

export function ContactEditor({ initial }: { initial: ContactFile }) {
  const [heading, setHeading] = useState(initial.heading);
  const [body, setBody] = useState(initial.body);
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl);
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    setStatus("Saving...");
    const res = await fetch("/api/edit/save-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heading, body, instagramUrl }),
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
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-neutral-500">Editing contact</p>
      <label className="mb-3 block text-xs text-neutral-500">
        Page heading
        <input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="mb-3 block text-xs text-neutral-500">
        Body text (optional)
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="mb-4 block text-xs text-neutral-500">
        Instagram profile URL
        <input
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
          placeholder="https://www.instagram.com/username"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          className="rounded bg-neutral-900 px-3 py-2 text-xs uppercase tracking-[0.14em] text-white"
        >
          Save contact
        </button>
        {status ? <span className="text-xs text-neutral-600">{status}</span> : null}
      </div>
    </section>
  );
}
