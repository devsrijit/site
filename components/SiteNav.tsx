"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Arrow } from "./Arrow";
import { IssueLine } from "./IssueLine";

export type NavPart = { slug: string; part: string; name: string; oneLiner: string };

const EMAIL = "mailto:srijitghosh.dev@gmail.com";
const GITHUB = "https://github.com/DevSrijit";
const X = "https://x.com/devsrijit";

/** Closes a popover on Escape or on a pointer down outside it. */
function useDismiss(open: boolean, close: () => void, refs: React.RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: PointerEvent) => {
      if (refs.some((r) => r.current?.contains(e.target as Node))) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close, refs]);
}

/**
 * The site navigation on every page. Sticky, so the way back is always one
 * click away. Work opens the list of parts; part pages add previous and next
 * buttons; Email is the one filled button. On phones everything folds into
 * one Menu button.
 */
export function SiteNav({ parts }: { parts: NavPart[] }) {
  const path = usePathname();
  const current = parts.findIndex((p) => `/${p.slug}` === path);
  const [work, setWork] = useState(false);
  const [menu, setMenu] = useState(false);
  const [stuck, setStuck] = useState(false);
  const workBtn = useRef<HTMLButtonElement>(null);
  const workPanel = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const workId = useId();
  const menuId = useId();

  useDismiss(work, () => setWork(false), [workBtn, workPanel]);
  useDismiss(menu, () => setMenu(false), [menuBtn, menuPanel]);

  // A route change closes any open panel.
  useEffect(() => {
    setWork(false);
    setMenu(false);
  }, [path]);

  // The heavy rule belongs to the top of the page; once the page scrolls,
  // the bar thins to a hairline.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prev = current > 0 ? parts[current - 1] : null;
  const next = current >= 0 && current < parts.length - 1 ? parts[current + 1] : null;

  const partList = (onPick: () => void) => (
    <ul className="nav-parts">
      {parts.map((p, i) => (
        <li key={p.slug}>
          <Link
            href={`/${p.slug}`}
            className="nav-part"
            aria-current={i === current ? "page" : undefined}
            onClick={onPick}
          >
            <span className="nav-part-no">{p.part}</span>
            <span className="nav-part-name">{p.name}</span>
            <span className="nav-part-line">{p.oneLiner}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="nav" data-stuck={stuck ? "" : undefined} data-construct="block">
      <div className="nav-bar">
        <Link href="/" className="nav-btn nav-home" aria-current={path === "/" ? "page" : undefined}>
          Home
        </Link>

        <nav className="nav-links" aria-label="Main">
          <div className="nav-pop">
            <button
              ref={workBtn}
              type="button"
              className="nav-btn"
              aria-expanded={work}
              aria-controls={workId}
              onClick={() => setWork((v) => !v)}
            >
              Work
              <svg className="nav-caret" viewBox="0 0 10 10" width="10" height="10" aria-hidden>
                <path d="M2 3.5 5 6.5l3-3" />
              </svg>
            </button>
            <div ref={workPanel} id={workId} className="nav-panel" hidden={!work}>
              {partList(() => setWork(false))}
              <Link href="/#catalogue" className="nav-panel-foot" onClick={() => setWork(false)}>
                The catalogue
                <Arrow dir="right" />
              </Link>
            </div>
          </div>
          <Link href="/#history" className="nav-btn">
            History
          </Link>
          <a href="/resume.pdf" className="nav-btn" target="_blank" rel="noopener">
            Resume
          </a>
          <a href={GITHUB} className="nav-btn" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>

        <div className="nav-end">
          {current >= 0 ? (
            <div className="nav-step" aria-label="Parts">
              {prev ? (
                <Link href={`/${prev.slug}`} className="nav-icon" aria-label={`Previous: ${prev.part} ${prev.name}`}>
                  <Arrow dir="left" />
                </Link>
              ) : (
                <span className="nav-icon" aria-hidden data-off="">
                  <Arrow dir="left" />
                </span>
              )}
              <span className="nav-step-k">
                {parts[current].part} <span className="nav-step-of">/ {parts.length}</span>
              </span>
              {next ? (
                <Link href={`/${next.slug}`} className="nav-icon" aria-label={`Next: ${next.part} ${next.name}`}>
                  <Arrow dir="right" />
                </Link>
              ) : (
                <span className="nav-icon" aria-hidden data-off="">
                  <Arrow dir="right" />
                </span>
              )}
            </div>
          ) : null}
          <IssueLine />
          <a href={EMAIL} className="nav-btn nav-btn--solid">
            Email
          </a>
          <button
            ref={menuBtn}
            type="button"
            className="nav-btn nav-menu-btn"
            aria-expanded={menu}
            aria-controls={menuId}
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div ref={menuPanel} id={menuId} className="nav-sheet" hidden={!menu}>
        {partList(() => setMenu(false))}
        <div className="nav-sheet-links">
          <Link href="/#history" onClick={() => setMenu(false)}>
            History
          </Link>
          <a href="/resume.pdf" target="_blank" rel="noopener">
            Resume
          </a>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={X} target="_blank" rel="noopener noreferrer">
            X
          </a>
          <a href={EMAIL} className="nav-btn nav-btn--solid">
            Email
          </a>
        </div>
      </div>
    </header>
  );
}
