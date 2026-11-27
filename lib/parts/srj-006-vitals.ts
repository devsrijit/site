// SRJT-006 VITALS. Every value here comes from the project README
// (github.com/DevSrijit/vitals): output ranges, model constants and
// supply versions. A value the README gives as "about" carries footnote 1.

import type { Part } from "./types";

export const VITALS: Part = {
  slug: "srj-006",
  part: "SRJT-006",
  name: "Vitals",
  repo: "vitals",
  oneLiner: "Recovery, strain and sleep metrics from a cheap watch, on your own machine.",
  title: "Recovery, strain and sleep metrics from Health Connect exports",
  fn: "Recovery, strain and sleep metrics from a Health Connect export.",
  status: "Active",
  avail: "Source",
  stack: "Python · SQLite · MCP",
  pkg: "Python CLI, MCP server",
  pkgCode: "Q",
  source: "https://github.com/DevSrijit/vitals",
  nameEm: 2.405,

  features: [
    "Whoop-style recovery, strain and sleep metrics from raw Android Health Connect exports",
    "Works with any watch whose app writes heart rate, sleep and SpO2 to Health Connect",
    "Published formulas: Banister TRIMP, Karvonen zones, Keytel calories, the impulse-response model",
    "Every number reproducible from the raw tables; every constant in one file",
    "Output: a SQLite database, CSV, Markdown reports and a web dashboard",
    "An MCP server, so Claude Code or any other agent can query your data",
    "Idempotent sync: the same export ingested twice changes nothing",
    "No cloud account, no subscription, no AI inference",
    "A synthetic 35-day demo, so you can try it without a watch",
  ],

  // The pins are the commands in the README's interface tables.
  pins: [
    { n: 1, name: "DOCTOR", io: "I", desc: "Inventory of an export and the local database, sample gaps, last sync", file: "vitals doctor" },
    { n: 2, name: "INGEST", io: "I", desc: "Load a Health Connect zip or database, or a Takeout Fit export", file: "vitals ingest" },
    { n: 3, name: "COMPUTE", io: "I/O", desc: "Recompute the daily and workout_metrics tables", file: "vitals compute" },
    { n: 4, name: "SYNC", io: "I/O", desc: "rclone pull, ingest, compute and report", file: "vitals sync" },
    { n: 5, name: "REPORT", io: "O", desc: "Markdown report with daily and workout tables", file: "vitals report" },
    { n: 6, name: "SQL", io: "O", desc: "Read-only SQL, CSV to stdout", file: "vitals sql" },
    { n: 7, name: "MCP", io: "I/O", desc: "stdio MCP server with eight tools, run_sql read-only", file: "vitals-mcp" },
    { n: 8, name: "WEB", io: "O", desc: "Next.js dashboard over the same database, read-only", file: "web/" },
  ],

  conditions:
    "Ranges and constants as the README states them. Every constant lives in vitals/metrics.py. The README gives no timings, so this table has none.",

  chars: [
    {
      group: "Outputs",
      rows: [
        { param: "Recovery", cond: "Resting HR, sleep and SpO2; HRV when the watch gives it", min: "0", max: "100", unit: "–" },
        { param: "Recovery, green band", cond: "Yellow 34 to 66, red below 34", min: "67", unit: "–" },
        { param: "Strain", cond: "21 × (1 − e^(−L / 155)), L = Edwards TRIMP", min: "0", max: "21", unit: "–" },
        { param: "Strain, 60 min in zone 5", cond: "The last points are the hardest to earn", typ: "18", unit: "–", note: 1 },
        { param: "MCP tools", cond: "stdio server", typ: "8", unit: "tools" },
      ],
    },
    {
      group: "Model constants",
      rows: [
        { sym: "CTL", symPrefix: "τ", param: "Fitness window", cond: "Exponential average of TRIMP", typ: "42", unit: "days" },
        { sym: "ATL", symPrefix: "τ", param: "Fatigue window", cond: "Exponential average of TRIMP", typ: "7", unit: "days" },
        { param: "ACWR risk zone", cond: "7-day mean over 28-day mean", min: "1.5", unit: "–" },
        { param: "SpO2 component", cond: "Overnight minimum, mapped to 0 and 100", min: "88", max: "95", unit: "%" },
        { param: "HR sample cap, background", cond: "Gap to the next sample, default", typ: "10", unit: "min" },
        { param: "HR sample cap, workout", cond: "Gap to the next sample", typ: "60", unit: "s" },
      ],
    },
    {
      group: "Supply",
      rows: [
        { param: "Python", cond: "With uv", min: "3.12", unit: "–" },
        { param: "Android", cond: "Scheduled Health Connect export", min: "15", unit: "–" },
        { param: "Background sync", cond: "launchd agent, default interval", typ: "6", unit: "h" },
        { param: "Demo export", cond: "Synthetic, writes only to .demo/", typ: "35", unit: "days" },
        { param: "Cloud account", cond: "Runs on your own machine", typ: "None", unit: "–", text: true },
      ],
    },
  ],

  footnotes: [
    { n: 1, text: "The source states this value as “about”." },
    { text: "Every value on this page is from the project README. The recovery score is a trend instrument, not a diagnosis." },
  ],

  // Figure: the export comes in on a 6 h sync clock, the engine ingests
  // and computes, and three outputs read the same database.
  circuit: {
    caption: "Figure 2. SRJT-006 Typical Application: export in, metrics out",
    wide: {
      w: 664,
      h: 224,
      blocks: [
        { ref: "U1", x: 150, y: 64, w: 190, h: 118, ty: 42, title: "VITALS", lines: ["Ingest", "Compute", "SQLite database"], d: 120 },
      ],
      wires: [
        { pts: [[34, 123], [150, 123]], d: 0 },
        { pts: [[245, 40], [245, 64]], d: 300 },
        { pts: [[340, 84], [520, 84]], d: 380 },
        { pts: [[340, 123], [520, 123]], d: 440 },
        { pts: [[340, 162], [520, 162]], d: 500 },
      ],
      labels: [
        { x: 34, y: 109, text: "J1", cls: "ac-ref", d: 0 },
        { x: 34, y: 143, text: "HC EXPORT", d: 0 },
        { x: 70, y: 111, text: "ZIP", cls: "ac-pin", d: 60 },
        { x: 245, y: 76, text: "CLK", cls: "ac-pin", anchor: "middle", d: 200 },
        { x: 265, y: 28, text: "SYNC, 6 h", d: 320 },
        { x: 430, y: 70, text: "8 tools", anchor: "middle", cls: "ac-note", d: 420 },
        { x: 430, y: 109, text: "read-only", anchor: "middle", cls: "ac-note", d: 480 },
        { x: 430, y: 148, text: "Markdown, CSV", anchor: "middle", cls: "ac-note", d: 540 },
        { x: 534, y: 84, text: "MCP", d: 440 },
        { x: 534, y: 123, text: "DASHBOARD", d: 500 },
        { x: 534, y: 162, text: "REPORTS", d: 560 },
      ],
      syms: [
        { kind: "term", cx: 34, cy: 123, d: 0 },
        { kind: "clock", cx: 245, cy: 28, d: 260 },
        { kind: "term", cx: 520, cy: 84, d: 440 },
        { kind: "term", cx: 520, cy: 123, d: 500 },
        { kind: "term", cx: 520, cy: 162, d: 560 },
      ],
    },
    narrow: {
      steps: [
        { kind: "in", ref: "J1", label: "HEALTH CONNECT EXPORT" },
        { kind: "wire", label: "Daily zip, synced every 6 h" },
        { kind: "block", ref: "U1", title: "VITALS", lines: ["Ingest, compute", "SQLite database"] },
        { kind: "wire", label: "daily, workout_metrics" },
        { kind: "out", ref: "J2", label: "MCP · DASHBOARD · REPORTS" },
      ],
    },
  },

  ordering: [
    { k: "License", v: "MIT" },
    { k: "Build", v: "Python 3.12 with uv, and SQLite. The dashboard is Next.js on Bun." },
    { k: "Works with", v: "Any watch whose app writes heart rate, sleep and SpO2 to Health Connect." },
  ],
};
