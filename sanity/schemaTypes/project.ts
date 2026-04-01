import { ImageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: ImageIcon,
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "page", title: "Project page content" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Project title",
      description: "Shown on the site and in lists.",
      type: "string",
      group: "basics",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "slug",
      title: "Web address (last part of the link)",
      description: 'Example: if you type "blue-series", the page will be /work/blue-series',
      type: "slug",
      group: "basics",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      group: "basics",
      validation: (Rule) => Rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: "summary",
      title: "Short summary",
      description: "Optional. A few lines under the title on the project page.",
      type: "text",
      rows: 4,
      group: "basics",
    }),
    defineField({
      name: "content",
      title: "Images & text for this project",
      description:
        "Build the page top-to-bottom: add images (upload or drag files), text, video, or audio. Drag blocks to reorder.",
      type: "array",
      group: "page",
      of: [
        defineArrayMember({
          type: "block",
          title: "Text",
          styles: [{ title: "Normal", value: "normal" }],
          lists: [],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                    validation: (Rule) => Rule.required(),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              type: "string",
              title: "Short description (for accessibility)",
              description: "What someone would say if they couldn’t see the image.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "caption",
              type: "string",
              title: "Caption (optional)",
            }),
          ],
        }),
        defineArrayMember({ type: "videoEmbed" }),
        defineArrayMember({ type: "audioEmbed" }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "year" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Untitled",
        subtitle: subtitle ? String(subtitle) : "",
      };
    },
  },
});
