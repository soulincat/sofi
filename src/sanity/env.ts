export const sanityConfigured = Boolean(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim(),
);

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2025-03-01";
