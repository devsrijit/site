import type { Pt } from "@/lib/schematic";
import type { NarrowCircuit } from "@/lib/parts/types";

// The phone drawing of a part's typical application, laid out from a
// vertical signal chain. components/AppCircuit.tsx draws it, and
// scripts/check-circuits.ts checks its spacing.

export const NW = 288; // fits a 320 px phone at 1:1
export const SPINE = 30; // x of the signal spine
export const BOX = { x: 6, w: 252 }; // blocks; the loop runs to the right of them
export const LOOP_X = 270;
const WIRE = 46; // length of a labelled wire
const STUB = 22; // length of an unlabelled wire between two parts
const STEP = 110; // draw-on delay between steps, ms

export type Item =
  | { t: "wire"; y0: number; y1: number; label?: string; d: number }
  | { t: "block"; y: number; h: number; ref: string; title: string; lines: string[]; d: number }
  | { t: "term"; y: number; ref: string; label: string; d: number };

export function layoutNarrow(c: NarrowCircuit) {
  const items: Item[] = [];
  let y = 26;
  let d = 0;
  let prev: "in" | "wire" | "block" | "out" | null = null;
  const blocks: { top: number; mid: number; bottom: number }[] = [];

  for (const s of c.steps) {
    // Two parts in a row get a short plain wire between them.
    if ((s.kind === "block" || s.kind === "out") && prev && prev !== "wire") {
      items.push({ t: "wire", y0: y, y1: y + STUB, d });
      y += STUB;
    }
    if (s.kind === "in" || s.kind === "out") {
      items.push({ t: "term", y, ref: s.ref, label: s.label, d });
    } else if (s.kind === "wire") {
      items.push({ t: "wire", y0: y, y1: y + WIRE, label: s.label, d });
      y += WIRE;
    } else {
      const h = 44 + s.lines.length * 17;
      items.push({ t: "block", y, h, ref: s.ref, title: s.title, lines: s.lines, d });
      blocks.push({ top: y, mid: y + h / 2, bottom: y + h });
      y += h;
    }
    prev = s.kind;
    d += STEP;
  }

  let loop: { path: Pt[]; label: string; d: number } | null = null;
  if (c.loop && blocks.length > 1) {
    const first = blocks[0];
    const last = blocks[blocks.length - 1];
    loop = {
      // The loop leaves near the bottom of the last block and returns near
      // the top of the first, so its label has the full height to run in.
      path: [
        [BOX.x + BOX.w, last.bottom - 14],
        [LOOP_X, last.bottom - 14],
        [LOOP_X, first.top + 14],
        [BOX.x + BOX.w, first.top + 14],
      ],
      label: c.loop,
      d,
    };
  }
  return { items, loop, h: y + 14 };
}

