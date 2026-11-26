// Font data for the share cards and icons (next/og, which uses Satori).
// Satori reads TTF, OTF and WOFF, not WOFF2, and it cannot set a variable
// axis. So the repo keeps static WOFF instances of the three site faces in
// assets/fonts/, with their OFL licence files:
//   Archivo ExtraCondensed ExtraBold: wdth 62, wght 800 (the display face)
//   IBM Plex Mono Medium and SemiBold (the data face)
//   Newsreader Italic at opsz 36 (the voice face)
// The files come from the Google Fonts CSS API (static instances).

// The files are read with readFileSync on purpose. With Cache Components,
// an async file read stops the prerender, and the card routes would then
// render on every request instead of once at build time.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(process.cwd(), "assets/fonts");
const load = (file: string) => readFileSync(join(dir, file));

export const DISPLAY = "Archivo";
export const MONO = "Plex Mono";
export const SERIF = "Newsreader";

type FontEntry = {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600 | 800;
  style: "normal" | "italic";
};

let cache: FontEntry[] | null = null;

/** All faces, loaded once per process. */
export function ogFonts(): FontEntry[] {
  cache ??= [
    { name: DISPLAY, data: load("Archivo-ExtraCondensed-ExtraBold.woff"), weight: 800, style: "normal" },
    { name: MONO, data: load("IBMPlexMono-Medium.woff"), weight: 500, style: "normal" },
    { name: MONO, data: load("IBMPlexMono-SemiBold.woff"), weight: 600, style: "normal" },
    { name: SERIF, data: load("Newsreader-Italic-36pt.woff"), weight: 400, style: "italic" },
  ];
  return cache;
}

// Advance widths of the display face, in font units (1000 per em), read
// from the font file. The cards use them to size a name to a given width.
const ADVANCE: Record<string, number> = {
  A: 503, B: 486, C: 508, D: 506, E: 456, F: 398, G: 536, H: 508, I: 245,
  J: 429, K: 505, L: 414, M: 680, N: 512, O: 547, P: 475, Q: 547, R: 501,
  S: 457, T: 461, U: 499, V: 476, W: 707, X: 490, Y: 483, Z: 466,
  "0": 429, "1": 365, "2": 420, "3": 427, "4": 417, "5": 429, "6": 429,
  "7": 383, "8": 418, "9": 429, " ": 118, "-": 241,
};

// Left and right side bearings, in font units, for the first and last
// letters of a line. They let a card place the ink, not the advance box,
// on the margins.
const SIDE: Record<string, [number, number]> = {
  A: [0, 0], B: [46, 15], C: [32, 27], D: [46, 32], E: [46, 24], F: [46, 9],
  G: [32, 37], H: [46, 46], I: [46, 46], J: [5, 38], K: [46, 1], L: [46, 11],
  M: [47, 46], N: [46, 46], O: [32, 32], P: [46, 9], Q: [32, 32], R: [46, 5],
  S: [26, 18], T: [14, 15], U: [41, 41], V: [5, 6], W: [7, 7], X: [-5, -5],
  Y: [-3, 0], Z: [19, 17], "0": [26, 26], "1": [25, 8], "2": [28, 26],
  "3": [19, 25], "4": [10, 11], "5": [25, 25], "6": [26, 24], "7": [4, 7],
  "8": [18, 18], "9": [24, 26],
};

// Vertical metrics of the display face, as fractions of the font size.
const ASCENT = 0.878;
const DESCENT = 0.21;
export const DISPLAY_CAP = 0.686;

/**
 * Distance from the top of a 1em line box to the cap top. Satori centres
 * the ascent and descent in the line box, like a browser.
 */
export const DISPLAY_CAP_TOP = (1 - (ASCENT + DESCENT)) / 2 + ASCENT - DISPLAY_CAP;

/**
 * Ink metrics of an uppercase line in the display face, in em, with the
 * given tracking: the ink width and the left bearing of the first letter.
 */
export function displayInk(text: string, trackingEm: number) {
  const up = text.toUpperCase();
  let units = 0;
  for (const ch of up) units += ADVANCE[ch] ?? 500;
  const first = SIDE[up[0]] ?? [0, 0];
  const last = SIDE[up[up.length - 1]] ?? [0, 0];
  const width = (units - first[0] - last[1]) / 1000 + trackingEm * (up.length - 1);
  return { width, lsb: first[0] / 1000 };
}
