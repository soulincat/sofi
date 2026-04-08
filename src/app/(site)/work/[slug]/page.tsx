import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";

import { EditLogin } from "@/components/editor/edit-login";
import {
  MediaBlock,
  mediaItemKey,
  partitionContent,
  projectDetailTextColumnClass,
  projectDetailTextComponents,
} from "@/components/project-body";
import { ProjectEditor } from "@/components/editor/project-editor";
import { CommaLineBreaks, splitSummarySpecAndRest } from "@/components/project-summary";
import { getProjectBySlug, getProjectSlugsForStatic } from "@/data/projects";
import { hasEditSession } from "@/lib/edit-auth";
import { siteDescription, siteTitle } from "@/lib/site";
import type { ProjectContentBlock } from "@/types/project";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ edit?: string }> };

/** Allow slugs that appear after build (Tumblr / new Sanity posts) without 404. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getProjectSlugsForStatic();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return { title: siteTitle };
  }
  return {
    title: `${project.title} — ${siteTitle}`,
    description: project.summary ?? siteDescription,
  };
}

export default async function WorkPage(props: Props) {
  const { slug } = await props.params;
  const qs = await props.searchParams;
  const editRequested = qs.edit === "1";
  const editorEnabled = editRequested && (await hasEditSession());
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const content = project.content as ProjectContentBlock[] | null;

  const { specLine, restParagraphs } =
    project.summary?.trim() ? splitSummarySpecAndRest(project.summary) : { specLine: null, restParagraphs: [] };
  const { blocks, media } = partitionContent(content ?? []);
  const firstMedia = media[0];
  const restMedia = media.slice(1);
  const firstIsRemote =
    firstMedia && (firstMedia as { _type: string })._type === "remoteImage";
  const hasTextAfterHero = restParagraphs.length > 0 || blocks.length > 0;
  const hasMoreGallery = restMedia.length > 0;

  const editorMedia = (content ?? [])
    .filter(
      (b): b is Extract<ProjectContentBlock, { _type: "remoteImage" | "embeddedVideo" | "embeddedAudio" }> =>
        Boolean(
          b &&
            typeof b === "object" &&
            "_type" in b &&
            (b._type === "remoteImage" || b._type === "embeddedVideo" || b._type === "embeddedAudio"),
        ),
    )
    .map((b, i) => {
      if (b._type === "remoteImage") {
        return {
          id: b._key,
          type: "image" as const,
          src: b.src,
          width: b.width,
          height: b.height,
          alt: b.alt ?? null,
          caption: b.caption ?? null,
          sortOrder: i,
        };
      }
      if (b._type === "embeddedVideo") {
        return {
          id: b._key,
          type: "video" as const,
          src: b.src,
          sortOrder: i,
        };
      }
      return {
        id: b._key,
        type: "audio" as const,
        src: b.src,
        title: b.title ?? null,
        sortOrder: i,
      };
    });

  return (
    <article className="w-full max-w-none text-left">
      {editRequested && !editorEnabled ? <EditLogin /> : null}
      {editorEnabled ? (
        <ProjectEditor
          project={{
            id: project._id.replace(/^file-/, ""),
            slug: project.slug,
            title: project.title,
            place: project.place ?? null,
            date: project.date ?? null,
            year: project.year ?? null,
            description: project.summary ?? null,
            media: editorMedia,
          }}
        />
      ) : null}
      <header className="mb-16 md:mb-24">
        <div className={projectDetailTextColumnClass}>
          <h1 className="text-left text-lg font-normal leading-snug tracking-[0.04em] text-neutral-900 md:text-xl md:tracking-[0.05em] lg:text-2xl lg:tracking-[0.06em]">
            {project.title}
          </h1>
          {project.place ? (
            <CommaLineBreaks
              text={project.place}
              className="mt-4 text-left text-[0.62rem] uppercase tracking-[0.18em] text-neutral-400"
            />
          ) : null}
          {project.year != null ? (
            <p className="mt-5 text-left text-[0.65rem] tabular-nums tracking-[0.22em] text-neutral-400">
              {project.year}
            </p>
          ) : null}
          {specLine ? (
            <p className="mt-10 w-full min-w-0 max-w-full break-words text-left text-[0.75rem] leading-relaxed text-neutral-500">
              {specLine}
            </p>
          ) : null}
        </div>
      </header>

      {firstMedia ? (
        <div
          className={hasTextAfterHero || hasMoreGallery ? "mb-16 md:mb-24" : undefined}
        >
          <MediaBlock
            key={mediaItemKey(firstMedia, 0)}
            item={firstMedia}
            imagePriority={Boolean(firstIsRemote)}
          />
        </div>
      ) : null}

      {hasTextAfterHero ? (
        <div
          className={`${projectDetailTextColumnClass} mb-16 space-y-6 text-[0.75rem] leading-relaxed text-neutral-500 md:mb-24`}
          aria-label="Project description"
        >
          {restParagraphs.map((block, i) => (
            <p
              key={i}
              className="w-full min-w-0 max-w-full whitespace-pre-wrap break-words text-left"
            >
              {block}
            </p>
          ))}
          {blocks.length > 0 ? (
            <PortableText value={blocks} components={projectDetailTextComponents} />
          ) : null}
        </div>
      ) : null}

      {hasMoreGallery ? (
        <div className="flex w-full flex-col gap-16 md:gap-[5.5rem]" aria-label="Project gallery">
          {restMedia.map((item, idx) => (
            <MediaBlock
              key={mediaItemKey(item, idx + 1)}
              item={item}
              imagePriority={false}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
