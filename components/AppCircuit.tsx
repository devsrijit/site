import type { CSSProperties } from "react";
import { toPath, type Pt } from "@/lib/schematic";
import type { CircuitSym, NarrowCircuit, WideCircuit } from "@/lib/parts/types";

// Figure: a part's typical application, drawn as a circuit.
// The wide drawing is placed by hand in each part file. The narrow
// drawing (phones) is laid out here from a vertical signal chain, so it
// draws at 1 viewBox unit = 1 CSS px and every label keeps its size.

const delay = (d: number) => ({ "--d": `${d}ms` }) as CSSProperties;

function Sym({ s }: { s: CircuitSym }) {
  switch (s.kind) {
    // Clock source: a circle with a square wave.
    case "clock":
      return (
        <g className="glyph" style={delay(s.d)}>
          <circle className="ac-sym" cx={s.cx} cy={s.cy} r={12} />
          <path className="ac-sym" d={`M${s.cx - 8} ${s.cy + 3}H${s.cx - 5}V${s.cy - 4}H${s.cx}V${s.cy + 3}H${s.cx + 5}V${s.cy - 4}H${s.cx + 8}`} />
        </g>
      );
    case "display":
      return (
        <g className="glyph" style={delay(s.d)}>
          <rect className="ac-sym" x={s.x} y={s.y} width={28} height={34} />
          <rect className="ac-sym" x={s.x + 5} y={s.y + 5} width={18} height={18} />
        </g>
      );
    case "term":
      return (
        <g className="end" style={delay(s.d)}>
          <circle className="end-term" cx={s.cx} cy={s.cy} r={3.5} />
        </g>
      );
    case "path":
      return (
        <g className="glyph" style={delay(s.d)}>
          <path className="ac-sym" d={s.path} />
        </g>
      );
  }
}

function Wide({ c, label }: { c: WideCircuit; label: string }) {
  return (
    <svg className="ac ac--wide" viewBox={`0 0 ${c.w} ${c.h}`} width={c.w} height={c.h} role="img" aria-label={label}>
      {c.wires.map((w, i) =>
        w.bus ? (
          <g key={i} className="ac-bus" style={delay(w.d)}>
            <path className="trace" d={toPath(w.pts.map(([x, y]) => [x, y - 4]))} pathLength={1} />
            <path className="trace" d={toPath(w.pts.map(([x, y]) => [x, y + 4]))} pathLength={1} />
          </g>
        ) : (
          <path key={i} className="trace" d={toPath(w.pts)} pathLength={1} style={delay(w.d)} />
        ),
      )}

      {c.blocks.map((b) => {
        // A block with no lines carries its title in the middle.
        const titleY = b.lines.length ? b.y + 34 : b.y + b.h / 2;
        return (
          <g key={b.ref} style={delay(b.d)}>
            <rect className="ac-box trace" x={b.x} y={b.y} width={b.w} height={b.h} pathLength={1} />
            <g className="net-label">
              <text className="ac-ref" x={b.x} y={b.y - 8}>{b.ref}</text>
              <text className="ac-title" x={b.x + b.w / 2} y={titleY} dy={b.lines.length ? undefined : "0.35em"} textAnchor="middle">
                {b.title}
              </text>
              {b.lines.map((l, i) => (
                <text key={i} className="ac-line" x={b.x + b.w / 2} y={b.y + 54 + i * 15} textAnchor="middle">{l}</text>
              ))}
            </g>
          </g>
        );
      })}

      {c.syms.map((s, i) => (
        <Sym key={i} s={s} />
      ))}

      {c.labels.map((l, i) => (
        <text
          key={i}
          className={`net-label ${l.cls ?? "ac-text"}`}
          x={l.x}
          y={l.y}
          dy="0.35em"
          textAnchor={l.anchor ?? "start"}
          style={delay(l.d)}
        >
          {l.text}
        </text>
      ))}
    </svg>
  );
}

// ---------- narrow layout ----------

const NW = 288; // fits a 320 px phone at 1:1
const SPINE = 30; // x of the signal spine
const BOX = { x: 6, w: 252 }; // blocks; the loop runs to the right of them
const LOOP_X = 270;
const WIRE = 46; // length of a labelled wire
const STUB = 22; // length of an unlabelled wire between two parts
const STEP = 110; // draw-on delay between steps, ms

type Item =
  | { t: "wire"; y0: number; y1: number; label?: string; d: number }
  | { t: "block"; y: number; h: number; ref: string; title: string; lines: string[]; d: number }
  | { t: "term"; y: number; ref: string; label: string; d: number };

