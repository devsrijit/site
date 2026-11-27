import type { CSSProperties, ReactNode } from "react";
import { isPage } from "@/lib/catalogue";
import { GLYPHS, TIMING, endSymbol, toPath, type NetGeom } from "@/lib/schematic";

export type PinHandlers = {
  onPointerEnter?: (e: React.PointerEvent) => void;
  onPointerLeave?: (e: React.PointerEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: () => void;
};

type Props = {
  net: NetGeom;
  wide: boolean;
  on: boolean;
  handlers?: PinHandlers;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** One pin of the package: its lead, trace, component, end symbol and label. */
export function Pin({ net, wide, on, handlers }: Props) {
  const { pin } = net;
  const d = toPath(net.points);
  const internal = isPage(pin.href);
  // Outside links and files open in a new tab; mailto does not.
  const newTab = !!pin.href && !internal && !pin.href.startsWith("mailto:");
  // The accessible name starts with the visible net name (WCAG 2.5.3).
  // The pin number, the tag, the reference and the destination line are
  // drawing furniture: they sit outside the link, so the only text inside
  // it is the net name. The label carries them in words.
  const label = pin.href
    ? `${pin.name}, ${pin.tag.startsWith("SRJT") ? `${pin.tag} datasheet, page ${pin.dest.replace(/\D/g, "")}` : pin.dest}, pin ${pin.n}`
    : `${pin.name}, ${pin.desc} Pin ${pin.n}`;

  const body: ReactNode = (
    <>
      {/* Hit areas: the trace itself on desktop, plus the label block. */}
      {wide && <path className="net-hit" d={d} />}
      <rect
        className="net-hitbox"
        x={net.hit.x}
        y={net.hit.y}
        width={net.hit.w}
        height={net.hit.h}
        data-shot={wide ? undefined : `pin-${pin.n}`}
      />

      <path className="trace" d={d} pathLength={1} />
      <path className="trace-lit" d={d} pathLength={1} />

      {net.glyph && (
        <g transform={`translate(${net.glyph.x} ${net.glyph.y})`}>
          <g className="glyph">
            <rect
              className="glyph-mask"
              x={-GLYPHS[net.glyph.kind].gap}
              y={-3}
              width={GLYPHS[net.glyph.kind].gap * 2}
              height={6}
            />
            <path className="glyph-sym" d={GLYPHS[net.glyph.kind].d} />
          </g>
        </g>
      )}

      <g className="end">
        {net.endKind === "terminal" ? (
          <circle className="end-term" cx={net.end[0]} cy={net.end[1]} r={wide ? 3.5 : 3} />
        ) : (
          <path className="end-sym" d={endSymbol(net.endKind, net.end)} />
        )}
      </g>

      <rect
        className="lead"
        x={net.lead.x}
        y={net.lead.y}
        width={net.lead.w}
        height={net.lead.h}
        data-shot={wide ? `pin-${pin.n}` : undefined}
      />
      <text className="net-label" x={net.label.x} textAnchor={net.label.anchor}>
        <tspan className="net-name" x={net.label.x} y={net.label.y} dy="0.36em">
          {pin.name}
        </tspan>
      </text>
    </>
  );

  // Drawing furniture, outside the link. Pointer events pass through to
  // the hit areas under it.
  const furniture: ReactNode = (
    <g className="net-furniture" aria-hidden>
      {net.glyph && (
        <g transform={`translate(${net.glyph.x} ${net.glyph.y})`}>
          <g className="glyph">
            <text className="glyph-ref" x={0} y={net.glyph.kind === "led" ? -20 : -14} textAnchor="middle">
              {net.glyph.ref}
            </text>
          </g>
        </g>
      )}
      <text className="pin-num" x={net.num.x} y={net.num.y} dy="0.35em" textAnchor={net.num.anchor}>
        {pad(pin.n)}
      </text>
      <text className="net-label" x={net.label.x} textAnchor={net.label.anchor}>
        <tspan className="net-tag" x={net.label.x} y={net.label.y - (wide ? 13 : 11)}>
          {pin.tag}
        </tspan>
        {wide && (
          <tspan className="net-dest" x={net.label.x} y={net.label.y + 19}>
            {pin.destShort ?? (pin.href ? `${pin.dest} ${internal ? "→" : "↗"}` : pin.dest)}
          </tspan>
        )}
      </text>
    </g>
  );

  // Leads appear just before their traces, in the same order.
  const order = (net.delay - TIMING.traces) / TIMING.traceStep;
  const style = {
    "--d": `${net.delay}ms`,
    "--ld": `${TIMING.leads + order * TIMING.leadStep}ms`,
  } as CSSProperties;

  return (
    <g className="net" data-on={on ? "" : undefined} style={style}>
      {pin.href ? (
        <a
          href={pin.href}
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={label}
          {...handlers}
        >
          {body}
        </a>
      ) : (
        <g role="button" tabIndex={0} aria-label={label} {...handlers}>
          {body}
        </g>
      )}
      {furniture}
    </g>
  );
}
