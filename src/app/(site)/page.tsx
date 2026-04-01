import Link from "next/link";

import { getProjectsIndex } from "@/data/projects";
import {
  greyThumbVisual,
  homeTileLayout,
  splitIndexIntoRows,
} from "@/lib/grey-art";

export default async function HomePage() {
  const projects = await getProjectsIndex();
  const rowSeed = projects.reduce(
    (acc, p) => (acc + p.slug.length * 131) >>> 0,
    7919,
  );
  const rows = splitIndexIntoRows(projects, rowSeed);

  return (
    <div className="space-y-6 md:space-y-10" aria-label="Work">
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="flex flex-row flex-wrap items-start justify-center gap-x-6 gap-y-8 md:gap-x-10"
        >
          {row.map((p, ci) => {
            const baseSeed =
              p.slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0) +
              ri * 17;
            const { ratioW, ratioH, from, to } = greyThumbVisual(baseSeed + ci * 3);
            const { widthPct, marginTopPx } = homeTileLayout(
              baseSeed,
              ri,
              ci,
              row.length === 1 ? 1 : 2,
            );
            const cover = p.cover;
            return (
              <Link
                key={p._id}
                href={`/work/${p.slug}`}
                aria-label={`${p.title}${p.year != null ? `, ${p.year}` : ""}`}
                className="block min-w-0 shrink-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
                style={{
                  width: `${widthPct}%`,
                  maxWidth: "100%",
                  marginTop: marginTopPx > 0 ? marginTopPx : undefined,
                }}
              >
                {cover ? (
                  <div
                    className="mx-auto w-full overflow-hidden rounded-[0.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-opacity hover:opacity-85"
                    style={{
                      aspectRatio: `${cover.width} / ${cover.height}`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- local /public + remote CDN covers */}
                    <img
                      src={cover.src}
                      alt=""
                      width={cover.width}
                      height={cover.height}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div
                    className="mx-auto w-full rounded-[0.5px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)] transition-opacity hover:opacity-85"
                    style={{
                      aspectRatio: `${ratioW} / ${ratioH}`,
                      background: `linear-gradient(142deg, ${from} 0%, ${to} 100%)`,
                    }}
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
