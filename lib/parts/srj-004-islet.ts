// SRJT-004 ISLET. Every value here comes from the project README
// (github.com/DevSrijit/islet). The README has no code map, so the pins
// are the main parts of the app as the README lists them.

import type { Part } from "./types";

export const ISLET: Part = {
  slug: "srj-004",
  part: "SRJT-004",
  name: "Islet",
  repo: "islet",
  oneLiner: "A free, open source Dynamic Island for the MacBook notch.",
  title: "Dynamic Island for the MacBook notch, in native Swift",
  fn: "Dynamic Island for the MacBook notch. Free and open source.",
  status: "Active",
  avail: "Download",
  stack: "Swift · macOS",
  pkg: "macOS app",
  pkgCode: "P",
  live: { href: "https://github.com/DevSrijit/islet/releases", label: "GitHub Releases", key: "Download" },
  source: "https://github.com/DevSrijit/islet",
  nameEm: 1.959,

  features: [
    "Now Playing for every app that reports media to macOS: Music, Spotify, browsers, video players",
    "Shows the site icon for browser media, so YouTube looks like YouTube",
    "Peeks in the closed notch: battery, AirPods and other devices, Focus, calendar, downloads, Caps Lock",
    "Volume, brightness and keyboard backlight HUDs replace the system bezels",
    "A file shelf: drag files onto the notch, then drag them out anywhere",
    "Two-finger swipes, haptic feedback and Shortcuts actions",
    "Works on Macs without a notch, with a simulated one, and on external displays",
    "Asks for each permission only when you turn its feature on",
    "Native Swift. No analytics, no account, no third-party Swift dependencies",
  ],

  pins: [
    { n: 1, name: "NOW", io: "O", desc: "Now Playing: artwork, title, scrubber, controls and an output device switcher" },
    { n: 2, name: "WAVE", io: "O", desc: "Waveform in the closed notch. The live waveform reads the output level" },
    { n: 3, name: "PEEK", io: "O", desc: "Peeks: battery, connected devices, Focus, calendar, downloads and Caps Lock" },
    { n: 4, name: "HUD", io: "O", desc: "Volume, brightness and keyboard backlight HUDs in the notch" },
    { n: 5, name: "SHELF", io: "I/O", desc: "File shelf: park files on the notch, then AirDrop, Quick Look or reveal them" },
    { n: 6, name: "GEST", io: "I", desc: "Two-finger swipes on the trackpad, the ⌃⌥I shortcut and Shortcuts actions" },
    { n: 7, name: "MRA", io: "I", desc: "MediaRemoteAdapter, a BSD-licensed helper in the system Perl. Islet reads its JSON stream", file: "ungive/mediaremote-adapter" },
    { n: 8, name: "MENU", io: "I", desc: "Menu bar item. Islet lives in the menu bar" },
  ],

  conditions: "Supply versions and limits as the README states them. The README gives no timings, so this table has none.",

  chars: [
    {
      group: "Supply",
      rows: [
        { param: "macOS", cond: "Islet", min: "14", unit: "–" },
        { param: "macOS, live waveform", cond: "Waveform driven by the audio itself", min: "14.2", unit: "–" },
        { param: "Notch", cond: "Simulated on Macs without one and on external displays", typ: "Not required", unit: "–", text: true },
        { param: "Third-party Swift dependencies", cond: "Native Swift", typ: "0", unit: "–" },
      ],
    },
    {
      group: "Display",
      rows: [
        { param: "HUD styles", cond: "White, accent, glow, decibel", typ: "4", unit: "styles" },
        { param: "Media sources", cond: "Apps that report media to macOS", typ: "Every app", unit: "–", text: true },
        { param: "Per-app integrations", cond: "No scripting of Spotify or Music", typ: "0", unit: "–" },
      ],
    },
    {
      group: "Input and privacy",
      rows: [
        { param: "Swipe directions", cond: "Two fingers on the notch: open, close, previous, next", typ: "4", unit: "–" },
        { param: "Shortcut", cond: "Open the island", typ: "⌃⌥I", unit: "–", text: true },
        { param: "Permissions", cond: "Each asked only when its feature turns on", max: "4", unit: "–" },
        { param: "Analytics, account", cond: "None ship", typ: "None", unit: "–", text: true },
      ],
    },
  ],

  footnotes: [
    { text: "Every value on this page is from the project README. Islet is not notarized, so macOS asks once on first open." },
  ],

  // Figure: three kinds of input reach the island. Media comes through the
  // MediaRemoteAdapter helper as a JSON stream; system events and dragged
  // files come in directly. The island drives the notch.
  circuit: {
    caption: "Figure 2. SRJT-004 Typical Application: media and events in, notch out",
    wide: {
      w: 664,
      h: 244,
      blocks: [
        { ref: "U2", x: 112, y: 58, w: 140, h: 36, title: "MR ADAPTER", lines: [], d: 120 },
        { ref: "U1", x: 300, y: 50, w: 170, h: 162, ty: 52, title: "ISLET", lines: ["Now Playing", "Peeks", "HUDs", "Shelf"], d: 240 },
      ],
      wires: [
        { pts: [[34, 76], [112, 76]], d: 0 },
        { pts: [[252, 76], [300, 76]], d: 200 },
        { pts: [[34, 134], [300, 134]], d: 80 },
        { pts: [[34, 192], [300, 192]], d: 160 },
        { pts: [[470, 131], [560, 131]], d: 520 },
        { pts: [[385, 230], [385, 212]], d: 440 },
      ],
      labels: [
        { x: 22, y: 76, text: "J1", cls: "ac-ref", anchor: "end", d: 0 },
        { x: 34, y: 98, text: "MEDIA", d: 0 },
        { x: 276, y: 64, text: "JSON", cls: "ac-pin", anchor: "middle", d: 260 },
        { x: 22, y: 134, text: "J2", cls: "ac-ref", anchor: "end", d: 80 },
        { x: 34, y: 156, text: "EVENTS", d: 80 },
        { x: 56, y: 120, text: "Battery, Bluetooth, Focus", cls: "ac-note", d: 120 },
        { x: 22, y: 192, text: "J3", cls: "ac-ref", anchor: "end", d: 160 },
        { x: 34, y: 214, text: "FILES", d: 160 },
        { x: 56, y: 178, text: "Drag onto the notch", cls: "ac-note", d: 200 },
        { x: 397, y: 230, text: "SWIPE · ⌃⌥I", d: 480 },
        { x: 574, y: 100, text: "DS1", cls: "ac-ref", anchor: "middle", d: 560 },
        { x: 574, y: 164, text: "NOTCH", anchor: "middle", d: 560 },
      ],
      syms: [
        { kind: "term", cx: 34, cy: 76, d: 0 },
        { kind: "term", cx: 34, cy: 134, d: 80 },
        { kind: "term", cx: 34, cy: 192, d: 160 },
        { kind: "term", cx: 385, cy: 230, d: 440 },
        { kind: "display", x: 560, y: 114, d: 560 },
      ],
    },
    narrow: {
      steps: [
        { kind: "in", ref: "J1", label: "MEDIA" },
        { kind: "block", ref: "U2", title: "MR ADAPTER", lines: ["BSD helper, system Perl"] },
        { kind: "wire", label: "JSON stream" },
        { kind: "block", ref: "U1", title: "ISLET", lines: ["Now Playing, peeks", "HUDs, shelf"] },
        { kind: "out", ref: "DS1", label: "NOTCH" },
      ],
    },
  },

  ordering: [
    { k: "License", v: "MIT. Third-party notices ship with the source." },
    { k: "Build", v: "Native Swift, generated with XcodeGen." },
    { k: "Notice", v: "Not affiliated with Apple or with any other notch app." },
  ],
};
