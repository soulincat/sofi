import Link from "next/link";

import { getProjectsIndex } from "@/data/projects";

export const revalidate = 60;

export default async function HomePage() {
  const projects = await getProjectsIndex();

  return (
    <div>
      <ul className="flex flex-col gap-3 md:gap-3.5">
        {projects.map((p) => (
          <li key={p._id}>
            <Link
              href={`/work/${p.slug}`}
              className="text-[0.9375rem] leading-snug text-neutral-800 transition-colors hover:text-neutral-500 motion-reduce:transition-none md:text-[0.875rem]"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
