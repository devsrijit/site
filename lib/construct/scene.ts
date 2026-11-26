// Reads the construction scene from the live page. Every value here is
// measured from the DOM after layout: guides sit on real edges, glyphs sit on
// the real pen positions, and the labels print the real numbers.
//
// Marks on the page:
//   data-construct-frame   the page frame. Its padding gives the gutter guides.
//   data-construct="type"  display type. Its glyphs are drawn as outlines.
//   data-construct         a block. It is drawn as a wireframe that snaps in.
//   data-construct="group" no wireframe. It only gives up its own entrance.
//   data-construct-col     a column. Its left edge gives a column guide.

import { FONT, GLYPHS } from "./glyphs";

export type Rect = { x: number; y: number; w: number; h: number };

export type Guide = {
  axis: "x" | "y";
  /** Position on the other axis, in viewport px. */
  at: number;
  label: string;
  /** Lower for guides that draw first. */
  order: number;
};

export type Glyph = {
  /** Outline in viewport px, y down. */
  d: string;
  /** On-curve points. */
  on: [number, number][];
  /** Off-curve points. */
  off: [number, number][];
  /** Handle lines, as pairs of points. */
  handles: [number, number, number, number][];
  x: number;
};

export type TypeLine = { baseline: number; cap: number; size: number; glyphs: Glyph[]; left: number; right: number };

export type Block = {
  rect: Rect;
  /** Text line boxes, relative to the block. */
  bars: Rect[];
  /** Drawings (SVG and images): a placeholder box with a cross. */
  boxes: Rect[];
  /** Real borders, relative to the block. */
  rules: Rect[];
  /** How the block snaps: the guide it lands on and the measured gap. */
  snap: { axis: "x" | "y"; guide: number | null; from: number; to: number; at: number; value: number };
};

export type Scene = {
  w: number;
  h: number;
  guides: Guide[];
  lines: TypeLine[];
  blocks: Block[];
};

const px = (v: string) => parseFloat(v) || 0;
const round = (n: number) => Math.round(n);

function visible(r: DOMRect, w: number, h: number) {
  return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < h && r.right > 0 && r.left < w;
}

/** The closest marked ancestor (or self) that owns this node's wireframe. */
function owner(el: Element | null): Element | null {
  return el?.closest("[data-construct]") ?? null;
}

// ---------- glyph outlines ----------

