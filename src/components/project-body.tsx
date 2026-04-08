import type { PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type {
  ContentAudioBlock,
  ContentGreyFieldBlock,
  ContentVideoBlock,
  ProjectContentBlock,
} from "@/types/project";

/** Same width for header spec line and body copy (no extra px — avoids mismatch with paragraphs). */
export const projectDetailTextColumnClass =
  "mx-auto box-border w-full min-w-0 max-w-2xl text-left md:max-w-3xl";

const projectTextWrap = projectDetailTextColumnClass;

/** Inner text blocks fill the text column wrapper (same width as header spec line). */
const textBlockClass =
  "w-full min-w-0 max-w-full break-words text-[0.75rem] leading-[1.75] tracking-[0.01em] text-neutral-500";

/** Wider than text; capped below screen width (no viewport bleed). */
const projectMediaWrap = "mx-auto w-full min-w-0 max-w-3xl md:max-w-4xl";

function isPortableTextBlock(b: ProjectContentBlock): b is PortableTextBlock {
  return (
    !!b &&
    typeof b === "object" &&
    "_type" in b &&
    (b as { _type: string })._type === "block"
  );
}

function isMediaBlock(b: ProjectContentBlock): boolean {
  const t = (b as { _type?: string })._type;
  return (
    t === "remoteImage" ||
    t === "embeddedVideo" ||
    t === "embeddedAudio" ||
    t === "greyField"
  );
}

/** Split portable blocks vs media (file-backed order is […intro, …media]). */
export function partitionContent(content: ProjectContentBlock[]): {
  blocks: PortableTextBlock[];
  media: ProjectContentBlock[];
} {
  const blocks: PortableTextBlock[] = [];
  const media: ProjectContentBlock[] = [];
  for (const item of content) {
    if (isPortableTextBlock(item)) blocks.push(item);
    else if (isMediaBlock(item)) media.push(item);
  }
  return { blocks, media };
}

export function mediaItemKey(item: ProjectContentBlock, idx: number): string {
  if (item && typeof item === "object" && "_key" in item && (item as { _key?: string })._key) {
    return String((item as { _key: string })._key);
  }
  return `media-${idx}`;
}

/** Portable Text renderers for project detail (work page + gallery). */
export const projectDetailTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className={`mb-0 ${textBlockClass}`}>{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-0 mt-0 text-left text-[0.65rem] font-normal uppercase tracking-[0.2em] text-neutral-400 first:mt-0">
        {children}
      </h2>
    ),
    blockquote: ({ children }) => (
      <blockquote className={`border-0 ${textBlockClass}`}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-0 w-full min-w-0 max-w-full list-disc space-y-1 break-words pl-5 text-left text-[0.75rem] leading-relaxed text-neutral-500 sm:pl-6">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-0 w-full min-w-0 max-w-full list-decimal space-y-1 break-words pl-5 text-left text-[0.75rem] leading-relaxed text-neutral-500 sm:pl-6">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = value?.href;
      if (!href) return <>{children}</>;
      const external = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          className="underline decoration-neutral-300/80 underline-offset-[3px] transition-colors hover:decoration-neutral-600"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-medium text-neutral-700">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
  unknownBlockStyle: ({ children }) => (
    <p className={`mb-0 ${textBlockClass}`}>{children}</p>
  ),
};

export function ContentRemoteImage({
  value,
  priority,
}: {
  value: {
    src: string;
    width: number;
    height: number;
    alt?: string;
    caption?: string;
    _key?: string;
  };
  priority?: boolean;
}) {
  if (!value.src || !value.width || !value.height) return null;

  return (
    <figure className={projectMediaWrap}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN / Sanity */}
      <img
        src={value.src}
        alt={value.alt ?? ""}
        width={value.width}
        height={value.height}
        sizes="(max-width: 768px) 100vw, 48rem"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="mx-auto block h-auto max-h-[min(85vh,920px)] w-full max-w-full object-contain"
        draggable={false}
      />
      {value.caption ? (
        <figcaption
          className={`mt-4 text-left text-[0.7rem] leading-relaxed text-neutral-400 ${projectTextWrap}`}
        >
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function GreyField({ value }: { value: ContentGreyFieldBlock }) {
  const w = Math.max(1, value.ratioW);
  const h = Math.max(1, value.ratioH);
  const pct = value.widthPct ?? 100;

  return (
    <figure
      className={projectMediaWrap}
      style={pct < 100 ? { width: `${pct}%`, marginLeft: "auto", marginRight: "auto" } : undefined}
    >
      <div
        className="mx-auto w-full max-w-full rounded-[0.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
        style={{
          aspectRatio: `${w} / ${h}`,
          background: `linear-gradient(142deg, ${value.from} 0%, ${value.to} 100%)`,
        }}
        aria-hidden
      />
      {value.caption ? (
        <figcaption
          className={`mt-4 text-left text-[0.7rem] leading-relaxed text-neutral-400 ${projectTextWrap}`}
        >
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ContentVideo({ value }: { value: ContentVideoBlock }) {
  if (!value.src) return null;
  return (
    <figure className={projectMediaWrap}>
      <video
        className="mx-auto max-h-[min(72vh,720px)] w-full max-w-full rounded-[0.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] object-contain"
        controls
        playsInline
        preload="metadata"
        poster={value.poster}
      >
        <source src={value.src} type="video/mp4" />
      </video>
    </figure>
  );
}

function ContentAudio({ value }: { value: ContentAudioBlock }) {
  if (!value.src) return null;
  return (
    <figure className={projectTextWrap}>
      {value.title ? (
        <figcaption className="mb-3 text-left text-[0.65rem] uppercase tracking-[0.18em] text-neutral-400">
          {value.title}
        </figcaption>
      ) : null}
      <audio className="w-full" controls preload="metadata" src={value.src} />
    </figure>
  );
}

export function MediaBlock({
  item,
  imagePriority,
}: {
  item: ProjectContentBlock;
  imagePriority: boolean;
}) {
  const t = (item as { _type: string })._type;

  if (t === "remoteImage") {
    return (
      <ContentRemoteImage
        value={item as Extract<ProjectContentBlock, { _type: "remoteImage" }>}
        priority={imagePriority}
      />
    );
  }
  if (t === "greyField") {
    return <GreyField value={item as ContentGreyFieldBlock} />;
  }
  if (t === "embeddedVideo") {
    return <ContentVideo value={item as ContentVideoBlock} />;
  }
  if (t === "embeddedAudio") {
    return <ContentAudio value={item as ContentAudioBlock} />;
  }
  return null;
}

