import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectBody } from "@/components/project-body";
import { getProjectBySlug, getProjectsIndex } from "@/data/projects";
import { siteDescription, siteTitle } from "@/lib/site";
import type { ProjectContentBlock } from "@/types/project";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjectsIndex();
  return projects.map((p) => ({ slug: p.slug }));
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
    <article>
      <header className="mb-12 max-w-2xl md:mb-16">
        <p className="mb-3">
          <Link
            href="/"
            className="text-[0.6875rem] uppercase tracking-[0.14em] text-neutral-400 hover:text-neutral-600"
          >
            Index
          </Link>
        </p>
        <h1 className="text-xl font-normal tracking-[0.02em] text-neutral-900 md:text-2xl">
          {project.title}
        </h1>
        {project.year != null ? (
          <p className="mt-2 text-sm text-neutral-500">{project.year}</p>
        ) : null}
        {project.date ? (
          <p className="mt-1 text-sm text-neutral-500">{project.date}</p>
        ) : null}
        {project.summary ? (
          <p className="mt-6 text-[0.9375rem] leading-relaxed text-neutral-600">
            {project.summary}
          </p>
        ) : null}
      </header>

      <ProjectBody content={content} />
    </article>
  );
}
