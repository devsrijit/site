import { NextResponse, type NextRequest } from "next/server";
import { PARTS } from "@/lib/parts";

// With Cache Components, a part slug that generateStaticParams does not list
// renders on request, and its static shell streams with status 200 before the
// page calls notFound(). This proxy answers unknown one-segment paths with a
// real 404 before rendering starts, so crawlers never index a soft 404.
const KNOWN = new Set<string>([
  ...PARTS.map((p) => p.slug),
  "opengraph-image",
  "twitter-image",
  "icon",
  "apple-icon",
  "_not-found",
]);

export function proxy(req: NextRequest) {
  const slug = req.nextUrl.pathname.slice(1);
  if (KNOWN.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", req.url), { status: 404 });
}

// Only one-segment paths without a dot: files, _next and nested routes pass.
export const config = {
  matcher: ["/((?!_next/)[^/.]+)"],
};
