import { cache } from "react";

import { DEMO_PROJECT_INDEX, getDemoProjectBySlug } from "@/data/demo-projects";
import {
  getFileProjectBySlug,
  getFileProjectIndex,
  getFileProjectSlugs,
} from "@/data/file-content";
import {
  loadSiteImportManifest,
  siteImportSlugs,
  siteImportToDetail,
  siteImportToIndexItems,
} from "@/data/site-import-loader";
import type { ProjectDetail, ProjectIndexItem } from "@/types/project";

function siteImportActive(): boolean {
  const m = loadSiteImportManifest();
  return Boolean(m?.projects?.length);
}

export const getProjectsIndex = cache(async (): Promise<ProjectIndexItem[]> => {
  const fromFile = getFileProjectIndex();
  if (fromFile.length > 0) {
    return fromFile;
  }

  if (siteImportActive()) {
    return siteImportToIndexItems();
  }

  return DEMO_PROJECT_INDEX;
});

export const getProjectBySlug = cache(
  async (slug: string): Promise<ProjectDetail | null> => {
    const fromFile = getFileProjectBySlug(slug);
    if (fromFile) {
      return fromFile;
    }

    if (siteImportActive()) {
      return siteImportToDetail(slug) ?? null;
    }

    return getDemoProjectBySlug(slug);
  },
);

/** Static paths: content/projects.json → site-import fallback → demo. */
export async function getProjectSlugsForStatic(): Promise<string[]> {
  const fromFile = getFileProjectSlugs();
  if (fromFile.length > 0) {
    return fromFile;
  }

  if (siteImportActive()) {
    return siteImportSlugs();
  }

  return DEMO_PROJECT_INDEX.map((p) => p.slug);
}
