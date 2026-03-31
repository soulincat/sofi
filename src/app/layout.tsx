import type { Metadata } from "next";

import { siteDescription, siteTitle } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: `%s — ${siteTitle}`,
  },
  description: siteDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
