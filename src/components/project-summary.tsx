/** Split spec / metadata: prefer explicit newlines in source; else comma-separated. */
function splitSpecSegments(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  if (/\n/.test(t)) {
    return t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  return t.split(",").map((s) => s.trim()).filter(Boolean);
}

/** One line per segment; each segment stays on a single line (no mid-line wrap). */
export function CommaLineBreaks({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = splitSpecSegments(text);
  if (parts.length === 0) return null;
  return (
    <div
      className={`flex max-w-full flex-col items-center gap-0.5 overflow-x-auto ${className ?? ""}`}
    >
      {parts.map((part, i) => (
        <span key={i} className="block whitespace-nowrap text-center">
          {part}
        </span>
      ))}
    </div>
  );
}

/** First block: one row per spec line (newline or comma). Body: paragraphs with pre-wrap. */
export function ProjectSummary({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  const firstRaw = (blocks[0] ?? "").trim();
  const rest = blocks.slice(1).map((b) => b.trim()).filter(Boolean);

  const specParts = splitSpecSegments(firstRaw);

  return (
    <div className="mt-10 space-y-6 text-[0.8125rem] leading-relaxed text-neutral-500">
      {specParts.length > 0 ? (
        <div className="flex max-w-full flex-col items-center gap-0.5 overflow-x-auto font-normal">
          {specParts.map((part, i) => (
            <span key={i} className="block whitespace-nowrap text-center">
              {part}
            </span>
          ))}
        </div>
      ) : null}
      {rest.map((block, i) => (
        <p key={i} className="whitespace-pre-wrap text-center">
          {block}
        </p>
      ))}
    </div>
  );
}
