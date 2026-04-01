import { SiteShell } from "@/components/site-shell";

export const revalidate = 60;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
