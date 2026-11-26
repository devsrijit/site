import type { MetadataRoute } from "next";

// Every crawler and every AI agent may read the whole site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://srijit.me/sitemap.xml",
    host: "https://srijit.me",
  };
}
