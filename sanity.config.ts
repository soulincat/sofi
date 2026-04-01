"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { structure } from "./sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "sofi-site",
  title: "Site content",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/admin",
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
