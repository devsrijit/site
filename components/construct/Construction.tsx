"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { play, type Axis, type Mode } from "@/lib/construct/play";
import { hasMarksInView, readScene } from "@/lib/construct/scene";

// The "construction" first paint. See lib/construct/play.ts for the look and
// app/construct.css for the states on <html data-construct>:
//   pending  dark canvas, page animations held (set by the head script)
//   build    the construction layer runs, page animations still held
//   sweep    the split sweeps; the page's own draw-on runs behind it
//   done     settled. Marked elements keep a 0 s entrance, so their own
//            entrance does not replay.

type Boot = { mode: Mode; axis?: Axis; hold?: number };

declare global {
  interface Window {
    __srjConstruct?: Boot;
  }
}

const STORE = "srj-construct";
/** If the app starts later than this, the first visit gets the short intro. */
const LATE_MS = 1500;
/** The longest wait for the display face before the intro is skipped. */
const FONT_WAIT_MS = 900;

let lastPath: string | null = null;
let lastMode: Mode | null = null;
/** Back and forward restore a page the visitor has seen; they get no intro.
 *  The router handles back and forward through the Navigation API and
 *  commits before "popstate" fires, so the "navigate" event is read first.
 *  "popstate" is the fallback where the Navigation API is missing. */
let poppedAt = -Infinity;
if (typeof window !== "undefined") {
  const mark = () => {
    poppedAt = performance.now();
  };
  const nav = (window as unknown as { navigation?: EventTarget }).navigation;
  if (nav) {
    nav.addEventListener("navigate", (e) => {
      if ((e as Event & { navigationType?: string }).navigationType === "traverse") mark();
    });
  } else {
    window.addEventListener("popstate", mark, { capture: true });
  }
}

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function start(mode: Mode, boot: Boot | undefined): () => void {
  const html = document.documentElement;
  const set = (s: string) => html.setAttribute("data-construct", s);
  set("pending");

  let ctl: { finish: () => void } | null = null;
  let over = false;
  let scrollY0 = 0;
  const events = ["pointerdown", "keydown", "wheel", "touchstart", "resize"] as const;

  const done = () => {
    if (over) return;
    over = true;
    set("done");
    for (const e of events) window.removeEventListener(e, skip, true);
    window.removeEventListener("scroll", onScroll, true);
  };
  // Any input ends the intro at once.
  function skip() {
    if (ctl) ctl.finish();
    else done();
  }
  function onScroll() {
    if (Math.abs(window.scrollY - scrollY0) > 2) skip();
  }
  for (const e of events) window.addEventListener(e, skip, { capture: true, passive: true });

  const go = () => {
    if (over) return;
    if (!hasMarksInView()) return done();
    const scene = readScene();
    if (!scene.lines.length && !scene.blocks.length) return done();
    scrollY0 = window.scrollY;
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    set("build");
    const axis: Axis = boot?.axis ?? (scene.h > scene.w * 1.15 ? "y" : "x");
    ctl = play(scene, {
      mode,
      axis,
      hold: boot?.hold,
      onSweep: () => set("sweep"),
      onDone: done,
    });
  };

  // The outlines need the real display face, so both modes wait for it.
  // A client navigation builds on the next frame, because the router
  // scrolls after this commit. The dark canvas covers the frame between.
  const build = mode === "full" ? go : () => requestAnimationFrame(go);
  if (mode === "full" && window.scrollY > 2) {
    done();
  } else if (document.fonts.status === "loaded") {
    build();
  } else {
    const deadline = window.setTimeout(done, FONT_WAIT_MS);
    document.fonts.ready.then(() => {
      window.clearTimeout(deadline);
      build();
    });
  }

  return skip;
}

export function Construction() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (reduced()) {
      document.documentElement.removeAttribute("data-construct");
      return;
    }
    const boot = window.__srjConstruct;
    let mode: Mode;
    if (lastPath === null) {
      // The first page of this document. No boot means the head script
      // chose not to run (a #hash link, or no motion).
      // "done" here means the head script's failsafe already let the page
      // show. The visitor is reading it, so it is not covered again.
      if (!boot || document.documentElement.getAttribute("data-construct") === "done") {
        lastPath = pathname;
        return;
      }
      const late = performance.now() > LATE_MS;
      mode = boot.mode === "full" && !late ? "full" : "short";
      try {
        sessionStorage.setItem(STORE, "1");
      } catch {}
    } else if (lastPath === pathname && lastMode) {
      // The dev-mode Strict Mode re-run of the same page.
      mode = lastMode;
    } else {
      lastPath = pathname;
      const back = performance.now() - poppedAt < 1000;
      poppedAt = -Infinity;
      if (back || window.location.hash) return;
      mode = "short";
    }
    lastPath = pathname;
    lastMode = mode;
    return start(mode, boot);
  }, [pathname]);

  return null;
}
