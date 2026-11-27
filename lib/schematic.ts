// Schematic geometry as data. buildLayout() turns the pin list into
// coordinates for one of two drawings: "wide" (desktop, routed fan-out
// with components) and "narrow" (phone, short straight traces).
// The SVG renders at 1 viewBox unit = 1 CSS px, so the 1-bit die photo
// stays on whole pixels.

import { PINS, type EndKind, type GlyphKind, type PinDef } from "./catalogue";

export type Pt = [number, number];

export type NetGeom = {
  pin: PinDef;
  /** Pin lead on the package. */
  lead: { x: number; y: number; w: number; h: number };
  /** Trace from the lead tip out to the end point. */
  points: Pt[];
  end: Pt;
  endKind: EndKind;
  glyph?: { kind: GlyphKind; ref: string; x: number; y: number };
  /** Net label: tag line, name line, and the destination line shown when lit. */
  label: { x: number; y: number; anchor: "start" | "end" };
  /** Pin number inside the package body. */
  num: { x: number; y: number; anchor: "start" | "end" };
  /** Hit area. A rect on the phone; on desktop the trace stroke does the work. */
  hit: { x: number; y: number; w: number; h: number };
  /** Draw-on start time for this net, in ms. */
  delay: number;
};

export type Layout = {
  variant: "wide" | "narrow";
  w: number;
  h: number;
  body: { x: number; y: number; w: number; h: number };
  notch: number;
  dimple: Pt;
  window: { cx: number; cy: number; r: number; img: number };
  marking: { x: number; y: number; size: number };
  nets: NetGeom[];
};

export const TIMING = {
  body: 120, // body outline starts
  bodyDur: 380,
  fill: 380, // package fill and die photo
  leads: 260, // first lead
  leadStep: 30,
  traces: 440, // first trace
  traceStep: 40,
  traceDur: 420,
};

// Draw order alternates across the package: 1, 12, 2, 11, ...
const DRAW_ORDER = [1, 12, 2, 11, 3, 10, 4, 9, 5, 8, 6, 7];

const delayFor = (n: number) =>
  TIMING.traces + DRAW_ORDER.indexOf(n) * TIMING.traceStep;

/** Row index (0 at the top) of a pin on its side. */
const rowOf = (p: PinDef) => (p.side === "L" ? p.n - 1 : 12 - p.n);

export function buildLayout(variant: "wide" | "narrow"): Layout {
  return variant === "wide" ? wide() : narrow();
}

function wide(): Layout {
  const W = 880;
  const pitch = 50;
  const top = 36;
  const body = { x: 340, y: top, w: 200, h: pitch * 7 };
  const pinY = (row: number) => top + pitch + row * pitch;
  const lead = 22;
  const termL = 150;
  const termR = 730;
  // Outer pins fan away from the package; the middle pins run straight.
  const fan = [-56, -27, 0, 0, 27, 56];
  const bendL = [262, 292, 0, 0, 292, 262];

  const nets: NetGeom[] = PINS.map((pin) => {
    const row = rowOf(pin);
    const y = pinY(row);
    if (pin.side === "L") {
      const tip = body.x - lead;
      const ey = y + fan[row];
      const points: Pt[] =
        fan[row] === 0
          ? [[tip, y], [termL, y]]
          : [[tip, y], [bendL[row], y], [bendL[row], ey], [termL, ey]];
      return {
        pin,
        lead: { x: tip, y: y - 5, w: lead, h: 10 },
        points,
        end: [termL, ey],
        endKind: pin.end,
        glyph: pin.glyph && { ...pin.glyph, x: 206, y: ey },
        label: { x: termL - 12, y: ey, anchor: "end" },
        num: { x: body.x + 10, y, anchor: "start" },
        hit: { x: 0, y: ey - 26, w: termL, h: 52 },
        delay: delayFor(pin.n),
      };
    }
    const tip = body.x + body.w + lead;
    // VCC and GND turn to their rails; the signal pins run straight.
    const rail = pin.end === "supply" ? -56 : pin.end === "ground" ? 56 : 0;
    const ey = y + rail;
    const points: Pt[] =
      rail === 0
        ? [[tip, y], [termR, y]]
        : [[tip, y], [600, y], [600, ey], [termR, ey]];
    return {
      pin,
      lead: { x: body.x + body.w, y: y - 5, w: lead, h: 10 },
      points,
      end: [termR, ey],
      endKind: pin.end,
      glyph: pin.glyph && { ...pin.glyph, x: 662, y: ey },
      label: { x: termR + 14, y: ey, anchor: "start" },
      num: { x: body.x + body.w - 10, y, anchor: "end" },
      hit: { x: termR, y: ey - 26, w: W - termR, h: 52 },
      delay: delayFor(pin.n),
    };
  });

  return {
    variant: "wide",
    w: W,
    h: body.y + body.h + 30,
    body,
    notch: 12,
    dimple: [body.x + 22, body.y + 22],
    window: { cx: body.x + body.w / 2, cy: body.y + 160, r: 70, img: 200 },
    marking: { x: body.x + body.w / 2, y: body.y + 270, size: 13 },
    nets,
  };
}

