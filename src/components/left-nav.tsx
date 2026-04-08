import Link from "next/link";

import { siteTitle } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Name on the top-left wall — one line, no wrap. */
export function SiteMark() {
  return (
    <Link
      href="/"
      className="pointer-events-auto fixed left-3 top-6 z-50 hidden text-xs font-normal uppercase leading-none tracking-[0.2em] text-neutral-900 transition-opacity hover:opacity-55 md:block md:text-sm"
    >
      <span className="whitespace-nowrap">{siteTitle}</span>
    </Link>
  );
}

/** Work · About · Contact — vertically centered on the left wall, rotated. */
export function LeftNav() {
  return (
    <nav
      className="pointer-events-auto fixed left-0 top-0 z-40 hidden h-svh w-9 flex-col md:flex"
      aria-label="Primary"
    >
      <div className="flex h-full w-full items-center justify-center overflow-visible">
        <div className="flex w-max -rotate-90 flex-row items-center gap-x-5 text-[0.625rem] uppercase tracking-[0.18em] text-neutral-500">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap transition-opacity hover:text-neutral-900 hover:opacity-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
