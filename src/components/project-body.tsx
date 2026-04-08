import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import type { ReactNode } from "react";

import type {
  ContentAudioBlock,
  ContentGreyFieldBlock,
  ContentVideoBlock,
  ProjectContentBlock,
} from "@/types/project";

/** Narrow text column (body + captions). */
export const projectDetailTextColumnClass =
  "mx-auto w-full max-w-lg md:max-w-xl px-1 sm:px-0";

const projectTextWrap = projectDetailTextColumnClass;

/** Full-bleed frame so media can exceed text width and use most of the viewport. */
function ProjectMediaFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
      <div className="mx-auto w-full max-w-[min(96vw,90rem)] px-1 sm:px-2 md:px-8">
        {children}
      </div>
    </div>
  );
}

function findFirstImageKey(blocks: ProjectContentBlock[] | null): string | undefined {
  if (!blocks) return undefined;
  for (const b of blocks) {
    if (!b || typeof b !== "object" || !("_type" in b)) continue;
    if ((b as { _type: string })._type === "remoteImage") {
      return (b as { _key: string })._key;
    }
  }
  return undefined;
}

const textComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p
        className={`mb-0 text-[0.8125rem] leading-[1.75] tracking-[0.01em] text-neutral-500 ${projectTextWrap}`}
      >
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2
        className={`mb-0 mt-0 text-[0.65rem] font-normal uppercase tracking-[0.2em] text-neutral-400 first:mt-0 ${projectTextWrap}`}
      >
        {children}
      </h2>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={`border-0 text-[0.8125rem] leading-[1.75] text-neutral-500 ${projectTextWrap}`}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul
        className={`mb-0 list-disc space-y-1 pl-5 text-left text-[0.8125rem] leading-relaxed text-neutral-500 sm:pl-6 ${projectTextWrap}`}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol
        className={`mb-0 list-decimal space-y-1 pl-5 text-left text-[0.8125rem] leading-relaxed text-neutral-500 sm:pl-6 ${projectTextWrap}`}
      >
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
    <p
      className={`mb-0 text-[0.8125rem] leading-[1.75] tracking-[0.01em] text-neutral-500 ${projectTextWrap}`}
    >
      {children}
    </p>
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
    <ProjectMediaFrame>
      <figure className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote CDN / Sanity */}
        <img
          src={value.src}
          alt={value.alt ?? ""}
          width={value.width}
          height={value.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="mx-auto h-auto w-full max-w-full object-contain"
          draggable={false}
        />
        {value.caption ? (
          <figcaption
            className={`mt-4 text-center text-[0.75rem] leading-relaxed text-neutral-400 ${projectTextWrap}`}
          >
            {value.caption}
          </figcaption>
        ) : null}
      </figure>
    </ProjectMediaFrame>
  );
}

export function GreyField({ value }: { value: ContentGreyFieldBlock }) {
  const w = Math.max(1, value.ratioW);
  const h = Math.max(1, value.ratioH);
  const pct = value.widthPct ?? 100;

  return (
    <ProjectMediaFrame>
      <figure
        className="w-full"
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
            className={`mt-4 text-center text-[0.75rem] leading-relaxed text-neutral-400 ${projectTextWrap}`}
          >
            {value.caption}
          </figcaption>
        ) : null}
      </figure>
    </ProjectMediaFrame>
  );
}

function ContentVideo({ value }: { value: ContentVideoBlock }) {
  if (!value.src) return null;
  return (
    <ProjectMediaFrame>
      <figure className="w-full">
        <video
          className="mx-auto max-h-[min(72vh,720px)] w-full max-w-full rounded-[0.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
          controls
          playsInline
          preload="metadata"
          poster={value.poster}
        >
          <source src={value.src} type="video/mp4" />
        </video>
      </figure>
    </ProjectMediaFrame>
  );
}

function ContentAudio({ value }: { value: ContentAudioBlock }) {
  if (!value.src) return null;
  return (
    <figure className={projectTextWrap}>
      {value.title ? (
        <figcaption className="mb-3 text-center text-[0.65rem] uppercase tracking-[0.18em] text-neutral-400">
          {value.title}
        </figcaption>
      ) : null}
      <audio className="w-full" controls preload="metadata" src={value.src} />
    </figure>
  );
}

/** OCR / Sanity text runs that appear before the first image or non-text block. */
function splitInitialPortableBlocks(content: ProjectContentBlock[]): {
  initial: PortableTextBlock[];
  tail: ProjectContentBlock[];
} {
  const initial: PortableTextBlock[] = [];
  let i = 0;
  while (i < content.length) {
    const b = content[i];
    if (
      b &&
      typeof b === "object" &&
      "_type" in b &&
      (b as { _type: string })._type === "block"
    ) {
      initial.push(b as PortableTextBlock);
      i += 1;
    } else {
      break;
    }
  }
  return { initial, tail: content.slice(i) };
}

function renderContentTail(
  tail: ProjectContentBlock[],
  firstImageKey: string | undefined,
): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0;
  while (i < tail.length) {
    const b = tail[i];
    if (!b || typeof b !== "object" || !("_type" in b)) {
      i += 1;
      continue;
    }
    const t = (b as { _type: string })._type;

    if (t === "block") {
      const group: PortableTextBlock[] = [];
      while (
        i < tail.length &&
        tail[i] &&
        typeof tail[i] === "object" &&
        "_type" in tail[i]! &&
        (tail[i] as { _type: string })._type === "block"
      ) {
        group.push(tail[i] as PortableTextBlock);
        i += 1;
      }
      const gk = group[0]?._key ?? `pt-${i}`;
      out.push(<PortableText key={gk} value={group} components={textComponents} />);
      continue;
    }

    const key = "_key" in b && b._key ? String(b._key) : `node-${i}`;

    if (t === "remoteImage") {
      const v = b as Extract<ProjectContentBlock, { _type: "remoteImage" }>;
      out.push(
        <ContentRemoteImage
          key={key}
          value={v}
          priority={v._key === firstImageKey}
        />,
      );
    } else if (t === "greyField") {
      out.push(<GreyField key={key} value={b as ContentGreyFieldBlock} />);
    } else if (t === "embeddedVideo") {
      out.push(<ContentVideo key={key} value={b as ContentVideoBlock} />);
    } else if (t === "embeddedAudio") {
      out.push(<ContentAudio key={key} value={b as ContentAudioBlock} />);
    }

    i += 1;
  }
  return out;
}

export function ProjectBody({ content }: { content: ProjectContentBlock[] | null }) {
  if (!content?.length) return null;

  const firstImageKey = findFirstImageKey(content);
  const { initial, tail } = splitInitialPortableBlocks(content);

  return (
    <div className="flex flex-col items-center gap-16 md:gap-[5.5rem]">
      {initial.length > 0 ? (
        <section aria-label="Statement" className="w-full text-center">
          <PortableText value={initial} components={textComponents} />
        </section>
      ) : null}
      {renderContentTail(tail, firstImageKey)}
    </div>
  );
}