const TOKEN = /[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/g;

/** Maps one glyph from font units (y up) to viewport px at a pen position. */
function placeGlyph(ch: string, ox: number, baseline: number, s: number): Glyph | null {
  const g = GLYPHS[ch];
  if (!g) return null;
  const t = g.d.match(TOKEN) ?? [];
  const X = (v: string) => ox + parseFloat(v) * s;
  const Y = (v: string) => baseline - parseFloat(v) * s;
  const on: [number, number][] = [];
  const off: [number, number][] = [];
  const handles: [number, number, number, number][] = [];
  const out: string[] = [];
  let cur: [number, number] = [ox, baseline];
  const f = (n: number) => n.toFixed(2);
  for (let i = 0; i < t.length; ) {
    const c = t[i++];
    if (c === "M" || c === "L") {
      const p: [number, number] = [X(t[i++]), Y(t[i++])];
      out.push(`${c}${f(p[0])} ${f(p[1])}`);
      on.push(p);
      cur = p;
    } else if (c === "Q") {
      const q: [number, number] = [X(t[i++]), Y(t[i++])];
      const p: [number, number] = [X(t[i++]), Y(t[i++])];
      out.push(`Q${f(q[0])} ${f(q[1])} ${f(p[0])} ${f(p[1])}`);
      off.push(q);
      on.push(p);
      handles.push([cur[0], cur[1], q[0], q[1]], [q[0], q[1], p[0], p[1]]);
      cur = p;
    } else if (c === "C") {
      const a: [number, number] = [X(t[i++]), Y(t[i++])];
      const b: [number, number] = [X(t[i++]), Y(t[i++])];
      const p: [number, number] = [X(t[i++]), Y(t[i++])];
      out.push(`C${f(a[0])} ${f(a[1])} ${f(b[0])} ${f(b[1])} ${f(p[0])} ${f(p[1])}`);
      off.push(a, b);
      on.push(p);
      handles.push([cur[0], cur[1], a[0], a[1]], [b[0], b[1], p[0], p[1]]);
      cur = p;
    } else if (c === "Z") {
      out.push("Z");
    }
  }
  return { d: out.join(""), on, off, handles, x: ox };
}

/** The baseline of the first line of a text node, from a zero-size probe. */
function probeBaseline(node: Text): number {
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0;border:0";
  node.parentNode!.insertBefore(probe, node);
  const y = probe.getBoundingClientRect().bottom;
  probe.remove();
  // Blink paints the text baseline on a whole CSS pixel. Measured: layout
  // baselines 218.5, 111.58 and 263.77 paint at 219, 112 and 264.
  return Math.round(y);
}

function readType(el: Element, w: number, h: number): TypeLine[] {
  const lines: TypeLine[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    const parent = n.parentElement;
    if (!parent || !n.data.trim()) continue;
    const pr = parent.getBoundingClientRect();
    if (!visible(pr, w, h)) continue;
    const cs = getComputedStyle(parent);
    // The outlines are the wght 800 instance only.
    if (cs.fontWeight !== "800") continue;
    const size = px(cs.fontSize);
    const s = size / FONT.upm;
    const upper = cs.textTransform === "uppercase";
    const first = probeBaseline(n);
    let top0: number | null = null;
    let line: TypeLine | null = null;
    for (let i = 0; i < n.data.length; i++) {
      const raw = n.data[i];
      if (!raw.trim()) continue;
      range.setStart(n, i);
      range.setEnd(n, i + 1);
      const r = range.getClientRects()[0];
      if (!r) continue;
      if (top0 === null) top0 = r.top;
      const baseline = Math.round(first + (r.top - top0));
      if (!line || Math.abs(line.baseline - baseline) > 1) {
        line = { baseline, cap: baseline - FONT.capHeight * s, size, glyphs: [], left: r.left, right: r.right };
        lines.push(line);
      }
      const g = placeGlyph(upper ? raw.toUpperCase() : raw, r.left, baseline, s);
      if (g) line.glyphs.push(g);
      line.right = r.right;
    }
  }
  return lines;
}

// ---------- blocks ----------

function readBlock(el: Element): Omit<Block, "snap"> {
  const r = el.getBoundingClientRect();
  const rect = { x: r.left, y: r.top, w: r.width, h: r.height };
  const bars: Rect[] = [];
  const rules: Rect[] = [];
  const boxes: Rect[] = [];
  const range = document.createRange();

  // Drawings become placeholder boxes, not text bars.
  for (const d of el.querySelectorAll("svg, img")) {
    if (d.parentElement?.closest("svg") || owner(d) !== el) continue;
    const b = d.getBoundingClientRect();
    if (b.width < 8 || b.height < 8) continue;
    boxes.push({ x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height });
  }

  // Text line boxes become bars.
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode() as Text | null; n && bars.length < 120; n = walker.nextNode() as Text | null) {
    if (!n.data.trim() || owner(n.parentElement) !== el || n.parentElement?.closest("svg")) continue;
    range.selectNodeContents(n);
    for (const b of range.getClientRects()) {
      if (b.width < 2 || b.height < 2) continue;
      // Clip each bar to the block, so hidden overflow stays hidden.
      const x0 = Math.max(b.left, r.left);
      const x1 = Math.min(b.right, r.right);
      const y0 = Math.max(b.top, r.top);
      const y1 = Math.min(b.bottom, r.bottom);
      if (x1 - x0 < 2 || y1 - y0 < 2) continue;
      bars.push({ x: x0 - r.left, y: y0 - r.top, w: x1 - x0, h: y1 - y0 });
    }
  }

  // Real borders become rules, at their real thickness.
  const els = [el, ...el.querySelectorAll("*")];
  for (const e of els) {
    if (e instanceof SVGElement || owner(e) !== el) continue;
    const cs = getComputedStyle(e);
    if (cs.display === "none") continue;
    const b = e.getBoundingClientRect();
    if (b.width < 1 && b.height < 1) continue;
    const side = (wd: string, st: string) => (st !== "none" && st !== "hidden" ? px(wd) : 0);
    const t = side(cs.borderTopWidth, cs.borderTopStyle);
    const bt = side(cs.borderBottomWidth, cs.borderBottomStyle);
    const l = side(cs.borderLeftWidth, cs.borderLeftStyle);
    const rr = side(cs.borderRightWidth, cs.borderRightStyle);
    const ox = b.left - r.left;
    const oy = b.top - r.top;
    if (t) rules.push({ x: ox, y: oy, w: b.width, h: t });
    if (bt) rules.push({ x: ox, y: oy + b.height - bt, w: b.width, h: bt });
    if (l) rules.push({ x: ox, y: oy, w: l, h: b.height });
    if (rr) rules.push({ x: ox + b.width - rr, y: oy, w: rr, h: b.height });
  }
  return { rect, bars, rules, boxes };
}

// ---------- the scene ----------

export function hasMarksInView(): boolean {
  const h = window.innerHeight;
  const w = document.documentElement.clientWidth;
  for (const el of document.querySelectorAll('[data-construct="type"], [data-construct=""], [data-construct="block"]')) {
    if (visible(el.getBoundingClientRect(), w, h)) return true;
  }
  return false;
}

