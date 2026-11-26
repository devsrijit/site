import type React from "react";
import { wordGeometry } from "@/lib/colophon/geometry";
import { GLYPHS } from "@/lib/colophon/glyphs";
import { ColophonSplit } from "./ColophonSplit";

// The closing artwork. It carries no data: the word "srijit" in the display
// face, half as its vector outline with anchors and handles, half rendered,
// split by a line the visitor can move. The word sits at the right; its
// guides run the full width of the page, labeled at the left edge, like the
// construction lines of a type specimen.

const WORD = wordGeometry("*srijit.");
const LEFT = 160; // space before the word, in font units
const W = LEFT + WORD.width;
const TOP = -820;
const H = 820 + 290;
const VB = `0 ${TOP} ${W} ${H}`;

// The period's right side bearing: the gap between its ink and the end of
// the word. The closing line ends that far in, so the two periods align.
const dot = GLYPHS["."];
const dotInk = Math.max(...(dot.d.match(/-?\d*\.?\d+/g) ?? []).map(Number).filter((_, i) => i % 2 === 0));
const RSB = dot.adv - dotInk;

const GUIDES = [
  { y: WORD.metrics.dot, label: "dot" },
  { y: WORD.metrics.xHeight, label: "x-height" },
  { y: WORD.metrics.baseline, label: "baseline" },
  { y: WORD.metrics.descender, label: "descender" },
];

const A = 15; // anchor square, font units
const R = 6.5; // handle circle radius, font units

export function Colophon() {
  return (
    <footer
      className="colophon page"
      aria-label="Closing"
      style={{ "--colo-ratio": (W / H).toFixed(4), "--colo-rsb": (RSB / H).toFixed(5), "--colo-word": ((W - LEFT) / H).toFixed(5) } as React.CSSProperties}
    >
      <ColophonSplit>
        <svg className="colo-layer colo-guides" viewBox={VB} preserveAspectRatio="xMaxYMax meet" aria-hidden>
          {GUIDES.map((g) => (
            <line
              key={g.label}
              x1={-40 * W}
              x2={W}
              y1={g.y}
              y2={g.y}
              className={g.label === "baseline" ? "colo-base" : undefined}
            />
          ))}
        </svg>
        <div className="colo-labels" aria-hidden>
          {GUIDES.map((g) => (
            <span key={g.label} style={{ top: `${(((g.y - TOP) / H) * 100).toFixed(3)}%` }}>
              {g.label}
            </span>
          ))}
          {/* The two states, on the same row as the first guide label. */}
          <span className="colo-tag-outline" style={{ top: `${(((GUIDES[0].y - TOP) / H) * 100).toFixed(3)}%` }}>
            outline
          </span>
          <span className="colo-tag-rendered" style={{ top: `${(((GUIDES[0].y - TOP) / H) * 100).toFixed(3)}%` }}>
            rendered
          </span>
        </div>

        <svg className="colo-layer colo-outline" viewBox={VB} preserveAspectRatio="xMaxYMax meet" aria-hidden>
          <g transform={`translate(${LEFT} 0)`}>
            {WORD.handles.map((h, i) => (
              <line key={i} className="colo-handle" x1={h.from.x} y1={h.from.y} x2={h.to.x} y2={h.to.y} />
            ))}
            <path className="colo-path" d={WORD.d} />
            {WORD.offs.map((p, i) => (
              <circle key={i} className="colo-off" cx={p.x} cy={p.y} r={R} />
            ))}
            {WORD.anchors.map((p, i) => (
              <rect key={i} className="colo-on" x={p.x - A / 2} y={p.y - A / 2} width={A} height={A} />
            ))}
          </g>
        </svg>

        <svg className="colo-layer colo-render" viewBox={VB} preserveAspectRatio="xMaxYMax meet" aria-hidden>
          <path transform={`translate(${LEFT} 0)`} d={WORD.d} />
        </svg>
        <p className="colo-line t-voice">everything begins as an outline.</p>
      </ColophonSplit>
    </footer>
  );
}
