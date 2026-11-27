import { readdirSync } from "node:fs";
import type { MetadataRoute } from "next";
import { PARTS } from "@/lib/parts";
import { SITE } from "@/lib/agent/markdown";
import { lastModified } from "@/lib/lastModified";

// Each URL's date is the last commit that changed the files its content
// comes from (see lib/lastModified.ts). Styles are left out on purpose: a
// visual change does not change what a page says.

const partFile = (slug: string) => {
  const f = readdirSync("lib/parts").find((n) => n.startsWith(`${slug}-`));
  return f ? `lib/parts/${f}` : "lib/parts";
};

/** The files the home page's words come from. */
const HOME = [
  "app/page.tsx",
  "components/Cover.tsx",
  "components/Availability.tsx",
  "components/CatalogueIndex.tsx",
  "components/WorkHistory.tsx",
  "components/Schematic.tsx",
  "lib/catalogue.ts",
  "lib/work.ts",
  "lib/parts",
];

/** The text files are written from the same data as the pages. */
const AGENT = ["lib/agent", "lib/work.ts", "lib/catalogue.ts", "lib/parts"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: lastModified(HOME), changeFrequency: "weekly", priority: 1 },
    ...PARTS.map((p) => ({
      url: `${SITE}/${p.slug}`,
      lastModified: lastModified([partFile(p.slug), "components/PartEntry.tsx"]),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE}/resume.pdf`, lastModified: lastModified(["public/resume.pdf"]), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/llms.txt`, lastModified: lastModified([...AGENT, "app/llms.txt"]), changeFrequency: "weekly", priority: 0.3 },
    { url: `${SITE}/llms-full.txt`, lastModified: lastModified([...AGENT, "app/llms-full.txt"]), changeFrequency: "weekly", priority: 0.3 },
  ];
}