export function readScene(): Scene {
  const w = document.documentElement.clientWidth;
  const h = window.innerHeight;
  const guides: Guide[] = [];
  const addGuide = (g: Guide) => {
    if (g.at < -1 || g.at > (g.axis === "x" ? w : h) + 1) return;
    if (guides.some((o) => o.axis === g.axis && Math.abs(o.at - g.at) < 1.5)) return;
    guides.push(g);
  };

  // Gutters, from the frame's padding.
  for (const f of document.querySelectorAll("[data-construct-frame]")) {
    const r = f.getBoundingClientRect();
    if (!visible(r, w, h)) continue;
    const cs = getComputedStyle(f);
    const pl = px(cs.paddingLeft);
    const pr = px(cs.paddingRight);
    addGuide({ axis: "x", at: r.left + pl, label: `gutter ${round(pl)}`, order: 0 });
    addGuide({ axis: "x", at: r.right - pr, label: `gutter ${round(pr)}`, order: 0 });
    break;
  }

  // Display type: cap height and baseline of each line.
  const lines: TypeLine[] = [];
  for (const el of document.querySelectorAll('[data-construct="type"]')) {
    lines.push(...readType(el, w, h));
  }
  // A name on two lines labels the outer guides only, so no label sits on a glyph.
  lines.forEach((l, i) => {
    const cap = l.baseline - l.cap;
    addGuide({ axis: "y", at: l.cap, label: i === 0 ? `cap height ${round(cap)}` : "", order: 1 + i });
    addGuide({
      axis: "y",
      at: l.baseline,
      label: i === lines.length - 1 ? `baseline ${round(l.baseline)}` : "",
      order: 1 + i,
    });
  });

  // Columns.
  for (const el of document.querySelectorAll("[data-construct-col]")) {
    const r = el.getBoundingClientRect();
    if (!visible(r, w, h)) continue;
    addGuide({ axis: "x", at: r.left, label: `col ${round(r.width)}`, order: 2 });
  }

  // Blocks, top to bottom.
  const raw = [...document.querySelectorAll('[data-construct=""], [data-construct="block"]')]
    .filter((el) => visible(el.getBoundingClientRect(), w, h))
    .map(readBlock)
    .sort((a, b) => a.rect.y - b.rect.y || a.rect.x - b.rect.x);

  // Heavy rules (3 px and up) become horizontal guides.
  for (const b of raw) {
    for (const r of b.rules) {
      if (r.h >= 3 && r.w > w * 0.5) {
        addGuide({ axis: "y", at: b.rect.y + r.y, label: `rule ${round(r.h)}`, order: 3 });
      }
    }
  }

  // Each block snaps to one guide. The pill prints the real gap it closes:
  // across to the edge or column on its left, or up to the edge above it.
  const lineBoxes: Rect[] = lines.map((l) => ({ x: l.left, y: l.cap, w: l.right - l.left, h: l.baseline - l.cap }));
  const blocks: Block[] = raw.map((b, i) => {
    const r = b.rect;
    const vx = guides.filter((g) => g.axis === "x");
    const onGuide = vx.findIndex((g) => Math.abs(g.at - r.x) < 1.5);
    // Left reference: the nearest right edge of another box in this row.
    let left = 0;
    for (const o of [...raw.map((x) => x.rect), ...lineBoxes]) {
      const overlapY = o.y < r.y + r.h && o.y + o.h > r.y;
      if (o !== r && overlapY && o.x + o.w <= r.x + 0.5) left = Math.max(left, o.x + o.w);
    }
    // Top reference: the nearest bottom edge above, across this column.
    let top = -1;
    for (const o of [...raw.map((x) => x.rect), ...lineBoxes]) {
      const overlapX = o.x < r.x + r.w && o.x + o.w > r.x;
      if (o !== r && overlapX && o.y + o.h <= r.y + 0.5) top = Math.max(top, o.y + o.h);
    }
    const gapY = top >= 0 ? r.y - top : -1;
    const useY = i % 2 === 1 && gapY >= 6;
    if (useY) {
      return {
        ...b,
        snap: { axis: "y", guide: null, from: top, to: r.y, at: r.x + Math.min(48, r.w / 3), value: round(gapY) },
      };
    }
    return {
      ...b,
      snap: {
        axis: "x",
        guide: onGuide >= 0 ? guides.indexOf(vx[onGuide]) : null,
        from: left,
        to: r.x,
        at: r.y + Math.min(r.h / 2, 28),
        value: round(r.x - left),
      },
    };
  });

  return { w, h, guides, lines, blocks };
}
