import type { StructureResolver } from "sanity/structure";
import { ImageIcon } from "@sanity/icons";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website content")
    .items([
      S.listItem()
        .title("Projects (work pages)")
        .icon(ImageIcon)
        .child(
          S.documentTypeList("project")
            .title("Projects")
            .defaultOrdering([{ field: "_createdAt", direction: "desc" }]),
        ),
    ]);
