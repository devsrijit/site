import type { MetadataRoute } from "next";
import { PARTS } from "@/lib/parts";
import { SITE } from "@/lib/agent/markdown";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    ...PARTS.map((p) => ({ url: `${SITE}/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: `${SITE}/resume.pdf`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/llms.txt`, changeFrequency: "weekly", priority: 0.3 },
  ];
}
