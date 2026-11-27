// Checks the spacing of every typical-application circuit (Figure 2 on
// each part page), both the wide drawing and the phone drawing.
//
//   bun run check:circuits
//
// The build runs it first, so a crowded circuit stops the build.
//
// The rule: every label has clear paper around it. The check sets each
// label in IBM Plex Mono metrics (every glyph is 0.6 em wide) and finds:
//   - two labels closer than TEXT_GAP
//   - a label closer than WIRE_GAP to a wire, a bus or a block border
//   - block text closer than BLOCK_PAD to the walls of its block
//   - a label closer than SYM_GAP to a symbol (clock, display, terminal)
//   - a label outside the drawing
// The title and the lines of one block are one text group. The check does
// not compare them with each other.

import { PARTS } from "@/lib/parts";
import type { CircuitLabel, WideCircuit, NarrowCircuit } from "@/lib/parts/types";
import { BOX, LOOP_X, NW, SPINE, layoutNarrow } from "@/lib/circuitNarrow";

const TEXT_GAP = 10;
const WIRE_GAP = 5;
/** Block text to the side walls, and to the top and bottom walls. */
const BLOCK_PAD = { x: 14, y: 10 };
const SYM_GAP = 5;
const EDGE = 2;

type Box = { x0: number; y0: number; x1: number; y1: number };
type Txt = Box & { text: string; group?: string };

// Type sizes and tracking from app/globals.css (.ac-*).
const STYLE = {
  "ac-ref": { fs: 12.5, ls: 0 },
  "ac-title": { fs: 14, ls: 0.04 },
  "ac-line": { fs: 13, ls: 0 },
  "ac-note": { fs: 13, ls: 0 },
  "ac-text": { fs: 13, ls: 0.03 },
  "ac-pin": { fs: 12, ls: 0.04 },
} as const;
type Cls = keyof typeof STYLE;

const ADV = 0.6; // IBM Plex Mono advance, em
const ASC = 0.74; // cap and ascender top, em above the baseline
const DESC = 0.22; // descender, em below the baseline

function width(text: string, cls: Cls) {
  const { fs, ls } = STYLE[cls];
  // The browser adds the tracking after every glyph, the last one too.
  return text.length * (ADV + ls) * fs;
}

/** A text box from its anchor point and baseline. */
function setText(text: string, cls: Cls, x: number, base: number, anchor: "start" | "middle" | "end" = "start", group?: string): Txt {
  const { fs } = STYLE[cls];
  const w = width(text, cls);
  const x0 = anchor === "start" ? x : anchor === "middle" ? x - w / 2 : x - w;
  const desc = /[gjpqy,()]/.test(text) ? DESC * fs : 0.02 * fs;
  return { text, group, x0, x1: x0 + w, y0: base - ASC * fs, y1: base + desc };
}

/** The gap between two boxes. Negative when they overlap. */
function gap(a: Box, b: Box) {
  const dx = Math.max(b.x0 - a.x1, a.x0 - b.x1);
  const dy = Math.max(b.y0 - a.y1, a.y0 - b.y1);
  if (dx < 0 && dy < 0) return Math.max(dx, dy);
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
}

const seg = (ax: number, ay: number, bx: number, by: number): Box => ({
  x0: Math.min(ax, bx), x1: Math.max(ax, bx), y0: Math.min(ay, by), y1: Math.max(ay, by),
});

/** The four walls of a rectangle as segments. */
const walls = (r: Box): Box[] => [
  seg(r.x0, r.y0, r.x1, r.y0), seg(r.x1, r.y0, r.x1, r.y1),
  seg(r.x0, r.y1, r.x1, r.y1), seg(r.x0, r.y0, r.x0, r.y1),
];

const inside = (t: Box, r: Box) => t.x0 >= r.x0 && t.x1 <= r.x1 && t.y0 >= r.y0 && t.y1 <= r.y1;

type Scene = {
  w: number;
  h: number;
  texts: Txt[];
  /** Wires and bus lines, as segments. */
  wires: Box[];
  blocks: (Box & { ref: string; content: Txt[] })[];
  syms: Box[];
};

function wideScene(c: WideCircuit): Scene {
  const texts: Txt[] = [];
  const blocks: Scene["blocks"] = [];
  for (const b of c.blocks) {
    const cx = b.x + b.w / 2;
    const content: Txt[] = [];
    const titleBase = b.lines.length ? b.y + (b.ty ?? 34) : b.y + b.h / 2 + 0.35 * STYLE["ac-title"].fs;
    content.push(setText(b.title, "ac-title", cx, titleBase, "middle", b.ref));
    b.lines.forEach((l, i) => content.push(setText(l, "ac-line", cx, titleBase + 20 + i * 15, "middle", b.ref)));
    texts.push(setText(b.ref, "ac-ref", b.x, b.y - 8), ...content);
    blocks.push({ ref: b.ref, x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h, content });
  }
  for (const l of c.labels as CircuitLabel[]) {
    const cls = l.cls ?? "ac-text";
    texts.push(setText(l.text, cls, l.x, l.y + 0.35 * STYLE[cls].fs, l.anchor));
  }
  const wires: Box[] = [];
  for (const w of c.wires) {
    const offs = w.bus ? [-4, 4] : [0];
    for (const o of offs)
      for (let i = 1; i < w.pts.length; i++)
        wires.push(seg(w.pts[i - 1][0], w.pts[i - 1][1] + o, w.pts[i][0], w.pts[i][1] + o));
  }
  const syms: Box[] = c.syms.flatMap((s) => {
    if (s.kind === "clock") return [{ x0: s.cx - 12, x1: s.cx + 12, y0: s.cy - 12, y1: s.cy + 12 }];
    if (s.kind === "term") return [{ x0: s.cx - 3.5, x1: s.cx + 3.5, y0: s.cy - 3.5, y1: s.cy + 3.5 }];
    if (s.kind === "display") return [{ x0: s.x, x1: s.x + 28, y0: s.y, y1: s.y + 34 }];
    return [];
  });
  return { w: c.w, h: c.h, texts, wires, blocks, syms };
}

