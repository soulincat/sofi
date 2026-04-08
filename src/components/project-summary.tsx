import { Fragment } from "react";

/** Line break after each comma (e.g. place / one-line specs). */
export function CommaLineBreaks({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const parts = text.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className={className}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {part}
        </Fragment>
      ))}
    </p>
  );
}

/** First paragraph: line break after each comma (spec line). Later paragraphs: preserve newlines. */
export function ProjectSummary({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/);
  const firstRaw = (blocks[0] ?? "").trim();
  const rest = blocks.slice(1).map((b) => b.trim()).filter(Boolean);

  const specParts = firstRaw
    ? firstRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="mt-10 space-y-6 text-[0.8125rem] leading-[1.75] text-neutral-500">
      {specParts.length > 0 ? (
        <p className="font-normal">
          {specParts.map((part, i) => (
            <Fragment key={i}>
              {i > 0 ? <br /> : null}
              {part}
            </Fragment>
          ))}
        </p>
      ) : null}
      {rest.map((block, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {block}
        </p>
      ))}
    </div>
  );
}