function narrow(): Layout {
  const W = 340;
  const pitch = 50;
  const top = 8;
  // The body runs on 8 units past the last pin row, so the part marking
  // fits under pins 06 and 07 and clears every pin number.
  const body = { x: 114, y: top, w: 112, h: pitch * 7 + 8 };
  const pinY = (row: number) => top + pitch + row * pitch;
  const lead = 12;
  const termL = 76;
  const termR = 264;

  const nets: NetGeom[] = PINS.map((pin) => {
    const row = rowOf(pin);
    const y = pinY(row);
    const left = pin.side === "L";
    const tip = left ? body.x - lead : body.x + body.w + lead;
    const term = left ? termL : termR;
    return {
      pin,
      lead: { x: left ? tip : body.x + body.w, y: y - 4, w: lead, h: 8 },
      points: [[tip, y], [term, y]],
      end: [term, y],
      endKind: pin.end === "terminal" || pin.end === "antenna" ? pin.end : "terminal",
      label: left
        ? { x: term - 9, y, anchor: "end" }
        : { x: term + 9, y, anchor: "start" },
      num: left
        ? { x: body.x + 4, y, anchor: "start" }
        : { x: body.x + body.w - 4, y, anchor: "end" },
      // Each row is a full-height tap target from the page edge to the body.
      hit: left
        ? { x: 0, y: y - pitch / 2, w: body.x + 16, h: pitch }
        : { x: body.x + body.w - 16, y: y - pitch / 2, w: W - (body.x + body.w - 16), h: pitch },
      delay: delayFor(pin.n),
    };
  });

  return {
    variant: "narrow",
    w: W,
    h: body.y + body.h + 8,
    body,
    notch: 9,
    dimple: [body.x + 14, body.y + 14],
    window: { cx: body.x + body.w / 2, cy: body.y + 158, r: 33, img: 100 },
    marking: { x: body.x + body.w / 2, y: body.y + 328, size: 12 },
    nets,
  };
}

export const toPath = (pts: Pt[]) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

// ---------- component glyphs ----------
// Each glyph is drawn horizontally around (0, 0), 36 units long, and is
// rotated or moved by the caller. "gap" is the half-width of the paper
// mask that hides the trace under the symbol body.

export const GLYPHS: Record<GlyphKind, { d: string; gap: number }> = {
  resistor: {
    d: "M-18 0H-12L-10 -6L-6 6L-2 -6L2 6L6 -6L10 6L12 0H18",
    gap: 12,
  },
  capacitor: {
    d: "M-18 0H-3M-3 -9V9M3 -9V9M3 0H18",
    gap: 3,
  },
  diode: {
    d: "M-18 0H-7M-7 -7V7L7 0Z M7 -7V7M7 0H18",
    gap: 7,
  },
  led: {
    d: "M-18 0H-7M-7 -7V7L7 0Z M7 -7V7M7 0H18 M1 -10L6 -15M3.5 -15H6V-12.5 M6 -8L11 -13M8.5 -13H11V-10.5",
    gap: 7,
  },
  inductor: {
    d: "M-18 0H-12A3 3 0 0 1 -6 0A3 3 0 0 1 0 0A3 3 0 0 1 6 0A3 3 0 0 1 12 0H18",
    gap: 12,
  },
  crystal: {
    d: "M-18 0H-8M-8 -8V8M-4 -6H4V6H-4Z M8 -8V8M8 0H18",
    gap: 8,
  },
};

/** End symbols, drawn at the end point of a trace. */
export function endSymbol(kind: EndKind, [x, y]: Pt): string {
  switch (kind) {
    case "ground":
      return `M${x} ${y}V${y + 10}M${x - 10} ${y + 10}H${x + 10}M${x - 6} ${y + 14}H${x + 6}M${x - 2.5} ${y + 18}H${x + 2.5}`;
    case "supply":
      return `M${x} ${y}V${y - 10}M${x - 9} ${y - 10}H${x + 9}`;
    case "antenna":
      return `M${x} ${y}V${y - 12}M${x - 7} ${y - 22}L${x} ${y - 12}L${x + 7} ${y - 22}M${x} ${y - 12}V${y - 24}`;
    default:
      return "";
  }
}
