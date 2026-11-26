// Geometry for the closing artwork: the word "srijit" in the display face,
// as one outline path plus its on-curve anchors and off-curve handles.
// Units are font units. Y is flipped here, so +y points down like the page.

import { FONT, GLYPHS } from "./glyphs";

export type Pt = { x: number; y: number };
export type Handle = { from: Pt; to: Pt };

// Normal width at weight 700, tracked a little tight: the proportions of the X
// header's mark.
const TRACK = -0.03 * FONT.upm;

const num = /-?\d*\.?\d+/g;

/** Moves and flips one glyph path, and collects its points. */
function place(d: string, dx: number, anchors: Pt[], handles: Handle[], offs: Pt[]): string {
  const out: string[] = [];
  let cur: Pt = { x: 0, y: 0 };
  let start: Pt = { x: 0, y: 0 };
  const pt = (x: number, y: number): Pt => ({ x: x + dx, y: -y });
  for (const seg of d.match(/[MLQCZ][^MLQCZ]*/g) ?? []) {
    const cmd = seg[0];
    const n = (seg.slice(1).match(num) ?? []).map(Number);
    if (cmd === "Z") {
      out.push("Z");
      cur = start;
      continue;
    }
    if (cmd === "M" || cmd === "L") {
      const p = pt(n[0], n[1]);
      out.push(`${cmd}${p.x} ${p.y}`);
      anchors.push(p);
      if (cmd === "M") start = p;
      cur = p;
    } else if (cmd === "Q") {
      const c = pt(n[0], n[1]);
      const p = pt(n[2], n[3]);
      out.push(`Q${c.x} ${c.y} ${p.x} ${p.y}`);
      offs.push(c);
      handles.push({ from: cur, to: c }, { from: c, to: p });
      anchors.push(p);
      cur = p;
    } else if (cmd === "C") {
      const c1 = pt(n[0], n[1]);
      const c2 = pt(n[2], n[3]);
      const p = pt(n[4], n[5]);
      out.push(`C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p.x} ${p.y}`);
      offs.push(c1, c2);
      handles.push({ from: cur, to: c1 }, { from: c2, to: p });
      anchors.push(p);
      cur = p;
    }
  }
  return out.join("");
}

export function wordGeometry(word: string) {
  const anchors: Pt[] = [];
  const offs: Pt[] = [];
  const handles: Handle[] = [];
  let x = 0;
  const parts: string[] = [];
  for (const ch of word) {
    const g = GLYPHS[ch];
    if (!g) continue;
    parts.push(place(g.d, x, anchors, handles, offs));
    x += g.adv + TRACK;
  }
  const width = x - TRACK;
  // Drop duplicate anchors where a contour closes on its start point.
  const seen = new Set<string>();
  const uniq = anchors.filter((p) => {
    const k = `${p.x},${p.y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return {
    d: parts.join(""),
    width,
    anchors: uniq,
    offs,
    handles,
    metrics: {
      dot: -FONT.dotTop,
      xHeight: -FONT.xHeight,
      baseline: 0,
      descender: -FONT.descender,
    },
  };
}
