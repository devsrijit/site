// SRJ-002 BLACKBOX. Every value here comes from the project README
// (github.com/DevSrijit/blackbox). The README states thresholds and
// limits, not timings, so the characteristics are the limits it states.
// The license is MIT (confirmed by Srijit).

import type { Part } from "./types";

export const BLACKBOX: Part = {
  slug: "srj-002",
  part: "SRJ-002",
  name: "Blackbox",
  repo: "blackbox",
  oneLiner: "A flight recorder for AI agents.",
  title: "Flight recorder for AI agents, with per-call cost replay",
  fn: "Flight recorder for AI agents. Replays a run and prices every call.",
  status: "Active",
  avail: "Live demo",
  stack: "Next.js · React · Tailwind",
  pkg: "Browser",
  pkgCode: "D",
  live: { href: "https://blackbox.srijit.me", label: "blackbox.srijit.me" },
  source: "https://github.com/DevSrijit/blackbox",
  nameEm: 3.793,

  features: [
    "Replays one agent run step by step, with a spend line that climbs as it plays",
    "Splits the input of each LLM call into full-price and cached tokens",
    "Prices every call again on any OpenRouter model; the hatched band is the saving",
    "Five waste checks, each with its steps and an estimated saving",
    "Overlapping findings combine in sequence. They are never added up directly",
    "Sets a different model for one step only, and puts it back in one click",
    "Reads Claude Code and Codex sessions, OpenTelemetry JSON and chat lines",
    "Keeps the recorded token counts when it prices a run again. It does not guess",
    "Runs in your browser: no account, no upload",
  ],

  // The pins are the modules in the README's code map. The app/ folder
  // (the pages) is left out.
  pins: [
    { n: 1, name: "ADAPT", io: "I", desc: "Trace parsers and trace clean-up", file: "lib/adapters.ts" },
    { n: 2, name: "COST", io: "I/O", desc: "Prices and cost math", file: "lib/cost.ts" },
    { n: 3, name: "FIND", io: "O", desc: "The five waste checks", file: "lib/findings.ts" },
    { n: 4, name: "MODEL", io: "I", desc: "OpenRouter model list, cached for one hour, with a saved copy as a fallback", file: "lib/models.ts" },
    { n: 5, name: "FEAT", io: "I", desc: "The models the Compare list shows first, from OpenRouter usage rankings", file: "lib/featured.ts" },
    { n: 6, name: "BENCH", io: "I/O", desc: "The replay: state, playback and the keyboard map", file: "components/Workbench.tsx" },
    { n: 7, name: "REC", io: "O", desc: "Spend line, input bars and step timeline", file: "components/Recorder.tsx" },
    { n: 8, name: "PANEL", io: "O", desc: "Side panel: Compare models, Waste and Step", file: "components/Panel.tsx" },
    { n: 9, name: "CMD", io: "I", desc: "Command menu, shortcut sheet and tooltips", file: "components/Commands.tsx" },
    { n: 10, name: "POP", io: "I/O", desc: "The select and the model picker", file: "components/Popover.tsx" },
  ],

  conditions:
    "Limits and thresholds as the README states them. The README gives no timings, so this table has none.",

  chars: [
    {
      group: "Input",
      rows: [
        { param: "Trace size", cond: "One trace file", max: "250", unit: "MB" },
        { param: "Trace formats", cond: "Found from the file content, not the file name", typ: "5", unit: "formats" },
        { param: "Agent sessions", cond: "Read from your own disk", typ: "Claude Code, Codex", unit: "–", text: true },
        { param: "Time units", cond: "Trace timestamps; every trace moves to start at zero", typ: "s or ms", unit: "–", text: true },
      ],
    },
    {
      group: "Waste checks",
      rows: [
        { param: "Checks", cond: "Run on every trace", typ: "5", unit: "checks" },
        { param: "Repeated tool call", cond: "Same tool, same arguments", min: "3", unit: "calls" },
        { param: "Tool definitions", cond: "Share of the input, on every call", typ: "8", unit: "%", note: 1 },
        { param: "Costly model", cond: "Input price per 1M tokens, on a call with no tools", min: "1.50", unit: "$" },
        { param: "Short answer", cond: "Output of the same call", max: "40", unit: "tokens" },
      ],
    },
    {
      group: "Pricing",
      rows: [
        { param: "Price list refresh", cond: "Server, OpenRouter price list", typ: "1", unit: "h" },
        { param: "Compare list window", cond: "Most used models on OpenRouter", typ: "4", unit: "weeks" },
        { param: "Answer quality", cond: "A cheaper model can give worse answers", typ: "Not measured", unit: "–", text: true },
      ],
    },
    {
      group: "Supply",
      rows: [
        { param: "Bun", cond: "To run it on your computer", min: "1.4", unit: "–" },
        { param: "Account, upload", cond: "Everything runs in the browser", typ: "None", unit: "–", text: true },
      ],
    },
  ],

  footnotes: [
    { n: 1, text: "Flagged when the tool definitions are more than this share of the input on every call." },
    { text: "Every value on this page is from the project README." },
  ],

  // Figure: a trace comes in, the engine parses it and prices every call
  // with the OpenRouter list, and the replay draws it. A model swap feeds
  // back and prices the run again.
  circuit: {
    caption: "Figure 2. SRJ-002 Typical Application: trace in, priced replay out",
    wide: {
      w: 664,
      h: 232,
      blocks: [
        { ref: "U1", x: 140, y: 64, w: 200, h: 130, title: "BLACKBOX", lines: ["Trace adapters", "Cost math", "Five waste checks"], d: 120 },
        { ref: "U2", x: 470, y: 84, w: 130, h: 78, title: "REPLAY", lines: ["Spend line", "Step timeline"], d: 420 },
      ],
      wires: [
        { pts: [[34, 98], [140, 98]], d: 0 },
        { pts: [[240, 32], [240, 64]], d: 300 },
        { pts: [[340, 119], [470, 119]], d: 340, bus: true },
        { pts: [[600, 123], [626, 123]], d: 560 },
        { pts: [[535, 162], [535, 218], [96, 218], [96, 172], [140, 172]], d: 620 },
      ],
      labels: [
        { x: 34, y: 84, text: "J1", cls: "ac-ref", d: 0 },
        { x: 34, y: 118, text: "TRACE IN", d: 0 },
        { x: 148, y: 98, text: "TRACE", cls: "ac-pin", d: 200 },
        { x: 148, y: 172, text: "MODEL", cls: "ac-pin", d: 200 },
        { x: 332, y: 119, text: "COST", cls: "ac-pin", anchor: "end", d: 200 },
        { x: 240, y: 76, text: "PRICE", cls: "ac-pin", anchor: "middle", d: 200 },
        { x: 228, y: 24, text: "J2", cls: "ac-ref", anchor: "end", d: 300 },
        { x: 253, y: 24, text: "OPENROUTER PRICES, 1 h", d: 320 },
        { x: 405, y: 103, text: "Steps and cost", anchor: "middle", cls: "ac-pin", d: 380 },
        { x: 405, y: 136, text: "recorded tokens", anchor: "middle", cls: "ac-note", d: 380 },
        { x: 318, y: 206, text: "MODEL SWAP · PRICE AGAIN", anchor: "middle", d: 660 },
        { x: 640, y: 96, text: "DS1", cls: "ac-ref", anchor: "middle", d: 560 },
      ],
      syms: [
        { kind: "term", cx: 34, cy: 98, d: 0 },
        { kind: "term", cx: 240, cy: 28, d: 300 },
        { kind: "display", x: 626, y: 106, d: 560 },
      ],
    },
    narrow: {
      steps: [
        { kind: "in", ref: "J1", label: "TRACE IN, UP TO 250 MB" },
        { kind: "wire", label: "Session JSONL, OTel JSON" },
        { kind: "block", ref: "U1", title: "BLACKBOX", lines: ["Trace adapters", "OpenRouter prices, 1 h", "Five waste checks"] },
        { kind: "wire", label: "Steps and cost per call" },
        { kind: "block", ref: "U2", title: "REPLAY", lines: ["Spend line", "Step timeline"] },
        { kind: "out", ref: "DS1", label: "DISPLAY" },
      ],
      loop: "MODEL SWAP · PRICE AGAIN",
    },
  },

  ordering: [
    { k: "License", v: "MIT" },
    { k: "Build", v: "Next.js 16, React 19, Tailwind CSS 4 and Motion." },
  ],
};
