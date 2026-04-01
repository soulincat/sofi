import { PlayIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const videoEmbed = defineType({
  name: "videoEmbed",
  title: "Video (paste a link)",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "url",
      title: "Video URL",
      description: "Direct link to an .mp4 file works best in the site player.",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { url: "url" },
    prepare({ url }) {
      return { title: url ? String(url).slice(0, 48) : "Video", subtitle: "Video link" };
    },
  },
});
