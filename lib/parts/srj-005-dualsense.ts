// SRJT-005 DUALSENSE. Every value here comes from the project README
// (github.com/DevSrijit/dualsense-studio). The README states no
// measurements, so the characteristics are counts and interfaces. The
// README has no license section; MIT is from the repository's LICENSE file.

import type { Part } from "./types";

export const DUALSENSE: Part = {
  slug: "srj-005",
  part: "SRJT-005",
  name: "DualSense",
  repo: "dualsense-studio",
  oneLiner: "A control surface for the PS5 DualSense controller, live in the browser.",
  title: "DualSense Studio: WebHID control surface for the PS5 controller",
  fn: "Control surface for the PS5 DualSense controller, over WebHID.",
  status: "Active",
  avail: "Source",
  stack: "TypeScript · WebHID",
  pkg: "Browser, WebHID",
  pkgCode: "U",
  source: "https://github.com/DevSrijit/dualsense-studio",
  nameEm: 4.113,

  features: [
    "Tunes the lightbar, adaptive triggers, rumble and LEDs live from the browser",
    "Seven adaptive-trigger effects for L2 and R2, each with its own parameters",
    "Two independent rumble motors, low and high frequency",
    "Presets as starting points, including Forza Horizon 6 race and off-road",
    "Live input monitor: sticks, buttons, triggers, touchpad, gyroscope and accelerometer",
    "Reads input without taking the controller, so a game can use it at the same time",
    "Battery level and charging state, parsed from the input stream",
    "The protocol is a pure TypeScript package with no dependencies, behind a transport interface",
    "No data leaves your machine",
  ],

  // The pins are the parts of the system in the README's diagram and
  // repository layout. Pins 1 to 7 are in the @ds5/protocol package.
  pins: [
    { n: 1, name: "PROF", io: "I", desc: "Profile to output state", file: "packages/protocol" },
    { n: 2, name: "ENC", io: "O", desc: "Output report encoder", file: "packages/protocol" },
    { n: 3, name: "CRC", io: "O", desc: "DualSense CRC-32", file: "packages/protocol" },
    { n: 4, name: "TRIG", io: "O", desc: "Adaptive-trigger builders", file: "packages/protocol" },
    { n: 5, name: "INPUT", io: "I", desc: "Input report parser: sticks, buttons, touchpad, motion, battery", file: "packages/protocol" },
    { n: 6, name: "CTRL", io: "I/O", desc: "Controller engine with keep-alive", file: "packages/protocol" },
    { n: 7, name: "XPORT", io: "I/O", desc: "Transport interface. WebHID in the browser today", file: "packages/protocol" },
    { n: 8, name: "UI", io: "I", desc: "Panels, presets and the animated controller visual", file: "apps/web" },
  ],

  conditions: "Counts and interfaces as the README states them. The README gives no measurements, so this table has none.",

  chars: [
    {
      group: "Outputs",
      rows: [
        { param: "Trigger effects", cond: "Feedback, Weapon, Vibration, Slope, Bow, Galloping, Machine", typ: "7", unit: "effects" },
        { param: "Rumble motors", cond: "Low and high frequency, independent", typ: "2", unit: "motors" },
        { param: "Mic LED modes", cond: "Off, solid, pulse", typ: "3", unit: "modes" },
        { param: "Lightbar", cond: "Brightness and sweep speed", typ: "Solid or rainbow", unit: "–", text: true },
        { param: "HD haptics", cond: "Voice-coil PCM over USB audio; on the roadmap", typ: "Planned", unit: "–", text: true },
      ],
    },
    {
      group: "Inputs",
      rows: [
        { param: "Touchpad", cond: "Live input monitor", typ: "2", unit: "fingers" },
        { param: "Battery", cond: "Parsed from the input stream", typ: "Level, charging", unit: "–", text: true },
      ],
    },
    {
      group: "Interface",
      rows: [
        { param: "Link", cond: "Controller to computer", typ: "Bluetooth or USB", unit: "–", text: true },
        { param: "Browser", cond: "WebHID is required", typ: "Chrome, Edge, Arc", unit: "–", text: true },
        { param: "Programs on the device", cond: "Close any other controller app first", max: "1", unit: "–" },
        { param: "Protocol dependencies", cond: "@ds5/protocol, pure TypeScript", typ: "0", unit: "–" },
      ],
    },
  ],

  footnotes: [
    { text: "Every value on this page is from the project README. The license is from the repository's LICENSE file." },
  ],

  // Figure: the panels write a profile, the protocol package turns it into
  // an output report, and the transport sends it to the controller. The
  // input report comes back to the monitor.
  circuit: {
    caption: "Figure 2. SRJT-005 Typical Application: browser to controller over WebHID",
    wide: {
      w: 664,
      h: 224,
      blocks: [
        { ref: "U1", x: 16, y: 64, w: 110, h: 110, title: "PANELS", lines: ["Triggers", "Lightbar", "Rumble"], d: 60 },
        { ref: "U2", x: 176, y: 54, w: 160, h: 130, title: "@ds5/protocol", lines: ["Profile to state", "Report encoder", "CRC-32", "Trigger builders"], d: 180 },
        { ref: "U3", x: 384, y: 84, w: 112, h: 70, title: "TRANSPORT", lines: ["WebHID"], d: 320 },
        { ref: "U4", x: 540, y: 74, w: 110, h: 90, title: "DUALSENSE", lines: ["Bluetooth", "or USB"], d: 460 },
      ],
      wires: [
        { pts: [[126, 119], [176, 119]], d: 140 },
        { pts: [[336, 119], [384, 119]], d: 280, bus: true },
        { pts: [[496, 119], [540, 119]], d: 420 },
        { pts: [[595, 164], [595, 208], [71, 208], [71, 174]], d: 620 },
      ],
      labels: [
        { x: 151, y: 106, text: "EDIT", cls: "ac-pin", anchor: "middle", d: 200 },
        { x: 360, y: 102, text: "OUT", cls: "ac-pin", anchor: "middle", d: 340 },
        { x: 518, y: 106, text: "HID", cls: "ac-pin", anchor: "middle", d: 480 },
        { x: 333, y: 196, text: "INPUT REPORT · BATTERY", anchor: "middle", d: 680 },
      ],
      syms: [],
    },
    narrow: {
      steps: [
        { kind: "block", ref: "U1", title: "PANELS", lines: ["Triggers, lightbar, rumble"] },
        { kind: "wire", label: "Profile" },
        { kind: "block", ref: "U2", title: "@ds5/protocol", lines: ["Report encoder, CRC-32", "Trigger builders"] },
        { kind: "wire", label: "Output report" },
        { kind: "block", ref: "U3", title: "TRANSPORT", lines: ["WebHID"] },
        { kind: "wire", label: "Bluetooth or USB" },
        { kind: "block", ref: "U4", title: "DUALSENSE", lines: ["PS5 controller"] },
      ],
      loop: "INPUT REPORT · BATTERY",
    },
  },

  ordering: [
    { k: "License", v: "MIT" },
    { k: "Build", v: "Bun workspace. Next.js 16, Tailwind v4, shadcn/ui and Framer Motion. The protocol package is pure TypeScript." },
    { k: "Roadmap", v: "Electron shell for macOS. USB-audio transport for HD haptics." },
    { k: "Notice", v: "Not affiliated with Sony Interactive Entertainment." },
  ],
};
