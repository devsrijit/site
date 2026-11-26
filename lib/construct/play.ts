// Builds the construction layer from a measured scene and runs it.
//
// The layer is a different visual language from the page: a near-black
// canvas, white vector outlines, grey dashed guides, small grey labels. It
// sits over the finished page. Blocks are drawn as wireframes a few px out of
// place and snap onto their guides. Then the dark layer fades away: behind it
// the paper page is already final, so the fade is the switch from "outline"
// to "rendered".
//
// Only the layer moves. The page itself is never offset or hidden, so the
// end state is the page as the server sent it.

import type { Block, Glyph, Guide, Scene } from "./scene";
import { spring } from "./spring";

export type Mode = "full" | "short";
export type Axis = "x" | "y";

export type PlayOptions = {
  mode: Mode;
  axis: Axis;
  /** Test only: freeze every animation at this time, in ms. */
  hold?: number;
  onSweep: () => void;
  onDone: () => void;
};

type Timing = {
  guide: number;
  guideStagger: number;
  guideDur: number;
  blockIn: number;
  blockInStagger: number;
  snap: number;
  snapStagger: number;
  glyph: number;
  glyphStagger: number;
  glyphDur: number;
  sweep: number;
  sweepDur: number;
  out: number;
};

// Every load of a document: about 3.4 s from the first frame of the layer.
// The outlines draw first and hold long enough to read their anchors.
const FULL: Timing = {
  guide: 0,
  guideStagger: 60,
  guideDur: 600,
  blockIn: 200,
  blockInStagger: 40,
  snap: 1500,
  snapStagger: 60,
  glyph: 180,
  glyphStagger: 70,
  glyphDur: 900,
  sweep: 2600,
  sweepDur: 760,
  out: 0,
};

// Later pages in the session: guides and snaps only, about 0.5 s.
const SHORT: Timing = {
  guide: 0,
  guideStagger: 0,
  guideDur: 160,
  blockIn: 0,
  blockInStagger: 0,
  snap: 30,
  snapStagger: 18,
  glyph: 0,
  glyphStagger: 0,
  glyphDur: 0,
  sweep: 190,
  sweepDur: 320,
  out: 0,
};

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EASE_FADE = "cubic-bezier(0.4, 0, 0.2, 1)";
const SVG = "http://www.w3.org/2000/svg";

function div(cls: string, style: Partial<CSSStyleDeclaration> = {}, text?: string) {
  const el = document.createElement("div");
  el.className = cls;
  Object.assign(el.style, style);
  if (text) el.textContent = text;
  return el;
}

function svgEl(tag: string, attrs: Record<string, string>) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

const f = (n: number) => n.toFixed(2);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Fixed start offsets, so every visit builds the same way. */
const MAG = [9, 12, 7, 11, 8, 10, 6, 13];

function offsetFor(b: Block, i: number, scale: number): { dx: number; dy: number; sx: number } {
  const m = MAG[i % MAG.length] * scale;
  const sign = i % 2 ? 1 : -1;
  const sign2 = i % 3 ? 1 : -1;
  if (b.snap.axis === "x") {
    // Short blocks are labels: they also start a little mis-tracked.
    return { dx: sign * m, dy: sign2 * Math.round(m * 0.25), sx: b.rect.h < 48 ? 1.018 : 1 };
  }
  return { dx: sign2 * Math.round(m * 0.25), dy: sign * m, sx: 1 };
}

function glyphMarks(g: Glyph, size: number) {
  const sq = clamp(size * 0.03, 5, 9);
  const r = sq * 0.5;
  const half = sq / 2;
  const squares = g.on.map(([x, y]) => `M${f(x - half)} ${f(y - half)}h${f(sq)}v${f(sq)}h${f(-sq)}Z`).join("");
  const circles = g.off
    .map(([x, y]) => `M${f(x - r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`)
    .join("");
  const handles = g.handles.map(([a, b, c, d]) => `M${f(a)} ${f(b)}L${f(c)} ${f(d)}`).join("");
  return { squares, circles, handles };
}

