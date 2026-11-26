// The SRJ-0001 package for the share cards: a 12-pin DIP seen from the
// top, turned on its side so it fits under the name. The pin-1 notch is on
// the left edge, so pins 1 to 6 run left to right along the bottom and
// pins 7 to 12 run right to left along the top.
// The die is the 1-bit sphere, drawn as rectangles at a whole-number scale
// with crisp edges, so every source pixel stays a sharp square.

import { DIE_PATH, DIE_SIZE } from "./die";
import { MONO } from "./fonts";
import { C } from "./tokens";

export type ChipProps = {
  /** Pin pitch in px. The body is 7 pitches long. */
  pitch?: number;
  /** Body height in px. */
  bodyH?: number;
  /** Whole-number scale of the 100 x 100 die photo. */
  dieScale?: number;
  /** The lit pin (1 to 6, on the bottom edge), or null for none. */
  lit?: number | null;
  /** Length of the lit trace below its lead, in px. */
  tail?: number;
  /** Font size of the package marking. */
  markSize?: number;
};

const LEAD_W = 22;
const LEAD_L = 26;
const STROKE = 2;

export function chipSize({ pitch = 64, bodyH = 240, tail = 0 }: ChipProps) {
  return { w: pitch * 7 + STROKE * 2, h: LEAD_L * 2 + bodyH + STROKE * 2 + tail };
}

export function Chip(props: ChipProps) {
  const { pitch = 64, bodyH = 240, dieScale = 3, lit = null, tail = 0, markSize = 24 } = props;
  const { w, h } = chipSize(props);

  const bx = STROKE;
  const by = LEAD_L + STROKE;
  const bw = pitch * 7;
  const cy = by + bodyH / 2;
  const notch = Math.round(bodyH / 15);

  // Window for the die, near the notch end; the marking sits to its right.
  const r = Math.round((bodyH - 30) / 2);
  const wcx = bx + 30 + r;
  const wcy = Math.round(cy);
  const img = DIE_SIZE * dieScale;
  const ix = wcx - img / 2;
  const iy = wcy - img / 2;
  const markX = Math.round((wcx + r + bx + bw) / 2);

  const pinX = (i: number) => bx + pitch * (i + 1); // i = 0..5, left to right
  const body = `M${bx} ${by}H${bx + bw}V${by + bodyH}H${bx}V${cy + notch}A${notch} ${notch} 0 0 0 ${bx} ${cy - notch}Z`;

  return (
    <div style={{ display: "flex", position: "relative", width: w, height: h }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <clipPath id="die-window">
            <circle cx={wcx} cy={wcy} r={r} />
          </clipPath>
        </defs>

        {/* Leads: six on the top edge, six on the bottom edge. */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={`t${i}`}
            x={pinX(i) - LEAD_W / 2}
            y={by - LEAD_L}
            width={LEAD_W}
            height={LEAD_L}
            fill={C.paper}
            stroke={C.ink}
            strokeWidth={STROKE}
          />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const on = lit === i + 1;
          return (
            <rect
              key={`b${i}`}
              x={pinX(i) - LEAD_W / 2}
              y={by + bodyH}
              width={LEAD_W}
              height={LEAD_L}
              fill={on ? C.led : C.paper}
              stroke={on ? C.led : C.ink}
              strokeWidth={STROKE}
            />
          );
        })}
        {lit !== null && tail > 0 && (
          <rect x={pinX(lit - 1) - 3} y={by + bodyH + LEAD_L} width={6} height={tail + 4} fill={C.led} />
        )}

        <path d={body} fill={C.ink} />

        <g clipPath="url(#die-window)">
          <rect x={ix} y={iy} width={img} height={img} fill="#000" />
          <path
            d={DIE_PATH}
            fill={C.paper}
            shapeRendering="crispEdges"
            transform={`translate(${ix} ${iy}) scale(${dieScale})`}
          />
        </g>
        <circle cx={wcx} cy={wcy} r={r} fill="none" stroke={C.rule} strokeWidth={3} />
        <circle cx={bx + 24} cy={by + bodyH - 24} r={7} fill="none" stroke={C.paper} strokeWidth={2} opacity={0.6} />
      </svg>

      {/* Package marking. Text sits outside the SVG so Satori sets it in Plex Mono. */}
      <div
        style={{
          position: "absolute",
          left: markX - 120,
          width: 240,
          top: wcy - markSize * 1.3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: markSize,
          lineHeight: 1.3,
          letterSpacing: "0.08em",
          color: C.paper,
        }}
      >
        <span>SRJ-0001N</span>
        <span>DC 2611</span>
      </div>
    </div>
  );
}
