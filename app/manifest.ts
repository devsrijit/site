import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Srijit Ghosh",
    short_name: "Srijit Ghosh",
    description:
      "Srijit Ghosh, a single-chip, full-stack product engineer with an integrated “designer’s eye”.",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f0ea",
    theme_color: "#f1f0ea",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
