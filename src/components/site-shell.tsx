import { LeftNav, SiteMark } from "@/components/left-nav";
import { MobileNav } from "@/components/mobile-nav";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <MobileNav />
      <SiteMark />
      <LeftNav />
      <div className="min-w-0 pt-[3.75rem] md:pt-0 md:pl-36 lg:pl-40">
        <div className="mx-auto max-w-[min(100%,42rem)] px-5 pb-28 pt-8 md:max-w-none md:px-0 md:pb-36 md:pt-16 md:pr-10 lg:pr-16">
          {children}
        </div>
      </div>

      <footer className="pointer-events-none fixed bottom-3 right-4 z-30 md:bottom-5 md:right-6">
        <p className="pointer-events-auto text-[0.5rem] font-normal uppercase leading-none tracking-[0.14em] text-neutral-400">
          built by freundin{" "}
          <a
            href="https://soulin.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 underline decoration-neutral-300/70 underline-offset-[2px] transition-colors hover:text-neutral-600 hover:decoration-neutral-500"
          >
            SOULIN
          </a>
        </p>
      </footer>
    </div>
  );
}
