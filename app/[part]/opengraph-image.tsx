import { notFound } from "next/navigation";
import { renderPartCard } from "@/lib/og/partCard";
import { PARTS, partBySlug } from "@/lib/parts";

// One share card per part, prerendered at build time. The alt export is
// static for a file-based image, so it names the card in general words.
export const alt = "A datasheet share card for one part in the SRJ-0001 catalogue by Srijit Ghosh.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PARTS.map((p) => ({ part: p.slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ part: string }> }) {
  const part = partBySlug((await params).part);
  if (!part) notFound();
  return renderPartCard({ part: part.part, name: part.name.toUpperCase(), oneLiner: part.oneLiner });
}
