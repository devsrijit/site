import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Arrow";
import { PARTS } from "@/lib/parts";

export const metadata: Metadata = {
  title: "Error 404, part not found",
  robots: { index: false },
};

/** The 404 page, as a datasheet errata sheet. */
export default function NotFound() {
  return (
    <main>
      <article className="part page" data-construct-frame aria-label="Errata sheet: part not found">

        <div className="nf-head">
          <h1 className="t-display nf-code" data-construct="type">404</h1>
          <div className="nf-meta" data-construct="block">
            <p className="part-no t-label">Error E404</p>
            <p className="t-voice nf-line">No part with this number is in the catalogue.</p>
            <p className="nf-note">
              Check the part number, or pick a part that ships today.
            </p>
          </div>
        </div>

        <nav aria-label="Parts in the catalogue" className="nf-list" data-construct="block">
          <ul>
            {PARTS.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="nf-row">
                  <span className="nf-no">{p.part}</span>
                  <span className="nf-name">{p.name}</span>
                  <span className="nf-fn">{p.oneLiner}</span>
                  <Arrow dir="right" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

      </article>
    </main>
  );
}
