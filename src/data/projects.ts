import { cache } from "react";

import { DEMO_PROJECT_INDEX, getDemoProjectBySlug } from "@/data/demo-projects";
import type { ProjectDetail, ProjectIndexItem } from "@/types/project";

export const getProjectsIndex = cache(async (): Promise<ProjectIndexItem[]> => {
  return DEMO_PROJECT_INDEX;
});

export const getProjectBySlug = cache(
  async (slug: string): Promise<ProjectDetail | null> => {
    return getDemoProjectBySlug(slug);
  },
);
