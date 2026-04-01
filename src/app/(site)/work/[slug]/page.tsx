import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectBody } from "@/components/project-body";
import { getProjectBySlug, getProjectSlugsForStatic } from "@/data/projects";
import { siteDescription, siteTitle } from "@/lib/site";
import type { ProjectContentBlock } from "@/types/project";

type Props = { params: Promise<{ slug: string }> };

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
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const content = project.content as ProjectContentBlock[] | null;

  return (
    <article className="mx-auto w-full max-w-md text-center md:max-w-lg">
      <header className="mb-16 md:mb-24">
        <h1 className="text-[0.9375rem] font-normal leading-snug tracking-[0.04em] text-neutral-900 md:text-base md:tracking-[0.06em]">
          {project.title}
        </h1>
        {project.year != null ? (
          <p className="mt-5 text-[0.65rem] tabular-nums tracking-[0.22em] text-neutral-400">
            {project.year}
          </p>
        ) : null}
        {project.summary ? (
          <p className="mx-auto mt-10 max-w-[17rem] text-[0.8125rem] leading-[1.75] text-neutral-500 md:max-w-xs">
            {project.summary}
          </p>
        ) : null}
      </header>

      <ProjectBody content={content} />
    </article>
  );
}
