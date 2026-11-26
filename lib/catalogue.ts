// The pins of SRJ-0001. Each pin maps to one real thing: a part in the
// catalogue, a link, or a fact about the supply and ground. The six part
// pins on the left go to the part's datasheet page on this site; that page
// links out to the live demo or the repository.
// DIP numbering: pins 1 to 6 run down the left side, pins 7 to 12 run up
// the right side, so pin 12 sits opposite pin 1.

export type GlyphKind =
  | "resistor"
  | "capacitor"
  | "diode"
  | "led"
  | "inductor"
  | "crystal";

export type EndKind = "terminal" | "antenna" | "supply" | "ground";

export type PinDef = {
  n: number;
  side: "L" | "R";
  /** Net name printed at the end of the trace. */
  name: string;
  /** Small line above the net name: a part number or a pin function. */
  tag: string;
  /** Where the pin goes: a page on this site ("/srj-001"), a file on this
   *  site ("/resume.pdf"), or an outside link. null means the pin only
   *  lights up (VCC and GND). */
  href: string | null;
  /** Short destination shown at the trace end while the pin is lit, and
   *  in the probe readout. */
  dest: string;
  /** A shorter trace-end text, with its arrow, when dest does not fit there. */
  destShort?: string;
  /** One sentence for the probe readout. */
  desc: string;
  glyph?: { kind: GlyphKind; ref: string };
  end: EndKind;
};

/** A page on this site, opened with a client-side navigation. A file such
 *  as /resume.pdf is not a page. */
export const isPage = (href: string | null | undefined): href is string =>
  !!href && href.startsWith("/") && !/\.[a-z0-9]+$/i.test(href);

export const PINS: PinDef[] = [
  {
    n: 1,
    side: "L",
    name: "MILLION",
    tag: "SRJ-001",
    href: "/srj-001",
    dest: "Datasheet p. 2",
    desc: "A spreadsheet engine for the browser, written from scratch. A million rows, 4 million live formulas, and a small edit in microseconds.",
    glyph: { kind: "resistor", ref: "R1" },
    end: "terminal",
  },
  {
    n: 2,
    side: "L",
    name: "BLACKBOX",
    tag: "SRJ-002",
    href: "/srj-002",
    dest: "Datasheet p. 3",
    desc: "A flight recorder for AI agents. Replay the run, see what every LLM call cost, and find the waste.",
    glyph: { kind: "capacitor", ref: "C1" },
    end: "terminal",
  },
  {
    n: 3,
    side: "L",
    name: "UNTELL",
    tag: "SRJ-003",
    href: "/srj-003",
    dest: "Datasheet p. 4",
    desc: "The video framework for coding agents.",
    glyph: { kind: "led", ref: "D1" },
    end: "terminal",
  },
  {
    n: 4,
    side: "L",
    name: "ISLET",
    tag: "SRJ-004",
    href: "/srj-004",
    dest: "Datasheet p. 5",
    desc: "A free, open source Dynamic Island for the MacBook notch.",
    glyph: { kind: "inductor", ref: "L1" },
    end: "terminal",
  },
  {
    n: 5,
    side: "L",
    name: "DUALSENSE",
    tag: "SRJ-005",
    href: "/srj-005",
    dest: "Datasheet p. 6",
    desc: "Control surface for the PS5 DualSense controller. Lightbar, adaptive triggers and haptics, live in the browser over WebHID.",
    glyph: { kind: "crystal", ref: "Y1" },
    end: "terminal",
  },
  {
    n: 6,
    side: "L",
    name: "VITALS",
    tag: "SRJ-006",
    href: "/srj-006",
    dest: "Datasheet p. 7",
    desc: "Whoop-style recovery, strain and sleep metrics from any Android Health Connect export.",
    glyph: { kind: "diode", ref: "D2" },
    end: "terminal",
  },
  {
    n: 7,
    side: "R",
    name: "GND",
    tag: "GROUND",
    href: null,
    dest: "0 V",
    desc: "Common ground. Every signal on this sheet returns here.",
    end: "ground",
  },
  {
    n: 8,
    side: "R",
    name: "RESUME",
    tag: "OUT",
    href: "/resume.pdf",
    dest: "resume.pdf",
    desc: "Full parametric history, one page, PDF.",
    glyph: { kind: "diode", ref: "D3" },
    end: "terminal",
  },
  {
    n: 9,
    side: "R",
    name: "EMAIL",
    tag: "I/O",
    href: "mailto:srijitghosh.dev@gmail.com",
    dest: "srijitghosh.dev@gmail.com",
    // The address is too long for the trace end; the drawing says less.
    destShort: "Write ↗",
    desc: "Direct line. Write about work, a part, or anything on this sheet.",
    glyph: { kind: "capacitor", ref: "C2" },
    end: "terminal",
  },
  {
    n: 10,
    side: "R",
    name: "X",
    tag: "RF OUT",
    href: "https://x.com/devsrijit",
    dest: "@devsrijit",
    desc: "Short transmissions on X. Mostly build logs.",
    end: "antenna",
  },
  {
    n: 11,
    side: "R",
    name: "GITHUB",
    tag: "I/O",
    href: "https://github.com/DevSrijit",
    dest: "github/DevSrijit",
    destShort: "DevSrijit ↗",
    desc: "Source for every part in this catalogue.",
    glyph: { kind: "resistor", ref: "R2" },
    end: "terminal",
  },
  {
    n: 12,
    side: "R",
    name: "VCC",
    tag: "SUPPLY",
    href: null,
    dest: "20:00–08:00 IST",
    desc: "Supply rail. Rated for operation from 20:00 to 08:00 IST.",
    end: "supply",
  },
];