export function play(scene: Scene, opts: PlayOptions): { finish: () => void } {
  const T = opts.mode === "full" ? FULL : SHORT;
  const { w, h } = scene;
  const phone = w < 761;
  const anims: Animation[] = [];
  const timers: number[] = [];
  let finished = false;

  const run = (el: Element, frames: Keyframe[], delay: number, duration: number, easing = EASE_OUT) => {
    const a = el.animate(frames, { delay, duration: Math.max(1, duration), easing, fill: "both" });
    anims.push(a);
    return a;
  };

  const root = div("cx");
  root.setAttribute("aria-hidden", "true");
  root.dataset.axis = opts.axis;
  root.dataset.mode = opts.mode;
  // The sweep: one mover carries the split line and a clipping window.
  // The dark layer inside the window moves back by the same amount, so it
  // stays still on screen while the window edge (and the line on it) passes.
  // Both are transforms in one frame, so the line and the edge never part.
  const split = div("cx-split");
  const win = div("cx-win", { width: `${w}px`, height: `${h}px` });
  const dark = div("cx-dark");
  win.append(dark);
  split.append(win);
  root.append(split);

  // ---------- guides ----------

  const guides = [...scene.guides].sort((a, b) => a.order - b.order);
  const guideEls = new Map<Guide, HTMLElement>();
  const gutterRight = scene.guides.find((g) => g.axis === "x" && g.label.startsWith("gutter") && g.at > w / 2)?.at ?? w - 16;
  const gutterLeft = scene.guides.find((g) => g.axis === "x" && g.label.startsWith("gutter") && g.at < w / 2)?.at ?? 16;

  guides.forEach((g, i) => {
    const el =
      g.axis === "x"
        ? div("cx-guide cx-guide--x", { left: `${f(g.at - 0.5)}px` })
        : div("cx-guide cx-guide--y", { top: `${f(g.at - 0.5)}px` });
    const hi = div("cx-guide-hi");
    el.append(hi);
    dark.append(el);
    guideEls.set(g, hi);
    const delay = T.guide + i * T.guideStagger;
    run(
      el,
      g.axis === "x"
        ? [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }]
        : [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
      delay,
      T.guideDur,
    );

    // Labels: vertical guides read up the gutter; horizontal guides sit at
    // the page edge, cap height on the left above, baseline on the right below.
    if (!g.label) return;
    let label: HTMLElement;
    if (g.axis === "x") {
      const inLeftHalf = g.at < w / 2;
      const isRightGutter = g.label.startsWith("gutter") && !inLeftHalf;
      label = div("cx-label cx-label--v", {
        top: `${f(h * 0.62)}px`,
        left: isRightGutter ? `${f(g.at + 4)}px` : `${f(g.at - 15)}px`,
      }, g.label);
    } else {
      const below = g.label.startsWith("baseline") || g.label.startsWith("rule");
      const left = g.label.startsWith("cap");
      label = div("cx-label", {
        top: `${f(below ? g.at + 5 : g.at - 15)}px`,
        ...(left ? { left: `${f(gutterLeft)}px` } : { right: `${f(w - gutterRight)}px` }),
      }, g.label);
    }
    dark.append(label);
    run(label, [{ opacity: 0 }, { opacity: 1 }], delay + T.guideDur * 0.4, 200);
  });

  // ---------- display type as vector outlines ----------

  const svg = svgEl("svg", { class: "cx-type", width: String(w), height: String(h), viewBox: `0 0 ${w} ${h}` });
  dark.append(svg);
  let gi = 0;
  for (const line of scene.lines) {
    for (const g of line.glyphs) {
      const grp = svgEl("g", {});
      const fill = svgEl("path", { class: "cx-gfill", d: g.d });
      const stroke = svgEl("path", { class: "cx-gline", d: g.d, pathLength: "1" });
      grp.append(fill, stroke);
      svg.append(grp);
      if (opts.mode === "full") {
        const delay = T.glyph + gi * T.glyphStagger;
        run(stroke, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], delay, T.glyphDur);
        run(fill, [{ opacity: 0 }, { opacity: 1 }], delay + T.glyphDur * 0.6, 240);
        const m = glyphMarks(g, line.size);
        const marks = svgEl("g", { class: "cx-marks" });
        marks.append(
          svgEl("path", { class: "cx-handles", d: m.handles }),
          svgEl("path", { class: "cx-off", d: m.circles }),
          svgEl("path", { class: "cx-on", d: m.squares }),
        );
        svg.append(marks);
        run(marks, [{ opacity: 0 }, { opacity: 1 }], delay + T.glyphDur * 0.35, 220);
      } else {
        stroke.style.strokeDashoffset = "0";
      }
      gi++;
    }
  }

  // ---------- blocks: wireframes that snap onto their guides ----------

  const { easing: springEase, duration: springDur } =
    opts.mode === "full" ? spring(380, 24) : spring(700, 40);
  const scale = phone ? 0.6 : 1;

  scene.blocks.forEach((b, i) => {
    const r = b.rect;
    const el = div("cx-block", { left: `${f(r.x)}px`, top: `${f(r.y)}px`, width: `${f(r.w)}px`, height: `${f(r.h)}px` });
    for (const bar of b.bars) {
      el.append(div("cx-bar", { left: `${f(bar.x)}px`, top: `${f(bar.y)}px`, width: `${f(bar.w)}px`, height: `${f(bar.h)}px` }));
    }
    for (const bx of b.boxes) {
      const box = div("cx-box", { left: `${f(bx.x)}px`, top: `${f(bx.y)}px`, width: `${f(bx.w)}px`, height: `${f(bx.h)}px` });
      box.innerHTML = `<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 ${f(bx.w)} ${f(bx.h)}" aria-hidden="true"><path d="M0 0L${f(bx.w)} ${f(bx.h)}M${f(bx.w)} 0L0 ${f(bx.h)}"/></svg>`;
      el.append(box);
    }
    const rules: HTMLElement[] = [];
    for (const ru of b.rules) {
      const re = div("cx-rule", { left: `${f(ru.x)}px`, top: `${f(ru.y)}px`, width: `${f(ru.w)}px`, height: `${f(ru.h)}px` });
      // Only long horizontal rules start short.
      if (ru.w > ru.h * 4) rules.push(re);
      el.append(re);
    }
    const hi = div("cx-block-hi");
    el.append(hi);
    dark.append(el);

    const { dx, dy, sx } = offsetFor(b, i, scale);
    const inAt = T.blockIn + i * T.blockInStagger;
    const snapAt = T.snap + i * T.snapStagger;
    if (opts.mode === "full") run(el, [{ opacity: 0 }, { opacity: 1 }], inAt, 220);
    run(
      el,
      [{ transform: `translate(${dx}px, ${dy}px) scaleX(${sx})` }, { transform: "none" }],
      snapAt,
      springDur,
      springEase,
    );
    // A rule starts a little short and snaps to its full length.
    for (const re of rules) {
      run(re, [{ transform: "scaleX(0.94)" }, { transform: "none" }], snapAt, springDur, springEase);
    }

    // The snap: the guide it lands on lights, the box lights, and a pill
    // prints the real gap.
    const hit = snapAt + springDur * 0.2;
    run(hi, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], hit, 520, "ease-out");
    const g = b.snap.guide !== null ? scene.guides[b.snap.guide] : null;
    const gEl = g ? guideEls.get(g) : null;
    if (gEl) run(gEl, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], hit, 560, "ease-out");

    if (opts.mode === "full" && b.snap.value > 0) {
      const s = b.snap;
      const meas = div(`cx-measure cx-measure--${s.axis}`);
      const len = s.to - s.from;
      if (s.axis === "x") {
        Object.assign(meas.style, { left: `${f(s.from)}px`, top: `${f(s.at)}px`, width: `${f(len)}px` });
      } else {
        Object.assign(meas.style, { left: `${f(s.at)}px`, top: `${f(s.from)}px`, height: `${f(len)}px` });
      }
      const pill = div("cx-pill", {}, String(s.value));
      // Pills stay inside the viewport: a short gap puts the pill beside it.
      const pw = 8 + String(s.value).length * 7;
      if (s.axis === "x") {
        const cx = clamp(s.from + len / 2 - pw / 2, 4, w - pw - 4);
        const above = s.at - (len < pw + 6 ? 22 : 8);
        Object.assign(pill.style, { left: `${f(cx)}px`, top: `${f(above < 3 ? s.at + 6 : above)}px` });
      } else {
        Object.assign(pill.style, { left: `${f(clamp(s.at + 6, 4, w - pw - 4))}px`, top: `${f(s.from + len / 2 - 8)}px` });
      }
      dark.append(meas, pill);
      for (const el2 of [meas, pill]) {
        run(el2, [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], hit - 40, 620, "linear");
      }
    }
  });

  // ---------- the switch: the dark layer fades to the paper page ----------

  run(split, [{ opacity: 1 }, { opacity: 0 }], T.sweep, T.sweepDur, EASE_FADE);

  document.body.append(root);

  function finish() {
    if (finished) return;
    finished = true;
    for (const t of timers) window.clearTimeout(t);
    for (const a of anims) a.cancel();
    root.remove();
    opts.onDone();
  }

  if (opts.hold !== undefined) {
    for (const a of anims) {
      a.pause();
      a.currentTime = opts.hold;
    }
    return { finish };
  }

  timers.push(window.setTimeout(opts.onSweep, T.sweep));
  const end = T.sweep + T.sweepDur;
  timers.push(window.setTimeout(finish, end + T.out));
  return { finish };
}
