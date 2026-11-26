import type { CSSProperties } from "react";
import type { PartPin } from "@/lib/parts/types";

// Outline-style pin configuration drawing, as datasheets print it:
// package outline, pin numbers inside, pin names outside. Top view.
// DIP numbering: pins 1 to n/2 run down the left side, the rest run up
// the right side.

const W = 320;
const PITCH = 40;
const LEAD = 22;
const BODY_X = 110;
const BODY_Y = 16;
const BODY_W = 100;

export function Pinout({ pins }: { pins: PartPin[] }) {
  const half = Math.ceil(pins.length / 2);
  const body = { x: BODY_X, y: BODY_Y, w: BODY_W, h: PITCH * (half + 1) };
  const pinY = (row: number) => body.y + PITCH + row * PITCH;
  const cx = body.x + body.w / 2;
  const notch = 9;
  const outline = `M${body.x} ${body.y}H${cx - notch}A${notch} ${notch} 0 0 0 ${cx + notch} ${body.y}H${body.x + body.w}V${body.y + body.h}H${body.x}Z`;
  const H = body.y + body.h + 8;

  return (
    <svg
      className="pinout"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      role="img"
      aria-label={`Pin configuration, ${pins.length}-pin package, top view`}
    >
      <path className="po-body trace" d={outline} pathLength={1} style={{ "--d": "0ms" } as CSSProperties} />
      <circle className="po-dimple" cx={body.x + 14} cy={body.y + 14} r={3.5} />
      {pins.map((p, i) => {
        const left = p.n <= half;
        const row = left ? p.n - 1 : pins.length - p.n;
        const y = pinY(row);
        const x0 = left ? body.x - LEAD : body.x + body.w;
        const style = { "--d": `${180 + i * 45}ms` } as CSSProperties;
        return (
          <g key={p.n} className="po-pin" style={style}>
            <rect className="po-lead" x={x0} y={y - 4} width={LEAD} height={8} />
            <text className="po-num" x={left ? body.x + 8 : body.x + body.w - 8} y={y} dy="0.35em" textAnchor={left ? "start" : "end"}>
              {p.n}
            </text>
            <text className="po-name" x={left ? x0 - 8 : x0 + LEAD + 8} y={y} dy="0.35em" textAnchor={left ? "end" : "start"}>
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
