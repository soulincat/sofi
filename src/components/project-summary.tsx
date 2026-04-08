/** Split spec / metadata: newlines or commas → segments (display joins into one line). */
function splitSpecSegments(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  if (/\n/.test(t)) {
    return t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  return t.split(",").map((s) => s.trim()).filter(Boolean);
}

/** First paragraph → spec line; later paragraphs → body copy. */
export function splitSummarySpecAndRest(text: string): {
  specLine: string | null;
  restParagraphs: string[];
} {
  const blocks = text.split(/\n\n+/);
  const firstRaw = (blocks[0] ?? "").trim();
  const rest = blocks.slice(1).map((b) => b.trim()).filter(Boolean);
  const specParts = splitSpecSegments(firstRaw);
  const specLine = specParts.length ? specParts.join(", ") : null;
  return { specLine, restParagraphs: rest };
}

/** All segments in a single flowing line (comma-separated). */
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
    <p className={`min-w-0 max-w-full break-words ${className ?? ""}`}>{parts.join(", ")}</p>
  );
}

/** Full description in one column (e.g. editor preview). Prefer splitSummarySpecAndRest + layout on work page. */
export function ProjectSummary({ text }: { text: string }) {
  const { specLine, restParagraphs } = splitSummarySpecAndRest(text);

  return (
    <div className="mt-10 w-full min-w-0 max-w-full space-y-6 text-[0.75rem] leading-relaxed text-neutral-500">
      {specLine ? (
        <p className="w-full min-w-0 max-w-full break-words text-left font-normal">{specLine}</p>
      ) : null}
      {restParagraphs.map((block, i) => (
        <p
          key={i}
          className="w-full min-w-0 max-w-full whitespace-pre-wrap break-words text-left"
        >
          {block}
        </p>
      ))}
    </div>
  );
}
