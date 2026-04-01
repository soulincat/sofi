import type { Metadata } from "next";

import { instagramUrl, siteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contact — ${siteTitle}`,
};

export default function ContactPage() {
  return (
    <main
      className="mx-auto w-full max-w-md text-center md:max-w-lg"
      aria-label="Contact"
    >
      <header className="mb-16 md:mb-24">
        <h1 className="text-[0.9375rem] font-normal leading-snug tracking-[0.04em] text-neutral-900 md:text-base md:tracking-[0.06em]">
          Contact
        </h1>
      </header>

      <p>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.8125rem] tracking-[0.06em] text-neutral-500 underline decoration-neutral-300/80 underline-offset-[4px] transition-colors hover:text-neutral-800 hover:decoration-neutral-500"
        >
          Instagram
        </a>
      </p>
    </main>
  );
}
