/** Split spec / metadata: newlines or commas → segments (display joins into one line). */
function splitSpecSegments(raw: string): string[] {
  const t = raw.trim();
  if (!t) return [];
  if (/\n/.test(t)) {
    return t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  return t.split(",").map((s) => s.trim()).filter(Boolean);
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
  return <p className={className}>{parts.join(", ")}</p>;
}

/** First block: one line of spec (joined). Body: pre-wrap paragraphs, left-aligned. */
export function ProjectSummary({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  const firstRaw = (blocks[0] ?? "").trim();
  const rest = blocks.slice(1).map((b) => b.trim()).filter(Boolean);

  const specParts = splitSpecSegments(firstRaw);
  const specOneLine = specParts.join(", ");

  return (
    <div className="mt-10 w-full space-y-6 text-[0.75rem] leading-relaxed text-neutral-500">
      {specOneLine ? (
        <p className="w-full text-left font-normal">{specOneLine}</p>
      ) : null}
      {rest.map((block, i) => (
        <p key={i} className="w-full whitespace-pre-wrap text-left">
          {block}
        </p>
      ))}
    </div>
  );
}
