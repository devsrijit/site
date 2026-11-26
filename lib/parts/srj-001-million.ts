// SRJ-001 MILLION. Every number here comes from the project README
// (github.com/DevSrijit/million). Nothing is estimated. A value the README
// gives as "about" carries footnote 1. MIN and MAX are filled only where
// the README gives a range.

import type { Part } from "./types";

export const MILLION: Part = {
  slug: "srj-001",
  part: "SRJ-001",
  name: "Million",
  repo: "million",
  oneLiner: "A spreadsheet engine for the browser, written from scratch.",
  title: "1,000,000-row spreadsheet engine with live formulas",
  fn: "Spreadsheet engine. A million rows, every formula live.",
  status: "Active",
  avail: "Live demo",
  stack: "TypeScript · Web Worker",
  pkg: "Browser, web worker",
  pkgCode: "N",
  live: { href: "https://million.srijit.me", label: "million.srijit.me" },
  source: "https://github.com/DevSrijit/million",
  nameEm: 2.954,

  features: [
    "Holds 1,000,001 rows with 4,000,009 live formulas",
    "Only the cells that depend on an edit recalculate",
    "A filled-down column compiles once, to one JavaScript function",
    "Dependents found by arithmetic, not by per-cell edge lists",
    "Totals keep themselves: cached SUM and AVERAGE, group indexes for SUMIF, hash indexes for XLOOKUP",
    "Recalculates in 8 ms slices on a web worker; the grid keeps scrolling",
    "Canvas grid reads engine memory through a SharedArrayBuffer",
    "Runs on your machine: no server, no account, no upload",
    "56 tests, with differential tests against a full recalculation",
  ],

  // The pins are the modules in the README's code map.
  // DIP numbering: 1 to 4 down the left side, 5 to 8 up the right side.
  pins: [
    { n: 1, name: "PARSE", io: "I", desc: "Formula parser, printer and reference shifting for paste", file: "engine/parser.ts" },
    { n: 2, name: "SHEET", io: "I/O", desc: "Columns, compiler, reverse index and sliced recalculation", file: "engine/sheet.ts" },
    { n: 3, name: "CACHE", io: "I/O", desc: "Range caches, group indexes and lookup indexes", file: "engine/caches.ts" },
    { n: 4, name: "CSV", io: "I", desc: "Streaming CSV parser", file: "engine/csv.ts" },
    { n: 5, name: "PILOT", io: "I", desc: "Scripted cursor that drives the landing page", file: "components/autopilot.ts" },
    { n: 6, name: "GRID", io: "O", desc: "Canvas grid, editor, selection, clipboard and shortcuts", file: "components/Grid.tsx" },
    { n: 7, name: "DEMO", io: "I", desc: "The million-order demo ledger", file: "engine/demo.ts" },
    { n: 8, name: "WORK", io: "I/O", desc: "Web worker: edits, undo, paste, CSV import, benchmark", file: "engine/worker.ts" },
  ],

  conditions:
    "Chrome 156, production build, M5 MacBook Air, demo ledger. Small edits are timed as a batch of 50 and divided. Each result is the median of 7 rounds.",

  chars: [
    {
      group: "Capacity",
      rows: [
        { param: "Rows, demo ledger", cond: "1,000,000 orders, 8 columns", typ: "1,000,001", unit: "rows" },
        { param: "Live formulas", cond: "Whole ledger, with the summary panel", typ: "4,000,009", unit: "formulas" },
        { param: "Compiled functions", cond: "One per filled-down column", typ: "11", unit: "fn" },
        { param: "Engine memory", cond: "Typed-array columns", typ: "129", unit: "MB" },
        { param: "Built-in functions", cond: "Functions in the formula language", typ: "33", unit: "fn" },
      ],
    },
    {
      group: "Recalculation",
      rows: [
        { sym: "LOAD", param: "Build and calculate", cond: "4,000,009 cells", typ: "0.25", unit: "s", note: 1 },
        { sym: "EDIT", param: "Small edit", cond: "Units of one order; 12 cells", typ: "3", unit: "µs" },
        { sym: "MOVE", param: "Group move", cond: "Region of one order; 4 cells, between SUMIF totals", min: "1", max: "3", unit: "µs" },
        { sym: "CHAIN", param: "Chain edit", cond: "Units of the first order; 1,000,011 cells", min: "66", max: "69", unit: "ms" },
        { sym: "RATE", param: "Broadcast edit", cond: "Tax rate that every row reads; 3,000,008 cells", typ: "185", unit: "ms" },
        { sym: "SLICE", param: "Recalculation slice", cond: "Web worker, between grid frames", typ: "8", unit: "ms" },
      ],
    },
    {
      group: "Input and display",
      rows: [
        { sym: "CSV", param: "Open a CSV", cond: "56.5 MB, 1,000,000 rows, drop to sheet", typ: "0.55", unit: "s", note: 1 },
        { param: "Scroll throughput", cond: "Scrollbar drag, top to bottom, 60 fps", typ: "24,400", unit: "rows/frame", note: 1 },
        { param: "Grid draw time", cond: "Canvas grid, per frame", typ: "1", unit: "ms", note: 1 },
      ],
    },
  ],

  footnotes: [
    {
      n: 1,
      text: "The source states this value as “about”. Every number on this page is from the project README. Run `bun run bench` to measure your own machine.",
    },
  ],

  // Figure: the data flow from the README, drawn as a circuit. A CSV comes
  // in, the engine runs on a worker with an 8 ms slice clock, the grid
  // reads the engine's memory over a shared bus, and edits feed back.
  circuit: {
    caption: "Figure 2. SRJ-001 Typical Application: CSV in, live grid out",
    wide: {
      w: 664,
      h: 232,
      blocks: [
        { ref: "U1", x: 140, y: 64, w: 190, h: 130, title: "MILLION ENGINE", lines: ["Formula compiler", "Reverse index", "Range and group caches"], d: 120 },
        { ref: "U2", x: 478, y: 84, w: 122, h: 78, title: "CANVAS GRID", lines: ["About 1 ms", "a frame"], d: 420 },
      ],
      wires: [
        { pts: [[34, 98], [140, 98]], d: 0 },
        { pts: [[235, 40], [235, 64]], d: 300 },
        { pts: [[330, 119], [478, 119]], d: 340, bus: true },
        { pts: [[600, 123], [626, 123]], d: 560 },
        { pts: [[539, 162], [539, 218], [96, 218], [96, 172], [140, 172]], d: 620 },
      ],
      labels: [
        { x: 34, y: 84, text: "J1", cls: "ac-ref", d: 0 },
        { x: 34, y: 118, text: "CSV IN", d: 0 },
        { x: 148, y: 98, text: "CSV", cls: "ac-pin", d: 200 },
        { x: 148, y: 172, text: "EDIT", cls: "ac-pin", d: 200 },
        { x: 322, y: 119, text: "SAB", cls: "ac-pin", anchor: "end", d: 200 },
        { x: 235, y: 76, text: "CLK", cls: "ac-pin", anchor: "middle", d: 200 },
        { x: 251, y: 22, text: "8 ms SLICE", d: 320 },
        { x: 404, y: 103, text: "SharedArrayBuffer", anchor: "middle", cls: "ac-pin", d: 380 },
        { x: 404, y: 136, text: "read in place", anchor: "middle", cls: "ac-note", d: 380 },
        { x: 318, y: 206, text: "EDIT · UNDO · PASTE", anchor: "middle", d: 660 },
        { x: 640, y: 96, text: "DS1", cls: "ac-ref", anchor: "middle", d: 560 },
      ],
      syms: [
        { kind: "clock", cx: 235, cy: 28, d: 260 },
        { kind: "term", cx: 34, cy: 98, d: 0 },
        { kind: "display", x: 626, y: 106, d: 560 },
      ],
    },
    narrow: {
      steps: [
        { kind: "in", ref: "J1", label: "CSV IN" },
        { kind: "wire", label: "CSV" },
        { kind: "block", ref: "U1", title: "MILLION ENGINE", lines: ["Formula compiler", "Reverse index", "8 ms slices on a worker"] },
        { kind: "wire", label: "SharedArrayBuffer" },
        { kind: "block", ref: "U2", title: "CANVAS GRID", lines: ["About 1 ms a frame"] },
        { kind: "out", ref: "DS1", label: "DISPLAY" },
      ],
      loop: "EDIT · UNDO · PASTE",
    },
  },

  ordering: [
    { k: "License", v: "MIT" },
    { k: "Build", v: "Next.js 16, React 19, TypeScript. The engine and the grid use no libraries." },
  ],
};
