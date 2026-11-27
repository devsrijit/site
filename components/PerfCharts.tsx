import type { PerfFigure, PerfRatio, PerfScatter } from "@/lib/parts/types";

// Typical performance characteristics: small plots in the datasheet style.
// Every figure is drawn twice, wide for desktop and narrow for phones, each
// at 1 viewBox unit = 1 CSS px, so the labels keep their size. CSS shows one.
// Markers are the data. The dashed line between them only guides the eye.

type Size = { w: number; h: number; l: number; r: number; t: number; b: number };

const log = Math.log10;
const scale = (v: number, min: number, max: number, a: number, b: number) =>
  a + ((log(v) - log(min)) / (log(max) - log(min))) * (b - a);

function Scatter({ f, s, cls }: { f: PerfScatter; s: Size; cls: string }) {
  const x0 = s.l;
  const x1 = s.w - s.r;
  const y0 = s.h - s.b; // bottom of the plot
  const y1 = s.t; // top of the plot
  const X = (v: number) => scale(v, f.x.min, f.x.max, x0, x1);
  const Y = (v: number) => scale(v, f.y.min, f.y.max, y0, y1);
  // A range draws from y to y2; its marker sits at the geometric middle.
  const mid = (p: PerfScatter["points"][number]) => (p.y2 ? Math.sqrt(p.y * p.y2) : p.y);
  const guide = f.points.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)} ${Y(mid(p)).toFixed(1)}`).join("");

  return (
    <svg className={`perf ${cls}`} viewBox={`0 0 ${s.w} ${s.h}`} width={s.w} height={s.h} role="img" aria-label={f.title}>
      {f.x.ticks.map((t) => (
        <g key={`x${t.v}`}>
          <line className="perf-grid" x1={X(t.v)} x2={X(t.v)} y1={y1} y2={y0} />
          <text className="perf-tick" x={X(t.v)} y={y0 + 16} textAnchor="middle">{t.label}</text>
        </g>
      ))}
      {f.y.ticks.map((t) => (
        <g key={`y${t.v}`}>
          <line className="perf-grid" x1={x0} x2={x1} y1={Y(t.v)} y2={Y(t.v)} />
          <text className="perf-tick" x={x0 - 8} y={Y(t.v)} dy="0.35em" textAnchor="end">{t.label}</text>
        </g>
      ))}
      <rect className="perf-frame" x={x0} y={y1} width={x1 - x0} height={y0 - y1} />
      <text className="perf-axis" x={x1} y={s.h - 4} textAnchor="end">{f.x.label} →</text>
      <text className="perf-axis" x={x0} y={y1 - 8}>↑ {f.y.label}</text>

      <path className="perf-guide" d={guide} />
      {f.points.map((p) => {
        const cx = X(p.x);
        const cy = Y(mid(p));
        return (
          <g key={p.label}>
            {p.y2 && (
              <path className="perf-range" d={`M${cx - 4} ${Y(p.y)}H${cx + 4}M${cx} ${Y(p.y)}V${Y(p.y2)}M${cx - 4} ${Y(p.y2)}H${cx + 4}`} />
            )}
            <rect className="perf-mark" x={cx - 3.5} y={cy - 3.5} width={7} height={7} />
            <text className="perf-label" x={cx + p.dx} y={cy + p.dy} dy="0.35em" textAnchor={p.anchor ?? "start"}>
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Row height of the ratio plot. Narrow rows put the values on a line of
 *  their own, under the label. */
const rowH = (stack: boolean) => (stack ? 62 : 46);

function Ratio({ f, s, cls, stack }: { f: PerfRatio; s: Size; cls: string; stack: boolean }) {
  const x0 = s.l;
  const x1 = s.w - s.r;
  const X = (v: number) => scale(v, 1, f.max, x0, x1);
  const row = rowH(stack);
  const barY = stack ? 34 : 18;
  const top = s.t;
  const axisY = top + f.rows.length * row + 4;
  const ticks = [1, 10, 100, 1e3, 1e4, 1e5, 1e6].filter((v) => v <= f.max);
  const tick = (v: number) => (v >= 1e6 ? `${v / 1e6}M×` : v >= 1e3 ? `${v / 1e3}k×` : `${v}×`);
  const ratio = (r: PerfRatio["rows"][number]) => `${r.approx ? "about " : ""}${r.ratio.toLocaleString("en-US")}×`;
  // The value label sits in the bar band, after the bar. A grid line that
  // would cross it is left out. RATIO_CH is one glyph of .perf-ratio: 12 px
  // IBM Plex Mono, 0.6 em wide.
  const RATIO_CH = 12 * 0.6;
  const hitsLabel = (v: number, r: PerfRatio["rows"][number]) => {
    const l = X(r.ratio) + 6;
    return X(v) >= l - 4 && X(v) <= l + ratio(r).length * RATIO_CH + 4;
  };

  return (
    <svg className={`perf ${cls}`} viewBox={`0 0 ${s.w} ${s.h}`} width={s.w} height={s.h} role="img" aria-label={f.title}>
      {/* Grid lines run only through the bar bands, never through text. */}
      {ticks.map((v) => (
        <g key={v}>
          {f.rows.map((r, i) =>
            hitsLabel(v, r) ? null : (
              <line key={r.label} className="perf-grid" x1={X(v)} x2={X(v)} y1={top + i * row + barY - 4} y2={top + i * row + barY + 13} />
            ),
          )}
          <text className="perf-tick" x={X(v)} y={axisY + 16} textAnchor={v === 1 ? "start" : "middle"}>{tick(v)}</text>
        </g>
      ))}
      {/* The header of the value column. */}
      <text className="perf-head" x={stack ? x0 + 8 : x1} y={top - 14} textAnchor={stack ? "start" : "end"}>
        {f.a} · {f.b}
      </text>
      <line className="perf-base" x1={x0} x2={x0} y1={top - 4} y2={axisY} />
      <line className="perf-base" x1={x0} x2={x1} y1={axisY} y2={axisY} />
      {f.rows.map((r, i) => {
        const y = top + i * row;
        const end = X(r.ratio);
        return (
          <g key={r.label}>
            <text className="perf-label" x={x0 + 8} y={y + 10}>{r.label}</text>
            <text className="perf-tick" x={stack ? x0 + 8 : x1} y={y + (stack ? 26 : 10)} textAnchor={stack ? "start" : "end"}>
              {r.a} · {r.b}
            </text>
            <rect className="perf-bar" x={x0} y={y + barY} width={end - x0} height={9} />
            <text className="perf-ratio" x={end + 6} y={y + barY + 4.5} dy="0.35em">{ratio(r)}</text>
          </g>
        );
      })}
      <text className="perf-axis" x={x1} y={s.h - 4} textAnchor="end">{f.b} ÷ {f.a} →</text>
    </svg>
  );
}

const SIZES = {
  scatter: { wide: { w: 560, h: 300, l: 62, r: 14, t: 26, b: 44 }, narrow: { w: 328, h: 260, l: 56, r: 10, t: 26, b: 44 } },
  ratio: { wide: { w: 560, h: 0, l: 0, r: 76, t: 30, b: 40 }, narrow: { w: 328, h: 0, l: 0, r: 70, t: 30, b: 40 } },
};

function Figure({ f }: { f: PerfFigure }) {
  if (f.kind === "scatter") {
    return (
      <>
        <Scatter f={f} s={SIZES.scatter.wide} cls="perf--wide" />
        <Scatter f={f} s={SIZES.scatter.narrow} cls="perf--narrow" />
      </>
    );
  }
  // The ratio plot is as tall as its rows.
  const h = (s: Size, stack: boolean) => ({ ...s, h: s.t + f.rows.length * rowH(stack) + 4 + s.b });
  return (
    <>
      <Ratio f={f} s={h(SIZES.ratio.wide, false)} cls="perf--wide" stack={false} />
      <Ratio f={f} s={h(SIZES.ratio.narrow, true)} cls="perf--narrow" stack />
    </>
  );
}

export function PerfCharts({ figures, first }: { figures: PerfFigure[]; first: number }) {
  return (
    <div className="perf-figs">
      {figures.map((f, i) => (
        <figure key={f.title} className="perf-fig">
          <figcaption className="perf-cap">
            Figure {first + i}. {f.title}
          </figcaption>
          <Figure f={f} />
          <p className="perf-cond">{f.conditions}</p>
          {f.kind === "ratio" && <p className="perf-note">{f.note}</p>}
        </figure>
      ))}
    </div>
  );
}