function narrowScene(c: NarrowCircuit): Scene {
  const { items, loop, h } = layoutNarrow(c);
  const texts: Txt[] = [];
  const wires: Box[] = [];
  const blocks: Scene["blocks"] = [];
  const syms: Box[] = [];
  const cx = BOX.x + BOX.w / 2;
  for (const it of items) {
    if (it.t === "wire") {
      wires.push(seg(SPINE, it.y0, SPINE, it.y1));
      if (it.label) texts.push(setText(it.label, "ac-text", SPINE + 14, (it.y0 + it.y1) / 2 + 0.35 * 13));
    } else if (it.t === "term") {
      syms.push({ x0: SPINE - 3.5, x1: SPINE + 3.5, y0: it.y - 3.5, y1: it.y + 3.5 });
      // The ref and the label sit on one line, 10 units apart.
      const ref = setText(it.ref, "ac-ref", SPINE + 14, it.y + 0.35 * 13);
      const lab = setText(it.label, "ac-text", ref.x1 + 10, it.y + 0.35 * 13);
      texts.push({ ...lab, x0: ref.x0, text: `${it.ref} ${it.label}`, y0: Math.min(ref.y0, lab.y0) });
    } else {
      const content: Txt[] = [setText(it.title, "ac-title", cx, it.y + 27, "middle", it.ref)];
      it.lines.forEach((l, j) => content.push(setText(l, "ac-line", cx, it.y + 48 + j * 17, "middle", it.ref)));
      texts.push(setText(it.ref, "ac-ref", BOX.x + BOX.w - 8, it.y + 16, "end"), ...content);
      blocks.push({ ref: it.ref, x0: BOX.x, y0: it.y, x1: BOX.x + BOX.w, y1: it.y + it.h, content });
    }
  }
  if (loop) {
    for (let i = 1; i < loop.path.length; i++)
      wires.push(seg(loop.path[i - 1][0], loop.path[i - 1][1], loop.path[i][0], loop.path[i][1]));
    // The loop label runs up the page, turned -90 degrees.
    const mid = (loop.path[1][1] + loop.path[2][1]) / 2;
    const w = width(loop.label, "ac-pin");
    const fs = STYLE["ac-pin"].fs;
    texts.push({ text: loop.label, x0: LOOP_X + 10 - 0.35 * fs - 0.02 * fs, x1: LOOP_X + 10 + (ASC - 0.35) * fs, y0: mid - w / 2, y1: mid + w / 2 });
  }
  return { w: NW, h, texts, wires, blocks, syms };
}

function check(scene: Scene): string[] {
  const out: string[] = [];
  const r = (n: number) => n.toFixed(1);
  const { texts } = scene;
  for (let i = 0; i < texts.length; i++) {
    const a = texts[i];
    if (a.x0 < -EDGE || a.y0 < -EDGE || a.x1 > scene.w + EDGE || a.y1 > scene.h + EDGE)
      out.push(`"${a.text}" runs outside the ${scene.w}×${scene.h} drawing`);
    for (let j = i + 1; j < texts.length; j++) {
      const b = texts[j];
      if (a.group && a.group === b.group) continue;
      const g = gap(a, b);
      if (g < TEXT_GAP) out.push(`"${a.text}" and "${b.text}" are ${r(g)} apart (min ${TEXT_GAP})`);
    }
    for (const w of scene.wires) {
      const g = gap(a, w);
      if (g < WIRE_GAP) out.push(`"${a.text}" is ${r(g)} from a wire (min ${WIRE_GAP})`);
    }
    for (const b of scene.blocks)
      for (const wall of walls(b)) {
        const g = gap(a, wall);
        if (g < WIRE_GAP) out.push(`"${a.text}" is ${r(g)} from the border of ${b.ref} (min ${WIRE_GAP})`);
      }
    for (const s of scene.syms) {
      const g = gap(a, s);
      if (g < SYM_GAP) out.push(`"${a.text}" is ${r(g)} from a symbol (min ${SYM_GAP})`);
    }
  }
  for (const b of scene.blocks)
    for (const t of b.content) {
      const px = Math.min(t.x0 - b.x0, b.x1 - t.x1);
      const py = Math.min(t.y0 - b.y0, b.y1 - t.y1);
      if (!inside(t, b) || px < BLOCK_PAD.x) out.push(`"${t.text}" has ${r(px)} of side padding in ${b.ref} (min ${BLOCK_PAD.x})`);
      if (!inside(t, b) || py < BLOCK_PAD.y) out.push(`"${t.text}" has ${r(py)} of top or bottom padding in ${b.ref} (min ${BLOCK_PAD.y})`);
    }
  return [...new Set(out)];
}

let failed = 0;
for (const p of PARTS) {
  for (const [kind, scene] of [["wide", wideScene(p.circuit.wide)], ["phone", narrowScene(p.circuit.narrow)]] as const) {
    const errs = check(scene);
    if (!errs.length) continue;
    failed += errs.length;
    console.error(`\n${p.part} ${p.name}, ${kind} circuit:`);
    for (const e of errs) console.error(`  ${e}`);
  }
}
if (failed) {
  console.error(`\ncheck-circuits: ${failed} spacing problems. See the rule at the top of scripts/check-circuits.ts.`);
  process.exit(1);
}
console.log(`check-circuits: ${PARTS.length * 2} circuits have clear spacing.`);
