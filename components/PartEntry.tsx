import { Fragment, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { CharRow, Part } from "@/lib/parts/types";
import { AppCircuit } from "./AppCircuit";
import { DrawOnView } from "./DrawOnView";
import { Pinout } from "./Pinout";
import { Arrow } from "./Arrow";

const host = (url: string) => url.replace(/^https:\/\/(www\.)?/, "");

/** Words in backticks print as code. */
function rich(text: string): ReactNode {
  return text.split(/`([^`]+)`/).map((s, i) => (i % 2 ? <code key={i}>{s}</code> : s));
}

/** The value for the phone fold, where MIN and MAX are hidden. */
function narrowValue(r: CharRow) {
  if (r.typ) return r.typ;
  if (r.min && r.max) return `${r.min} to ${r.max}`;
  if (r.min) return `≥ ${r.min}`;
  if (r.max) return `≤ ${r.max}`;
  return "–";
}

export type PartLink = { href: string; label: string };

type Props = {
  part: Part;
  /** Position in the catalogue, 1-based. */
  index: number;
  count: number;
  page: number;
  pages: number;
  prev: PartLink;
  next: PartLink;
};

/** One catalogue entry, laid out as a datasheet page. */
export function PartEntry({ part, index, count, page, pages, prev, next }: Props) {
  const tag = `${part.part} ${part.name.toUpperCase()}`;
  const liveKey = part.live?.key ?? "Live";
  const nameSize = { "--name-em": part.nameEm } as CSSProperties;

  return (
    <article className="part page" data-construct-frame aria-label={`${tag} datasheet, page ${page}`}>

      <div className="part-head">
        <h1 className="part-name t-display" style={nameSize} data-construct="type">
          {part.name}
        </h1>
        <div className="part-meta" data-construct="block">
          <p className="part-no t-label">{part.part}</p>
          <p className="part-line t-voice">{part.oneLiner}</p>
          <dl className="part-facts t-label">
            <dt>Status</dt>
            <dd>{part.status}</dd>
            <dt>Package</dt>
            <dd>{part.pkg}</dd>
            {part.live ? (
              <>
                <dt>{liveKey}</dt>
                <dd>
                  <a href={part.live.href} target="_blank" rel="noopener noreferrer">
                    {part.live.label}<span className="go go--out" aria-hidden>↗</span>
                  </a>
                  {/* A running website: the green LED, on the clock's blink. */}
                  {part.live.site && <i className="avail-led site-led" aria-hidden />}
                </dd>
              </>
            ) : (
              <>
                <dt>Source</dt>
                <dd>
                  <a href={part.source} target="_blank" rel="noopener noreferrer">
                    {host(part.source)}<span className="go go--out" aria-hidden>↗</span>
                  </a>
                </dd>
              </>
            )}
          </dl>
        </div>
      </div>

      <p className="title title--part" data-construct="block">
        <span className="title-main">{part.title}</span>
      </p>

      <div className="part-grid">
        <section className="sec part-features" data-construct="block">
          <h2 className="sec-h">
            <span className="sec-n">1</span>Features
          </h2>
          <ul className="feat">
            {part.features.map((f) => (
              <li key={f}>{rich(f)}</li>
            ))}
          </ul>
        </section>

        <section className="sec part-pins" data-construct="block">
          <h2 className="sec-h">
            <span className="sec-n">2</span>Pin configuration and functions
          </h2>
          <div className="pins-wrap">
            <DrawOnView className="pins-draw">
              <Pinout pins={part.pins} />
              <p className="fig-note t-label">
                {part.pkgCode} package, {part.pins.length}-pin, top view
              </p>
            </DrawOnView>
            <table className="tbl tbl--pins">
              <thead>
                <tr>
                  <th>Pin</th>
                  <th>Name</th>
                  <th>I/O</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {part.pins.map((p) => (
                  <tr key={p.n}>
                    <td className="num">{p.n}</td>
                    <td className="strong">{p.name}</td>
                    <td>{p.io}</td>
                    <td>
                      {p.desc} {p.file && <span className="file">{p.file}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sec part-chars" data-construct="block">
          <h2 className="sec-h">
            <span className="sec-n">3</span>Electrical characteristics
          </h2>
          <p className="conds">{rich(part.conditions)}</p>
          <div className="tbl-scroll">
            <table className="tbl tbl--chars">
              <thead>
                <tr>
                  <th className="c-param">Parameter</th>
                  <th className="c-cond">Test conditions</th>
                  <th className="num">Min</th>
                  <th className="num">Typ</th>
                  <th className="num">Max</th>
                  <th className="c-unit">Unit</th>
                </tr>
              </thead>
              <tbody>
                {part.chars.map((g) => (
                  <Fragment key={g.group}>
                    <tr className="grp">
                      <th colSpan={6} scope="colgroup">
                        {g.group}
                      </th>
                    </tr>
                    {g.rows.map((r) => (
                      <tr key={r.param}>
                        <td className="c-param">
                          {r.sym && (
                            <span className="sym">
                              {r.symPrefix ?? "t"}
                              <sub>{r.sym}</sub>
                            </span>
                          )}
                          {r.param}
                          <span className="cond-inline">{r.cond}</span>
                        </td>
                        <td className="c-cond">{r.cond}</td>
                        <td className="num">{r.min ?? "–"}</td>
                        <td className={`num strong${r.text ? " txt" : ""}`}>
                          <span className="typ-wide">{r.typ ?? "–"}</span>
                          {/* Phones drop the MIN and MAX columns and show a range here. */}
                          <span className="typ-narrow">{narrowValue(r)}</span>
                          {r.note && <sup>({r.note})</sup>}
                        </td>
                        <td className="num">{r.max ?? "–"}</td>
                        <td className="c-unit">{r.unit}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {part.footnotes.map((f, i) => (
            <p key={i} className="foot-note">
              {f.n ? `(${f.n}) ` : ""}
              {rich(f.text)}
            </p>
          ))}
        </section>

        <section className="sec part-app" data-construct="block">
          <h2 className="sec-h">
            <span className="sec-n">4</span>Application circuit
          </h2>
          <DrawOnView className="app-draw">
            <AppCircuit
              wide={part.circuit.wide}
              narrow={part.circuit.narrow}
              label={`Typical application circuit for ${part.part}`}
            />
          </DrawOnView>
          <p className="fig-note t-label fig-note--center">{part.circuit.caption}</p>
        </section>

        <section className="sec part-order" data-construct="block" id="ordering">
          <h2 className="sec-h">
            <span className="sec-n">5</span>Ordering information
          </h2>
          <table className="tbl tbl--order">
            <tbody>
              <tr>
                <th scope="row">Orderable part</th>
                <td className="strong">{tag}</td>
              </tr>
              <tr>
                <th scope="row">Status</th>
                <td>{part.status}</td>
              </tr>
              <tr>
                <th scope="row">Package</th>
                <td>{part.pkg}</td>
              </tr>
              {part.live && (
                <tr>
                  <th scope="row">{liveKey}</th>
                  <td>
                    <a href={part.live.href} target="_blank" rel="noopener noreferrer">
                      {part.live.label}<span className="go go--out" aria-hidden>↗</span>
                    </a>
                  </td>
                </tr>
              )}
              <tr>
                <th scope="row">Source</th>
                <td>
                  <a href={part.source} target="_blank" rel="noopener noreferrer">
                    {host(part.source)}<span className="go go--out" aria-hidden>↗</span>
                  </a>
                </td>
              </tr>
              {part.ordering.map((o) => (
                <tr key={o.k}>
                  <th scope="row">{o.k}</th>
                  <td className={o.strong ? "strong" : undefined}>
                    {o.href ? (
                      <a href={o.href} target="_blank" rel="noopener noreferrer">
                        {o.v}<span className="go go--out" aria-hidden>↗</span>
                      </a>
                    ) : (
                      rich(o.v)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <nav className="partnav" aria-label="Catalogue pages">
        <Link className="partnav-link partnav-link--prev" href={prev.href} rel="prev">
          <span className="partnav-k t-label">
            <Arrow dir="left" />
            Previous
          </span>
          <span className="partnav-name">{prev.label}</span>
        </Link>
        <Link className="partnav-link partnav-link--next" href={next.href} rel="next">
          <span className="partnav-k t-label">
            Next
            <Arrow dir="right" />
          </span>
          <span className="partnav-name">{next.label}</span>
        </Link>
      </nav>

      <footer className="pagefoot t-label">
        <span>SRJS001 – November 2026</span>
        <span className="pagefoot-mid">srijit.me</span>
        <span>
          Page {page} of {pages}
        </span>
      </footer>
    </article>
  );
}
