"use client";

import { useMemo, useState } from "react";

type EditorMedia = {
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

type UploadDraft = {
  tempId: string;
  filename: string;
  mimeType: string;
  dataBase64: string;
  width?: number;
  height?: number;
};

type Props = {
  project: {
    id: string;
    slug: string;
    title: string;
    place?: string | null;
    date?: string | null;
    year?: number | null;
    description?: string | null;
    media: EditorMedia[];
  };
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

export function ProjectEditor({ project }: Props) {
  const [title, setTitle] = useState(project.title);
  const [place, setPlace] = useState(project.place || "");
  const [date, setDate] = useState(project.date || "");
  const [description, setDescription] = useState(project.description || "");
  const [media, setMedia] = useState<EditorMedia[]>(project.media);
  const [uploads, setUploads] = useState<UploadDraft[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const sortedMedia = useMemo(
    () => [...media].sort((a, b) => a.sortOrder - b.sortOrder),
    [media],
  );

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const files = Array.from(fileList);
    const nextUploads: UploadDraft[] = [];
    const nextMedia: EditorMedia[] = [];
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

  async function saveChanges() {
    setStatus("Saving...");
    const year = date ? Number.parseInt(date.slice(0, 4), 10) : null;
    const res = await fetch("/api/edit/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: {
          id: project.id,
          slug: project.slug,
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
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !json.ok) {
      setStatus(json.error || "Save failed");
      return;
    }
    setStatus("Saved.");
    window.location.reload();
  }

  return (
    <section className="mb-8 rounded border border-neutral-300 bg-neutral-50 p-4 text-left">
      <p className="mb-3 text-xs uppercase tracking-[0.16em] text-neutral-500">Editing project</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
        rows={4}
        className="mt-3 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm"
      />
      <label className="mt-3 block rounded border border-dashed border-neutral-400 bg-white px-3 py-4 text-center text-sm text-neutral-500">
        Add images/video/audio
        <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.currentTarget.files)} />
      </label>

      <ul className="mt-2 space-y-1 text-xs text-neutral-600">
        {sortedMedia.map((m, i) => (
          <li key={m.id} className="flex items-center justify-between rounded bg-white px-2 py-1">
            <span>
              {i + 1}. {m.type} {m.src ? "(saved)" : "(new)"}
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

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={saveChanges}
          className="rounded bg-neutral-900 px-3 py-2 text-xs uppercase tracking-[0.14em] text-white"
        >
          Save changes
        </button>
        {status ? <p className="text-xs text-neutral-600">{status}</p> : null}
      </div>
    </section>
  );
}
