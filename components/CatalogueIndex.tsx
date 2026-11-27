import { Fragment } from "react";
import Link from "next/link";
import { PARTS, pageOf } from "@/lib/parts";
import { Arrow } from "./Arrow";

/**
 * The selection guide under the cover: one row per part, as a datasheet
 * prints its ordering information. Each row opens the part's page.
 */
export function CatalogueIndex() {
  return (
    <section className="cat page" id="catalogue" aria-labelledby="cat-title">
      <p className="title title--part">
        <span className="title-main" id="cat-title">
          Catalogue
        </span>
      </p>

      <section className="sec cat-sec">
        <table className="tbl tbl--cat">
          <thead>
            <tr>
              <th className="c-no">Part number</th>
              <th className="c-name">Name</th>
              <th className="c-fn">Function</th>
              <th className="c-pkg">Package</th>
              <th className="c-stack">Stack</th>
              <th className="c-status">Status</th>
              <th className="c-page num">Datasheet</th>
            </tr>
          </thead>
          <tbody>
            {PARTS.map((p) => (
              <tr key={p.slug}>
                <td className="c-no">{p.part}</td>
                <td className="c-name">
                  <Link className="cat-link" href={`/${p.slug}`}>
                    {p.name}
                  </Link>
                </td>
                <td className="c-fn">{p.fn}</td>
                <td className="c-pkg">
                  {p.pkg.split(", ").map((item, i) => (
                    <Fragment key={item}>
                      {i > 0 && ", "}
                      <span className="nowrap">{item}</span>
                    </Fragment>
                  ))}
                </td>
                <td className="c-stack">
                  {/* Each item stays on one line: "Web Worker", not "Web / Worker".
                      The dot holds to the item before it, so a line can
                      end on a dot but never start with one. The package
                      cell above does the same with its commas. */}
                  {p.stack.split(" · ").map((item, i, all) => (
                    <Fragment key={item}>
                      {i > 0 && " "}
                      <span className="nowrap">
                        {item}
                        {i < all.length - 1 && "\u00a0·"}
                      </span>
                    </Fragment>
                  ))}
                </td>
                <td className="c-status">
                  {p.status}
                  <span className="cat-avail">{p.avail}</span>
                </td>
                <td className="c-page num" aria-hidden>
                  <span className="cat-page">
                    Page {pageOf(p)}
                    <Arrow dir="right" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </section>
  );
}
