import { cache } from "react";

import { DEMO_PROJECT_INDEX, getDemoProjectBySlug } from "@/data/demo-projects";
import {
  loadSiteImportManifest,
  siteImportSlugs,
  siteImportToDetail,
  siteImportToIndexItems,
} from "@/data/site-import-loader";
import {
  getTumblrProjectBySlug,
  getTumblrProjectIndex,
  getTumblrSlugsForStatic,
  tumblrConfigured,
} from "@/data/tumblr";
import { getSanityReadClient } from "@/sanity/client";
import { sanityConfigured } from "@/sanity/env";
import { mapSanityIndexRow, mapSanityProjectDetail } from "@/sanity/mapToProjectDetail";
import {
  projectBySlugQuery,
  projectSlugsQuery,
  projectsIndexQuery,
} from "@/sanity/queries";
import type { ProjectDetail, ProjectIndexItem } from "@/types/project";

function siteImportActive(): boolean {
  const m = loadSiteImportManifest();
  return Boolean(m?.projects?.length);
}

async function getSanityIndex(): Promise<ProjectIndexItem[] | null> {
  if (!sanityConfigured) return null;
  try {
    const client = getSanityReadClient();
    const rows = await client.fetch(projectsIndexQuery);
    if (!Array.isArray(rows) || rows.length === 0) {
      return null;
    }
    return rows.map((row) => mapSanityIndexRow(row));
  } catch (e) {
    console.error("[sanity] getProjectsIndex failed", e);
    return null;
  }
}

export const getProjectsIndex = cache(async (): Promise<ProjectIndexItem[]> => {
  if (siteImportActive()) {
    return siteImportToIndexItems();
  }

  const fromSanity = await getSanityIndex();
  if (fromSanity?.length) {
    return fromSanity;
  }

  if (tumblrConfigured) {
    try {
      const fromTumblr = await getTumblrProjectIndex();
      if (fromTumblr.length > 0) {
        return fromTumblr;
      }
    } catch (e) {
      console.error("[tumblr] getProjectsIndex failed", e);
    }
  }

  return DEMO_PROJECT_INDEX;
});

export const getProjectBySlug = cache(
  async (slug: string): Promise<ProjectDetail | null> => {
    if (siteImportActive()) {
      return siteImportToDetail(slug) ?? null;
    }

    if (sanityConfigured) {
      try {
        const client = getSanityReadClient();
        const raw = await client.fetch(projectBySlugQuery, { slug });
        if (raw) {
          return mapSanityProjectDetail(raw);
        }
      } catch (e) {
        console.error("[sanity] getProjectBySlug failed", e);
      }
    }

    if (tumblrConfigured) {
      try {
        const tumblr = await getTumblrProjectBySlug(slug);
        if (tumblr) {
          return tumblr;
        }
      } catch (e) {
        console.error("[tumblr] getProjectBySlug failed", e);
      }
    }

    return getDemoProjectBySlug(slug);
  },
);

/** Static paths: downloaded RSS manifest → Sanity → Tumblr → demo. */
export async function getProjectSlugsForStatic(): Promise<string[]> {
  if (siteImportActive()) {
    return siteImportSlugs();
  }

  if (sanityConfigured) {
    try {
      const client = getSanityReadClient();
      const slugs = await client.fetch(projectSlugsQuery);
      if (Array.isArray(slugs) && slugs.length > 0) {
        return slugs.filter((s): s is string => typeof s === "string");
      }
    } catch (e) {
      console.error("[sanity] getProjectSlugsForStatic failed", e);
    }
  }

  if (tumblrConfigured) {
    try {
      const slugs = await getTumblrSlugsForStatic();
      if (slugs.length > 0) {
        return slugs;
      }
    } catch (e) {
      console.error("[tumblr] getProjectSlugsForStatic failed", e);
    }
  }

  return DEMO_PROJECT_INDEX.map((p) => p.slug);
}
