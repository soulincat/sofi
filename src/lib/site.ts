export const siteTitle =
  process.env.NEXT_PUBLIC_SITE_TITLE ?? "Sofia Dimitrova";

export const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
  "Contemporary artist — exhibitions and work.";

/** Full URL to Instagram profile, e.g. https://www.instagram.com/username */
export const instagramUrl =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/";
