import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityConfigured } from "./env";

export function getSanityReadClient() {
  if (!sanityConfigured) {
    throw new Error("Sanity is not configured (missing NEXT_PUBLIC_SANITY_PROJECT_ID)");
  }
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
  });
}
