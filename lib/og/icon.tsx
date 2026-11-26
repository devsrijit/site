// Pixel icons of the SRJ-0001 package: a 12-pin DIP seen from the top,
// pin-1 notch up, with a tiny die window. Each size is drawn on its own
// pixel grid (16 and 32), so every edge falls on a whole pixel.
// The tile is paper, so the icon also reads on a dark tab bar.

import { DIE_PATH, DIE_SIZE } from "./die";
import { C } from "./tokens";

type Grid = number[][]; // 0 paper, 1 ink

// 4 x 4 ordered-dither thresholds.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => (v + 0.5) / 16));

// Light from the upper left and a little in front, like the die photo.
const LIGHT = (() => {
  const v = [-0.45, -0.45, 0.77];
  const l = Math.hypot(...v);
  return v.map((c) => c / l);
})();

/**
 * Paper pixels of a 1-bit sphere, `n` cells across. The photo of the die
 * turns to noise below about 40 px, so the small icons draw the same
 * sphere from its shape: Lambert light from the upper left, then a 4 x 4
 * ordered dither, as in the photo.
 */
function sphereCells(n: number): boolean[][] {
  const r = n / 2;
  return Array.from({ length: n }, (_, cy) =>
    Array.from({ length: n }, (_, cx) => {
      const x = (cx + 0.5 - r) / r;
      const y = (cy + 0.5 - r) / r;
      const d = x * x + y * y;
      if (d > 1) return false;
      const z = Math.sqrt(1 - d);
      const lum = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
      return lum > BAYER[cy % 4][cx % 4];
    }),
  );
}

function blank(n: number): Grid {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function fill(g: Grid, x: number, y: number, w: number, h: number, v: number) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) g[j][i] = v;
}

/** The package drawn on a 16 or 32 pixel grid. */
export function iconGrid(n: 16 | 32): Grid {
  const g = blank(n);
  if (n === 16) {
    fill(g, 4, 1, 8, 14, 1); // body
    fill(g, 7, 1, 2, 1, 0); // pin-1 notch
    for (let k = 0; k < 6; k++) {
      fill(g, 2, 3 + k * 2, 2, 1, 1); // left leads, pins 1 to 6
      fill(g, 12, 3 + k * 2, 2, 1, 1); // right leads, pins 7 to 12
    }
    // Four pixels across is too few for the dither, so the 16 px sphere is
    // drawn by hand: lit upper left, broken up toward the lower right.
    const die = [".##.", "###.", "##.#", ".#.."];
    die.forEach((row, y) => [...row].forEach((c, x) => c === "#" && (g[6 + y][6 + x] = 0)));
  } else {
    fill(g, 8, 2, 16, 28, 1); // body
    fill(g, 14, 2, 4, 2, 0); // pin-1 notch
    fill(g, 15, 4, 2, 1, 0);
    for (let k = 0; k < 6; k++) {
      fill(g, 4, 5 + k * 4, 4, 2, 1); // left leads, pins 1 to 6
      fill(g, 24, 5 + k * 4, 4, 2, 1); // right leads, pins 7 to 12
    }
    const die = sphereCells(10);
    die.forEach((row, y) => row.forEach((on, x) => on && (g[11 + y][11 + x] = 0)));
  }
  return g;
}

/** One SVG path of the ink pixels, one rectangle per run. */
function gridPath(g: Grid): string {
  let d = "";
  g.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (!row[x]) {
        x++;
        continue;
      }
      const x0 = x;
      while (x < row.length && row[x]) x++;
      d += `M${x0} ${y}h${x - x0}v1h${x0 - x}z`;
    }
  });
  return d;
}

/** The icon as JSX for next/og. */
export function IconImage({ n }: { n: 16 | 32 }) {
  return (
    <svg width={n} height={n} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
      <rect width={n} height={n} fill={C.paper} />
      <path d={gridPath(iconGrid(n))} fill={C.ink} />
    </svg>
  );
}

/**
 * The 180 px Apple touch icon: the same package, large enough for the real
 * die photo at 1:1. The tile is opaque because iOS fills transparency with
 * black, and the drawing keeps clear of the rounded corners iOS cuts.
 */
export function AppleIconImage() {
  const S = 180;
  const pitch = 21;
  const bw = 100;
  const bh = pitch * 7;
  const bx = (S - bw) / 2;
  const by = Math.round((S - bh) / 2);
  const lead = { l: 14, t: 9 };
  const cx = S / 2;
  const notch = 9;
  const win = { cx, cy: by + 62, r: 34 };
  const body = `M${bx} ${by}H${cx - notch}A${notch} ${notch} 0 0 0 ${cx + notch} ${by}H${bx + bw}V${by + bh}H${bx}Z`;
  const leadY = (k: number) => by + pitch * (k + 1) - Math.floor(lead.t / 2);
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <defs>
        <clipPath id="apple-window">
          <circle cx={win.cx} cy={win.cy} r={win.r} />
        </clipPath>
      </defs>
      <rect width={S} height={S} fill={C.paper} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <g key={k}>
          <rect x={bx - lead.l} y={leadY(k)} width={lead.l} height={lead.t} fill={C.paper} stroke={C.ink} strokeWidth={2} />
          <rect x={bx + bw} y={leadY(k)} width={lead.l} height={lead.t} fill={C.paper} stroke={C.ink} strokeWidth={2} />
        </g>
      ))}
      <path d={body} fill={C.ink} />
      <g clipPath="url(#apple-window)">
        <rect x={win.cx - DIE_SIZE / 2} y={win.cy - DIE_SIZE / 2} width={DIE_SIZE} height={DIE_SIZE} fill="#000" />
        <path
          d={DIE_PATH}
          fill={C.paper}
          shapeRendering="crispEdges"
          transform={`translate(${win.cx - DIE_SIZE / 2} ${win.cy - DIE_SIZE / 2})`}
        />
      </g>
      <circle cx={win.cx} cy={win.cy} r={win.r} fill="none" stroke={C.rule} strokeWidth={2} />
      <circle cx={bx + 14} cy={by + bh - 14} r={4} fill="none" stroke={C.paper} strokeWidth={1.5} opacity={0.6} />
    </svg>
  );
}
