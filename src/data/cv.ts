/** CV content — edit here or replace with CMS later. */

export type CvEntry = { period?: string; lines: string[] };

export type CvSection = {
  id: string;
  title: string;
  entries: CvEntry[];
};

export const CV_SECTIONS: CvSection[] = [
  {
    id: "education",
    title: "Education",
    entries: [
      {
        period: "2014 — 2018",
        lines: ["MFA, Studio Art — Example Academy"],
      },
      {
        period: "2010 — 2014",
        lines: ["BFA, Fine Arts — Example University"],
      },
    ],
  },
  {
    id: "solo",
    title: "Solo exhibitions",
    entries: [
      {
        period: "2024",
        lines: ["Gallery Name, City"],
      },
      {
        period: "2022",
        lines: ["Project Space, City"],
      },
    ],
  },
  {
    id: "group",
    title: "Selected group exhibitions",
    entries: [
      {
        period: "2025",
        lines: ["Annual survey, Museum, City"],
      },
      {
        period: "2023",
        lines: ["Summer show, Kunstverein, City"],
      },
      {
        period: "2021",
        lines: ["Biennial title, City"],
      },
    ],
  },
  {
    id: "residencies",
    title: "Residencies & awards",
    entries: [
      {
        period: "2023",
        lines: ["Residency name, Region"],
      },
      {
        period: "2020",
        lines: ["Grant / fellowship, Organization"],
      },
    ],
  },
];

/** Optional one-line intro above sections; leave empty to hide. */
export const CV_INTRO = "";
