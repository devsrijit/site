import path from "node:path";
import type { NextConfig } from "next";

// PostHog: the events go through /ingest on this site. NEXT_PUBLIC_POSTHOG_REGION
// picks the "us" (default) or "eu" cloud. See components/Analytics.tsx.
const PH = process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "eu" : "us";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: `https://${PH}-assets.i.posthog.com/static/:path*` },
      { source: "/ingest/:path*", destination: `https://${PH}.i.posthog.com/:path*` },
    ];
  },
  // PostHog's API paths end in a slash; keep them as sent.
  skipTrailingSlashRedirect: true,
  cacheComponents: true,
  partialPrefetching: true,
  devIndicators: false,
  // A package-lock.json in the home folder makes Next guess the wrong root.
  turbopack: { root: path.resolve(import.meta.dirname) },
  outputFileTracingRoot: path.resolve(import.meta.dirname),
};

export default nextConfig;
