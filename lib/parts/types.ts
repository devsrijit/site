// The shape of one part in the catalogue. Each part has its own file in
// this folder. Every number in a part file comes from that project's
// public README, or from Srijit where the README is silent (a license).

import type { Pt } from "@/lib/schematic";

export type PinIO = "I" | "O" | "I/O";

/** One pin of the part: a module or a main piece of the system. */
export type PartPin = {
  n: number;
  name: string;
  io: PinIO;
  desc: string;
  /** The file, folder or command that holds it, when the README names one. */
  file?: string;
};

export type CharRow = {
  /** Symbol subscript. Printed as t<sub>sym</sub>, or with symPrefix. */
  sym?: string;
  symPrefix?: string;
  param: string;
  cond: string;
  min?: string;
  typ?: string;
  max?: string;
  unit: string;
  /** Footnote number from the part's footnotes. */
  note?: number;
  /** The value is words, not a number. It may wrap. */
  text?: boolean;
};

export type CharGroup = { group: string; rows: CharRow[] };

/** Footnote text. Words in backticks print as code. */
export type Footnote = { n?: number; text: string };

export type OrderRow = {
  k: string;
  v: string;
  href?: string;
  strong?: boolean;
};

// ---------- application circuit, wide (desktop) ----------

export type CircuitBlock = {
  ref: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  lines: string[];
  /** Title baseline below the block top. Default 34. A block with a pin
   *  label along its top wall sets it lower, so the two do not touch. */
  ty?: number;
  d: number;
};

export type CircuitWire = { pts: Pt[]; d: number; bus?: boolean };

export type CircuitLabel = {
  x: number;
  y: number;
  text: string;
  anchor?: "start" | "middle" | "end";
  cls?: "ac-ref" | "ac-pin" | "ac-note" | "ac-text";
  d: number;
};

/** Extra symbols: a clock, a display, a terminal or a free path. */
export type CircuitSym =
  | { kind: "clock"; cx: number; cy: number; d: number }
  | { kind: "display"; x: number; y: number; d: number }
  | { kind: "term"; cx: number; cy: number; d: number }
  | { kind: "path"; path: string; d: number };

export type WideCircuit = {
  w: number;
  h: number;
  blocks: CircuitBlock[];
  wires: CircuitWire[];
  labels: CircuitLabel[];
  syms: CircuitSym[];
};

// ---------- application circuit, narrow (phone) ----------
// The phone drawing is laid out by code from a vertical signal chain.

export type FlowStep =
  | { kind: "in"; ref: string; label: string }
  | { kind: "wire"; label: string }
  | { kind: "block"; ref: string; title: string; lines: string[] }
  | { kind: "out"; ref: string; label: string };

export type NarrowCircuit = {
  steps: FlowStep[];
  /** Feedback wire from the last block back to the first block. */
  loop?: string;
};

// ---------- typical performance characteristics ----------
// Only real measurements from the project README. A part without a
// measured series has no performance section.

/** A log-log plot of measured points. y2 makes a point a measured range. */
export type PerfScatter = {
  kind: "scatter";
  title: string;
  /** The test conditions, as the README states them. */
  conditions: string;
  x: { label: string; min: number; max: number; ticks: { v: number; label: string }[] };
  y: { label: string; min: number; max: number; ticks: { v: number; label: string }[] };
  points: {
    x: number;
    y: number;
    y2?: number;
    label: string;
    /** Where the label sits, from the marker, in px. */
    dx: number;
    dy: number;
    anchor?: "start" | "middle" | "end";
  }[];
};

/** Each row: how many times larger B is than A, on one log axis. */
export type PerfRatio = {
  kind: "ratio";
  title: string;
  conditions: string;
  note: string;
  a: string;
  b: string;
  max: number;
  rows: { label: string; a: string; b: string; ratio: number; approx?: boolean }[];
};

export type PerfFigure = PerfScatter | PerfRatio;

export type Part = {
  /** Route segment, for example "srjt-002". */
  slug: string;
  /** Part number, for example "SRJT-002". */
  part: string;
  name: string;
  repo: string;
  /** One sentence, in his voice. */
  oneLiner: string;
  /** The title line under the masthead. */
  title: string;
  /** Short function for the selection table. */
  fn: string;
  status: string;
  /** How you get it, for the selection table. */
  avail: string;
  /** What it is built with, short, for the selection table. From the README. */
  stack: string;
  pkg: string;
  /** Package letter for the pin drawing note, for example "N". */
  pkgCode: string;
  /** The live demo, or the install or download page. key names the row. */
  /** site: the link is a running website, so its row gets the green LED.
   *  Not for a package page, a store page or a download page. */
  live?: { href: string; label: string; key?: string; site?: boolean };
  source: string;
  /** Part-name width in em at wdth 62, wght 800. Sizes the display name. */
  nameEm: number;
  features: string[];
  pins: PartPin[];
  conditions: string;
  chars: CharGroup[];
  footnotes: Footnote[];
  circuit: { wide: WideCircuit; narrow: NarrowCircuit; caption: string };
  /** Typical performance characteristics. Omit when the README has no series. */
  perf?: PerfFigure[];
  ordering: OrderRow[];
};
