import { LeftNav } from "@/components/left-nav";
import { MobileNav } from "@/components/mobile-nav";
import type { ProjectIndexItem } from "@/types/project";

export function SiteShell({
  projects,
  children,
}: {
  projects: ProjectIndexItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] md:gap-x-10 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-x-16">
      <MobileNav projects={projects} />
      <aside className="hidden md:block md:border-r md:border-neutral-200/60">
        <LeftNav projects={projects} />
      </aside>
      <div className="min-w-0 pt-[4.25rem] md:pt-0">
        <div className="px-5 pb-24 pt-6 md:px-0 md:pb-32 md:pt-14 md:pr-8 lg:pr-12">
          {children}
        </div>
      </div>
    </div>
  );
}
