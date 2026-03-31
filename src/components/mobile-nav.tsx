"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { siteTitle } from "@/lib/site";
import type { ProjectIndexItem } from "@/types/project";

function MobileNavInner({ projects }: { projects: ProjectIndexItem[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-neutral-200/80 bg-[var(--background)]/90 px-5 py-4 backdrop-blur-sm md:hidden">
        <Link
          href="/"
          className="text-[0.8125rem] tracking-[0.02em] text-neutral-900"
        >
          {siteTitle}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[0.75rem] uppercase tracking-[0.12em] text-neutral-500"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-30 bg-[var(--background)] pt-[3.25rem] transition-opacity duration-200 md:hidden motion-reduce:transition-none ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <nav className="h-full overflow-y-auto px-5 pb-16 pt-6" aria-label="Primary">
          <ul className="flex flex-col gap-3">
            {projects.map((p) => (
              <li key={p._id}>
                <Link
                  href={`/work/${p.slug}`}
                  className="block text-[0.9375rem] leading-snug text-neutral-700"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

export function MobileNav({ projects }: { projects: ProjectIndexItem[] }) {
  const pathname = usePathname();
  return <MobileNavInner key={pathname} projects={projects} />;
}
