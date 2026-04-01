"use client";

import { useMemo, useState } from "react";

type UploadDraft = {
  tempId: string;
  filename: string;
  mimeType: string;
  dataBase64: string;
  width?: number;
  height?: number;
};

type MediaDraft = {
  id: string;
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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {};
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve({});
    img.src = URL.createObjectURL(file);
  });
}

function mediaTypeFromFile(file: File): "image" | "video" | "audio" {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "image";
}

export function HomeEditor({ enabled }: { enabled: boolean }) {
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [uploads, setUploads] = useState<UploadDraft[]>([]);
  const [media, setMedia] = useState<MediaDraft[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const canSave = enabled && title.trim() && media.length > 0;

  const sortedMedia = useMemo(
    () => [...media].sort((a, b) => a.sortOrder - b.sortOrder),
    [media],
  );

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    const nextUploads: UploadDraft[] = [];
    const nextMedia: MediaDraft[] = [];
    for (const [i, file] of files.entries()) {
      const tempId = `tmp-${Date.now()}-${i}`;
      const [dataBase64, dim] = await Promise.all([fileToBase64(file), imageSize(file)]);
      nextUploads.push({
        tempId,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        dataBase64,
        width: dim.width,
        height: dim.height,
      });
      nextMedia.push({
        id: tempId,
        type: mediaTypeFromFile(file),
        uploadTempId: tempId,
        width: dim.width,
        height: dim.height,
        sortOrder: media.length + i,
      });
    }
    setUploads((v) => [...v, ...nextUploads]);
    setMedia((v) => [...v, ...nextMedia]);
  }

  async function saveProject() {
    if (!canSave) return;
    setStatus("Saving...");
    const year = date ? Number.parseInt(date.slice(0, 4), 10) : null;
    const res = await fetch("/api/edit/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: {
          title,
          place: place || null,
          date: date || null,
          year: Number.isFinite(year) ? year : null,
          description: description || null,
          media: sortedMedia.map((m, i) => ({ ...m, sortOrder: i })),
        },
        uploads,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; slug?: string; error?: string };
    if (!res.ok || !json.ok || !json.slug) {
      setStatus(json.error || "Save failed");
      return;
    }
    setStatus("Saved. Opening project editor...");
    window.location.href = `/work/${json.slug}?edit=1`;
  }

  if (!enabled) return null;

  return (
    <section className="mx-auto mb-10 max-w-2xl rounded border border-neutral-300 bg-neutral-50 p-4 text-left">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-neutral-500">
        Editing state: create project
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <input
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="Place"
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={4}
        className="mt-3 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
      />

      <label className="mt-3 block rounded border border-dashed border-neutral-400 bg-white px-3 py-6 text-center text-sm text-neutral-500">
        Drop images/video/audio here or click
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.currentTarget.files)}
        />
      </label>
      <p className="mt-2 text-xs text-neutral-500">{media.length} media items queued</p>

      {sortedMedia.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-neutral-600">
          {sortedMedia.map((m, i) => (
            <li key={m.id} className="flex items-center justify-between rounded bg-white px-2 py-1">
              <span>
                {i + 1}. {m.type}
              </span>
              <button
                type="button"
                className="text-red-600"
                onClick={() => setMedia((v) => v.filter((x) => x.id !== m.id))}
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={saveProject}
          disabled={!canSave}
          className="rounded bg-neutral-900 px-3 py-2 text-xs uppercase tracking-[0.14em] text-white disabled:opacity-50"
        >
          Save new project
        </button>
        {status ? <p className="text-xs text-neutral-600">{status}</p> : null}
      </div>
    </section>
  );
}
