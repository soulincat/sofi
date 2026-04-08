import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditLogin } from "@/components/editor/edit-login";
import { ProjectBody } from "@/components/project-body";
import { ProjectEditor } from "@/components/editor/project-editor";
import { CommaLineBreaks, ProjectSummary } from "@/components/project-summary";
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
    <article className="w-full max-w-none text-center">
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
        <div className="mx-auto w-full max-w-xl md:max-w-2xl px-1 sm:px-0">
          <h1 className="text-lg font-normal leading-snug tracking-[0.04em] text-neutral-900 md:text-xl md:tracking-[0.05em] lg:text-2xl lg:tracking-[0.06em]">
            {project.title}
          </h1>
          {project.place ? (
            <CommaLineBreaks
              text={project.place}
              className="mt-4 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-400"
            />
          ) : null}
          {project.year != null ? (
            <p className="mt-5 text-[0.65rem] tabular-nums tracking-[0.22em] text-neutral-400">
              {project.year}
            </p>
          ) : null}
          {project.summary ? <ProjectSummary text={project.summary} /> : null}
        </div>
      </header>

      <ProjectBody content={content} />
    </article>
  );
}
