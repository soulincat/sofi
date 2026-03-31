import { SiteShell } from "@/components/site-shell";
import { getProjectsIndex } from "@/data/projects";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projects = await getProjectsIndex();
  return <SiteShell projects={projects}>{children}</SiteShell>;
}
