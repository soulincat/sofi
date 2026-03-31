import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import type { ContentGreyFieldBlock, ProjectContentBlock } from "@/types/project";

function findFirstImageKey(blocks: ProjectContentBlock[] | null): string | undefined {
  if (!blocks) return undefined;
  for (const b of blocks) {
    if (!b || typeof b !== "object" || !("_type" in b) || !("_key" in b)) continue;
    if ((b as { _type: string })._type === "remoteImage") {
      return (b as { _key: string })._key;
    }
  }
  return undefined;
}

const textComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 max-w-2xl text-[0.9375rem] leading-[1.65] text-neutral-800">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-14 text-lg font-normal tracking-tight text-neutral-900 first:mt-0">
        {children}
      </h2>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 border-l border-neutral-300 pl-5 text-neutral-600 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-5 max-w-2xl list-disc space-y-1 pl-6 text-[0.9375rem] leading-relaxed text-neutral-800">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-5 max-w-2xl list-decimal space-y-1 pl-6 text-[0.9375rem] leading-relaxed text-neutral-800">
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
          className="underline decoration-neutral-300 underline-offset-[3px] hover:decoration-neutral-900"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-medium">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
};

export function ContentRemoteImage({
  value,
  priority,
}: {
  value: { src: string; width: number; height: number; alt?: string; _key?: string };
  priority?: boolean;
}) {
  if (!value.src || !value.width || !value.height) return null;

  return (
    <figure className="my-14 w-full first:mt-0 md:my-20">
      {/* eslint-disable-next-line @next/next/no-img-element -- Tumblr CDN */}
      <img
        src={value.src}
        alt={value.alt ?? ""}
        width={value.width}
        height={value.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className="h-auto w-full max-w-full"
        draggable={false}
      />
    </figure>
  );
}

export function GreyField({
  value,
}: {
  value: {
    ratioW: number;
    ratioH: number;
    from: string;
    to: string;
    caption?: string;
  };
}) {
  const w = Math.max(1, value.ratioW);
  const h = Math.max(1, value.ratioH);

  return (
    <figure className="my-14 w-full first:mt-0 md:my-20">
      <div
        className="w-full max-w-full rounded-[0.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"
        style={{
          aspectRatio: `${w} / ${h}`,
          background: `linear-gradient(142deg, ${value.from} 0%, ${value.to} 100%)`,
        }}
        aria-hidden
      />
      {value.caption ? (
        <figcaption className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-500">
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function ProjectBody({ content }: { content: ProjectContentBlock[] | null }) {
  if (!content?.length) return null;

  const firstImageKey = findFirstImageKey(content);

  return (
    <div className="project-body">
      {content.map((b, i) => {
        if (!b || typeof b !== "object" || !("_type" in b)) return null;
        const t = b._type;
        const key = "_key" in b && b._key ? String(b._key) : `node-${i}`;

        if (t === "block") {
          return (
            <PortableText
              key={key}
              value={[b as PortableTextBlock]}
              components={textComponents}
            />
          );
        }

        if (t === "remoteImage") {
          const v = b as Extract<ProjectContentBlock, { _type: "remoteImage" }>;
          return (
            <ContentRemoteImage
              key={key}
              value={v}
              priority={v._key === firstImageKey}
            />
          );
        }

        if (t === "greyField") {
          return <GreyField key={key} value={b as ContentGreyFieldBlock} />;
        }

        return null;
      })}
    </div>
  );
}