function layoutNarrow(c: NarrowCircuit) {
  const items: Item[] = [];
  let y = 26;
  let d = 0;
  let prev: "in" | "wire" | "block" | "out" | null = null;
  const blocks: { top: number; mid: number; bottom: number }[] = [];

  for (const s of c.steps) {
    // Two parts in a row get a short plain wire between them.
    if ((s.kind === "block" || s.kind === "out") && prev && prev !== "wire") {
      items.push({ t: "wire", y0: y, y1: y + STUB, d });
      y += STUB;
    }
    if (s.kind === "in" || s.kind === "out") {
      items.push({ t: "term", y, ref: s.ref, label: s.label, d });
    } else if (s.kind === "wire") {
      items.push({ t: "wire", y0: y, y1: y + WIRE, label: s.label, d });
      y += WIRE;
    } else {
      const h = 44 + s.lines.length * 17;
      items.push({ t: "block", y, h, ref: s.ref, title: s.title, lines: s.lines, d });
      blocks.push({ top: y, mid: y + h / 2, bottom: y + h });
      y += h;
    }
    prev = s.kind;
    d += STEP;
  }

  let loop: { path: Pt[]; label: string; d: number } | null = null;
  if (c.loop && blocks.length > 1) {
    const first = blocks[0];
    const last = blocks[blocks.length - 1];
    loop = {
      // The loop leaves near the bottom of the last block and returns near
      // the top of the first, so its label has the full height to run in.
      path: [
        [BOX.x + BOX.w, last.bottom - 14],
        [LOOP_X, last.bottom - 14],
        [LOOP_X, first.top + 14],
        [BOX.x + BOX.w, first.top + 14],
      ],
      label: c.loop,
      d,
    };
  }
  return { items, loop, h: y + 14 };
}

function Narrow({ c, label }: { c: NarrowCircuit; label: string }) {
  const { items, loop, h } = layoutNarrow(c);
  return (
    <svg className="ac ac--narrow" viewBox={`0 0 ${NW} ${h}`} width={NW} height={h} role="img" aria-label={label}>
      {items.map((it, i) => {
        if (it.t === "wire") {
          return (
            <g key={i}>
              <path className="trace" d={`M${SPINE} ${it.y0}V${it.y1}`} pathLength={1} style={delay(it.d)} />
              {it.label && (
                <text className="net-label ac-text" x={SPINE + 14} y={(it.y0 + it.y1) / 2} dy="0.35em" style={delay(it.d)}>
                  {it.label}
                </text>
              )}
            </g>
          );
        }
        if (it.t === "term") {
          return (
            <g key={i}>
              <g className="end" style={delay(it.d)}>
                <circle className="end-term" cx={SPINE} cy={it.y} r={3.5} />
              </g>
              <text className="net-label" x={SPINE + 14} y={it.y} dy="0.35em" style={delay(it.d)}>
                <tspan className="ac-ref">{it.ref}</tspan>
                <tspan className="ac-text" dx={10}>{it.label}</tspan>
              </text>
            </g>
          );
        }
        const cx = BOX.x + BOX.w / 2;
        return (
          <g key={i} style={delay(it.d)}>
            <rect className="ac-box trace" x={BOX.x} y={it.y} width={BOX.w} height={it.h} pathLength={1} />
            <g className="net-label">
              <text className="ac-ref" x={BOX.x + BOX.w - 8} y={it.y + 16} textAnchor="end">{it.ref}</text>
              <text className="ac-title" x={cx} y={it.y + 27} textAnchor="middle">{it.title}</text>
              {it.lines.map((l, j) => (
                <text key={j} className="ac-line" x={cx} y={it.y + 48 + j * 17} textAnchor="middle">{l}</text>
              ))}
            </g>
          </g>
        );
      })}
      {loop && (
        <g>
          <path className="trace" d={toPath(loop.path)} pathLength={1} style={delay(loop.d)} />
          <text
            className="net-label ac-pin"
            x={LOOP_X + 10}
            y={(loop.path[1][1] + loop.path[2][1]) / 2}
            textAnchor="middle"
            transform={`rotate(-90 ${LOOP_X + 10} ${(loop.path[1][1] + loop.path[2][1]) / 2})`}
            dy="0.35em"
            style={delay(loop.d)}
          >
            {loop.label}
          </text>
        </g>
      )}
    </svg>
  );
}

export function AppCircuit({
  wide,
  narrow,
  label,
}: {
  wide: WideCircuit;
  narrow: NarrowCircuit;
  label: string;
}) {
  return (
    <>
      <Wide c={wide} label={label} />
      <Narrow c={narrow} label={label} />
    </>
  );
}
