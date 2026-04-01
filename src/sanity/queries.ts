import { defineQuery } from "next-sanity";

export const projectsIndexQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    year,
    summary
  }
`);

export const projectSlugsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current)].slug.current
`);

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    year,
    summary,
    "content": content[]{
      _type == "image" => {
        "_key": _key,
        "_type": "image",
        alt,
        caption,
        "src": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      _type != "image" => @
    }
  }
`);
