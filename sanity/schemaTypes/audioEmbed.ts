import { MicrophoneIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const audioEmbed = defineType({
  name: "audioEmbed",
  title: "Audio (paste a link)",
  type: "object",
  icon: MicrophoneIcon,
  fields: [
    defineField({
      name: "url",
      title: "Audio file URL",
      description: "Direct link to .mp3, .m4a, or similar.",
      type: "url",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label (optional)",
      description: "Short line shown above the player.",
      type: "string",
    }),
  ],
  preview: {
    select: { label: "label", url: "url" },
    prepare({ label, url }) {
      return {
        title: label || "Audio",
        subtitle: url ? String(url).slice(0, 40) : "",
      };
    },
  },
});
