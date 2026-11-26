import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartJsonLd } from "@/components/JsonLd";
import { PartEntry, type PartLink } from "@/components/PartEntry";
import { PAGES, PARTS, indexOf, pageOf, partBySlug } from "@/lib/parts";

// All six parts are prerendered. Only an unknown slug would render on
// request, and it gives a 404, so this segment may block on navigation.
export const instant = false;

export function generateStaticParams() {
  return PARTS.map((p) => ({ part: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[part]">): Promise<Metadata> {
  const part = partBySlug((await params).part);
  if (!part) return {};
  // The layout's title template adds "· Srijit Ghosh" to the page title.
  // The openGraph and twitter titles do not follow the template.
  const title = `${part.part} ${part.name.toUpperCase()}`;
  const description = `${part.part} datasheet. ${part.fn}`;
  const url = `/${part.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    // A page's openGraph and twitter objects replace the layout's, so the
    // shared fields are set again here.
    openGraph: { title: `${title} · Srijit Ghosh`, description, url, siteName: "srijit.me", type: "website" },
    twitter: { card: "summary_large_image", title: `${title} · Srijit Ghosh`, description, creator: "@devsrijit" },
  };
}

const label = (i: number) => `${PARTS[i].part} ${PARTS[i].name.toUpperCase()}`;

export default async function PartPage({ params }: PageProps<"/[part]">) {
  const part = partBySlug((await params).part);
  if (!part) notFound();

  const i = PARTS.indexOf(part);
  // The first part steps back to the cover; the last part steps on to the
  // catalogue index under the cover.
  const prev: PartLink = i > 0 ? { href: `/${PARTS[i - 1].slug}`, label: label(i - 1) } : { href: "/", label: "SRJ-0001 Cover" };
  const next: PartLink =
    i < PARTS.length - 1 ? { href: `/${PARTS[i + 1].slug}`, label: label(i + 1) } : { href: "/#catalogue", label: "Catalogue index" };

  return (
    <main>
      <PartJsonLd part={part} />
      <PartEntry
        part={part}
        index={indexOf(part)}
        count={PARTS.length}
        page={pageOf(part)}
        pages={PAGES}
        prev={prev}
        next={next}
      />
    </main>
  );
}
