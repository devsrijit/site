// SRJT-003 UNTELL. Every value here comes from the project README
// (github.com/DevSrijit/untell). The README states counts and supply
// versions, not timings. The `untell see` sample in the README describes
// one film, so it is not a characteristic of the part.

import type { Part } from "./types";

export const UNTELL: Part = {
  slug: "srj-003",
  part: "SRJT-003",
  name: "Untell",
  repo: "untell",
  oneLiner: "The video framework for coding agents.",
  title: "Video framework for coding agents, with checks on every frame",
  fn: "Video framework for coding agents. Checks every frame and every beat.",
  status: "Active",
  avail: "npm",
  stack: "Node · Python",
  pkg: "npm package, CLI",
  pkgCode: "DW",
  live: { href: "https://www.npmjs.com/package/untell", label: "npmjs.com/package/untell", key: "Install" },
  source: "https://github.com/DevSrijit/untell",
  nameEm: 2.665,

  features: [
    "Design systems, blocks and checks for films that coding agents make",
    "Runs on Remotion and HyperFrames",
    "Records every frame and reads the film as one image: motion, sound, cuts and each fault at its time",
    "`untell check` names each fault with its time, the measured value, the limit and the fix",
    "`untell snap` measures alignment misses in pixels against the scene's guides",
    "`untell listen` finds the tempo, the sections and the drops of a track",
    "`untell see` turns any video into one small JSON document and contact sheets for a model",
    "20 design systems and 76 blocks, copied into your project. You own the code",
    "Agent files for Claude Code and Codex, with a lint hook after each edit",
  ],

  // The pins are the commands in the README's command table.
  pins: [
    { n: 1, name: "INIT", io: "I", desc: "Copy the kit, the example film and the agent skill into this project", file: "untell init" },
    { n: 2, name: "LINT", io: "I", desc: "Find the tells in film source code, before any render", file: "untell lint" },
    { n: 3, name: "CHECK", io: "I/O", desc: "Record the film and run every check; --sheet adds the review sheet", file: "untell check" },
    { n: 4, name: "RENDER", io: "O", desc: "Render the final file in either framework and master it", file: "untell render" },
    { n: 5, name: "SNAP", io: "I/O", desc: "Show each alignment miss as a hunk, preview it, apply the ones you accept", file: "untell snap" },
    { n: 6, name: "SEE", io: "O", desc: "Give a model any video file: one small JSON document and contact sheets", file: "untell see" },
    { n: 7, name: "SHEET", io: "O", desc: "A whole film in one image", file: "untell sheet" },
    { n: 8, name: "LISTEN", io: "O", desc: "What a track or a mix sounds like, as data", file: "untell listen" },
    { n: 9, name: "MASTER", io: "O", desc: "Bring the mix to the system's loudness target", file: "untell master" },
    { n: 10, name: "MEDIA", io: "I", desc: "Bring in photos, footage, music, effects and 3D models", file: "untell media" },
    { n: 11, name: "BUILD", io: "O", desc: "HyperFrames: bundle a scene into the film page", file: "untell build" },
    { n: 12, name: "SYSTEM", io: "I/O", desc: "Copy a system into your project to edit, and check it", file: "untell system" },
  ],

  conditions:
    "Counts and supply versions as the README states them. The README gives no timings, so this table has none.",

  chars: [
    {
      group: "Kit",
      rows: [
        { param: "Design systems", cond: "Each sets every colour, font, size, curve and duration", typ: "20", unit: "systems" },
        { param: "Blocks", cond: "Charts, diagrams, code, terminals, kinetic type, photos, 3D products", typ: "76", unit: "blocks" },
        { param: "Frameworks", cond: "untell ships neither of them", typ: "Remotion, HyperFrames", unit: "–", text: true },
        { param: "Agents", cond: "Agent files and a lint hook", typ: "Claude Code, Codex", unit: "–", text: true },
      ],
    },
    {
      group: "Checks",
      rows: [
        { param: "Source rules", cond: "untell lint, before any render", typ: "43", unit: "rules" },
        { param: "Frame and sound rules", cond: "untell check, every frame and the sound", typ: "79", unit: "rules" },
        { param: "Alignment", cond: "untell snap, against the scene's guides", typ: "Measured in px", unit: "–", text: true },
        { param: "Taste", cond: "A film that passes can still be dull", typ: "Not measured", unit: "–", text: true },
      ],
    },
    {
      group: "Supply",
      rows: [
        { param: "Node", cond: "With Google Chrome and ffmpeg", min: "20", unit: "–" },
        { param: "Python", cond: "For the checks", min: "3.10", unit: "–" },
        { param: "Tested platform", cond: "With Remotion 4 and HyperFrames. Other platforms are not tested yet", typ: "macOS, Chrome", unit: "–", text: true },
      ],
    },
  ],

  footnotes: [{ text: "Every value on this page is from the project README. Read the review sheet: a passing film is not a good film." }],

  // Figure: the agent loop. The agent edits scene code on the kit, the
  // framework renders it, and the checks send each fault back.
  circuit: {
    caption: "Figure 2. SRJT-003 Typical Application: agent in the loop",
    wide: {
      w: 664,
      h: 224,
      blocks: [
        { ref: "U1", x: 16, y: 74, w: 114, h: 90, title: "AGENT", lines: ["Claude Code", "or Codex"], d: 60 },
        { ref: "U2", x: 180, y: 64, w: 130, h: 110, title: "KIT", lines: ["20 systems", "76 blocks", "43 lint rules"], d: 180 },
        { ref: "U3", x: 360, y: 74, w: 116, h: 90, title: "RENDER", lines: ["Remotion or", "HyperFrames"], d: 320 },
        { ref: "U4", x: 520, y: 64, w: 126, h: 110, title: "CHECK", lines: ["79 rules", "Review sheet"], d: 460 },
      ],
      wires: [
        { pts: [[130, 119], [180, 119]], d: 140 },
        { pts: [[310, 119], [360, 119]], d: 280 },
        { pts: [[476, 119], [520, 119]], d: 420, bus: true },
        { pts: [[583, 174], [583, 208], [73, 208], [73, 164]], d: 620 },
      ],
      labels: [
        { x: 155, y: 106, text: "EDIT", cls: "ac-pin", anchor: "middle", d: 200 },
        { x: 335, y: 106, text: "SCENE", cls: "ac-pin", anchor: "middle", d: 340 },
        { x: 498, y: 102, text: "FILM", cls: "ac-pin", anchor: "middle", d: 480 },
        { x: 328, y: 196, text: "FAULT · TIME · FIX", anchor: "middle", d: 680 },
      ],
      syms: [],
    },
    narrow: {
      steps: [
        { kind: "block", ref: "U1", title: "AGENT", lines: ["Claude Code or Codex"] },
        { kind: "wire", label: "Edits scene code" },
        { kind: "block", ref: "U2", title: "KIT", lines: ["20 systems, 76 blocks", "43 lint rules"] },
        { kind: "wire", label: "Scene" },
        { kind: "block", ref: "U3", title: "RENDER", lines: ["Remotion or HyperFrames"] },
        { kind: "wire", label: "Film" },
        { kind: "block", ref: "U4", title: "CHECK", lines: ["79 rules", "Review sheet"] },
      ],
      loop: "FAULT · TIME · FIX",
    },
  },

  ordering: [
    { k: "License", v: "MIT. The kit fonts are under the SIL Open Font License." },
    { k: "Command", v: "`npm i -D untell`" },
    { k: "Supply", v: "Node 20, Google Chrome and ffmpeg. The checks need Python 3.10." },
  ],
};
