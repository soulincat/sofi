import type { Metadata } from "next";

import { CV_INTRO, CV_SECTIONS } from "@/data/cv";
import { siteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: `CV — ${siteTitle}`,
};

export default function AboutPage() {
  return (
    <main
      className="mx-auto w-full max-w-md text-center md:max-w-lg"
      aria-label="Curriculum vitae"
    >
      <header className="mb-16 md:mb-24">
        <p className="text-[0.65rem] uppercase tracking-[0.22em] text-neutral-400">
          Curriculum vitae
        </p>
        <h1 className="mt-5 text-[0.9375rem] font-normal leading-snug tracking-[0.04em] text-neutral-900 md:text-base md:tracking-[0.06em]">
          {siteTitle}
        </h1>
      </header>

      {CV_INTRO.trim() ? (
        <p className="mx-auto mb-16 max-w-[17rem] text-[0.8125rem] leading-[1.75] text-neutral-500 md:mb-24 md:max-w-xs">
          {CV_INTRO}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-16 md:gap-[5.5rem]">
        {CV_SECTIONS.map((section) => (
          <section
            key={section.id}
            className="w-full"
            aria-labelledby={`cv-${section.id}`}
          >
            <h2
              id={`cv-${section.id}`}
              className="mb-10 text-[0.65rem] font-normal uppercase tracking-[0.2em] text-neutral-400 md:mb-12"
            >
              {section.title}
            </h2>
            <ul className="flex flex-col items-center gap-10 md:gap-12">
              {section.entries.map((entry, i) => (
                <li
                  key={`${section.id}-${i}`}
                  className="flex max-w-xs flex-col items-center gap-2 text-center"
                >
                  {entry.period ? (
                    <p className="text-[0.65rem] tabular-nums tracking-[0.18em] text-neutral-400">
                      {entry.period}
                    </p>
                  ) : null}
                  <div className="space-y-1">
                    {entry.lines.map((line, j) => (
                      <p
                        key={j}
                        className="text-[0.8125rem] leading-[1.75] tracking-[0.01em] text-neutral-500"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
