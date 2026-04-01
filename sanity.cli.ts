import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "f8lcj2ht",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production",
  },
});
