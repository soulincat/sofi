import Link from "next/link";

import { siteTitle } from "@/lib/site";
import type { ProjectIndexItem } from "@/types/project";

export function LeftNav({ projects }: { projects: ProjectIndexItem[] }) {
  return (
    <nav
      className="sticky top-0 flex max-h-screen flex-col gap-10 py-10 pr-4"
      aria-label="Primary"
    >
      <div>
        <Link
          href="/"
          className="text-[0.8125rem] font-normal tracking-[0.02em] text-neutral-900 hover:text-neutral-600 motion-reduce:transition-none"
        >
          {siteTitle}
        </Link>
      </div>
      <ul className="flex flex-col gap-2.5">
        {projects.map((p) => (
          <li key={p._id}>
            <Link
              href={`/work/${p.slug}`}
              className="text-[0.8125rem] leading-snug text-neutral-600 transition-colors hover:text-neutral-900 motion-reduce:transition-none"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
