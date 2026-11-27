// The favicon is the die window from the chip: the dithered sphere behind
// a grey quartz ring. Each small size (16 and 32) is drawn on its own
// pixel grid, so every edge falls on a whole pixel. Outside the ring the
// tile is clear, so the round icon sits on a light or a dark tab bar.

import { DIE_PATH, DIE_SIZE } from "./die";
import { C } from "./tokens";

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

/** The window on an `n` pixel grid: a ring `ring` pixels wide around a
 *  sphere of radius `r`, both centred on the tile. */
const WINDOW = {
  16: { r: 6, ring: 1 },
  32: { r: 13, ring: 2 },
} as const;

type Cell = "clear" | "ring" | "ink" | "paper";

export function windowGrid(n: 16 | 32): Cell[][] {
  const { r, ring } = WINDOW[n];
  const lit = sphereCells(r * 2);
  const o = n / 2 - r; // offset of the sphere cells in the tile
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x): Cell => {
      const d = Math.hypot(x + 0.5 - n / 2, y + 0.5 - n / 2);
      if (d <= r) return lit[y - o]?.[x - o] ? "paper" : "ink";
      if (d <= r + ring) return "ring";
      return "clear";
    }),
  );
}

/** One SVG path of the cells of one kind, one rectangle per run. */
function cellPath(g: Cell[][], kind: Cell): string {
  let d = "";
  g.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      if (row[x] !== kind) {
        x++;
        continue;
      }
      const x0 = x;
      while (x < row.length && row[x] === kind) x++;
      d += `M${x0} ${y}h${x - x0}v1h${x0 - x}z`;
    }
  });
  return d;
}

/** The icon as JSX for next/og. */
export function IconImage({ n }: { n: 16 | 32 }) {
  const g = windowGrid(n);
  return (
    <svg width={n} height={n} viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
      <path d={cellPath(g, "ink")} fill={C.ink} />
      <path d={cellPath(g, "paper")} fill={C.paper} />
      <path d={cellPath(g, "ring")} fill={C.rule} />
    </svg>
  );
}

/**
 * The 180 px Apple touch icon: the real die photo at 2x behind the same
 * window as the chip on the cover (radius 0.35 of the photo). The tile is
 * opaque ink because iOS fills transparency with black, and the window
 * keeps clear of the rounded corners iOS cuts.
 */
export function AppleIconImage() {
  const S = 180;
  const img = DIE_SIZE * 2;
  const r = 70;
  const c = S / 2;
  return (
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
      <defs>
        <clipPath id="apple-window">
          <circle cx={c} cy={c} r={r} />
        </clipPath>
      </defs>
      <rect width={S} height={S} fill={C.ink} />
      <g clipPath="url(#apple-window)">
        <rect x={c - img / 2} y={c - img / 2} width={img} height={img} fill="#000" />
        <path
          d={DIE_PATH}
          fill={C.paper}
          shapeRendering="crispEdges"
          transform={`translate(${c - img / 2} ${c - img / 2}) scale(2)`}
        />
      </g>
      <circle cx={c} cy={c} r={r} fill="none" stroke={C.rule} strokeWidth={4} />
    </svg>
  );
}
