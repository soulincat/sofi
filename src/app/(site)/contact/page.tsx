import type { Metadata } from "next";

import { ContactEditor } from "@/components/editor/contact-editor";
import { EditLogin } from "@/components/editor/edit-login";
import { getContactContent } from "@/data/contact-content";
import { hasEditSession } from "@/lib/edit-auth";
import { siteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contact — ${siteTitle}`,
};

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const qs = await searchParams;
  const editRequested = qs.edit === "1";
  const editorEnabled = editRequested && (await hasEditSession());
  const contact = getContactContent();

  return (
    <main
      className="mx-auto w-full max-w-md text-center md:max-w-lg"
      aria-label="Contact"
    >
      {editRequested && !editorEnabled ? <EditLogin /> : null}
      {editorEnabled ? <ContactEditor initial={contact} /> : null}

      <header className="mb-16 md:mb-24">
        <h1 className="text-[0.9375rem] font-normal leading-snug tracking-[0.04em] text-neutral-900 md:text-base md:tracking-[0.06em]">
          {contact.heading}
        </h1>
      </header>

      {contact.body.trim() ? (
        <p className="mx-auto mb-10 max-w-[17rem] whitespace-pre-wrap text-[0.8125rem] leading-[1.75] text-neutral-500 md:max-w-xs">
          {contact.body}
        </p>
      ) : null}

      <p>
        <a
          href={contact.instagramUrl}
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
