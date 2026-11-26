"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PINS, isPage } from "@/lib/catalogue";
import { buildLayout, type Layout } from "@/lib/schematic";
import { Pin, type PinHandlers } from "./Pin";

const WIDE = buildLayout("wide");
const NARROW = buildLayout("narrow");

/** Body outline with the pin-1 notch cut into the top edge. */
function outline({ body: b, notch }: Layout) {
  const cx = b.x + b.w / 2;
  return `M${b.x} ${b.y}H${cx - notch}A${notch} ${notch} 0 0 0 ${cx + notch} ${b.y}H${b.x + b.w}V${b.y + b.h}H${b.x}Z`;
}

function Package({ layout }: { layout: Layout }) {
  const clip = useId();
  const { window: w, marking: m } = layout;
  const d = outline(layout);
  return (
    <g className="pkg">
      <path className="pkg-fill" d={d} />
      <path className="pkg-outline" d={d} pathLength={1} />
      <circle className="pkg-dimple" cx={layout.dimple[0]} cy={layout.dimple[1]} r={layout.variant === "wide" ? 5 : 3.5} />
      <clipPath id={clip}>
        <circle cx={w.cx} cy={w.cy} r={w.r} />
      </clipPath>
      {/* The die photo: his 1-bit sphere, 100 x 100 source pixels drawn at a
          whole-number scale behind a quartz window, like a UV EPROM. */}
      <g clipPath={`url(#${clip})`}>
        <image
          className="die"
          href="/avatar-dsphere-100.png"
          x={w.cx - w.img / 2}
          y={w.cy - w.img / 2}
          width={w.img}
          height={w.img}
        />
      </g>
      <circle className="pkg-window" cx={w.cx} cy={w.cy} r={w.r} />
      <text className="pkg-mark" x={m.x} y={m.y} textAnchor="middle" fontSize={m.size}>
        <tspan x={m.x}>SRJ-0001N</tspan>
        <tspan x={m.x} dy="1.35em">DC 2611</tspan>
      </text>
    </g>
  );
}

type DrawingProps = {
  layout: Layout;
  active: number | null;
  handlersFor: (n: number) => PinHandlers;
};

function Drawing({ layout, active, handlersFor }: DrawingProps) {
  const wide = layout.variant === "wide";
  return (
    <svg
      className={`sch sch--${layout.variant}`}
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      width={layout.w}
      height={layout.h}
      data-active={active !== null ? "" : undefined}
      role="group"
      aria-label="SRJ-0001 pin diagram. Each pin links to a project or a contact."
    >
      <Package layout={layout} />
      {layout.nets.map((net) => (
        <Pin
          key={net.pin.n}
          net={net}
          wide={wide}
          on={active === net.pin.n}
          handlers={handlersFor(net.pin.n)}
        />
      ))}
    </svg>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

const isInternal = isPage;

export function Schematic() {
  const router = useRouter();
  const [active, setActive] = useState<number | null>(null);
  const pin = PINS.find((p) => p.n === active) ?? null;

  // Hover lights a pin only on a real mouse: (hover: hover) and (pointer: fine).
  const fine = useRef(false);
  const lastPointer = useRef<string>("mouse");
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => (fine.current = mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Snappy hover: a pin lights the instant the pointer arrives. Letting go
  // waits 80 ms, and entering another pin cancels it, so a move between pins
  // is one handoff, not off-then-on.
  const enterTimer = useRef(0);
  const leaveTimer = useRef(0);
  const activeRef = useRef<number | null>(null);
  activeRef.current = active;
  useEffect(
    () => () => {
      window.clearTimeout(enterTimer.current);
      window.clearTimeout(leaveTimer.current);
    },
    [],
  );

  const release = (n: number) => setActive((cur) => (cur === n ? null : cur));
  const hoverIn = (n: number) => {
    window.clearTimeout(leaveTimer.current);
    window.clearTimeout(enterTimer.current);
    setActive(n);
  };
  const hoverOut = (n: number) => {
    window.clearTimeout(enterTimer.current);
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => release(n), 80);
  };

  const handlersFor = (n: number): PinHandlers => ({
    onPointerDown: (e) => {
      lastPointer.current = e.pointerType;
    },
    onPointerEnter: (e) => {
      if (e.pointerType === "mouse" && fine.current) {
        hoverIn(n);
        const href = PINS.find((p) => p.n === n)?.href ?? null;
        if (isInternal(href)) router.prefetch(href);
      }
    },
    onPointerLeave: (e) => {
      if (e.pointerType === "mouse") hoverOut(n);
    },
    // Keyboard focus lights the pin like a hover. Pointer focus does not,
    // so the first tap on a phone stays a "probe" and does not open the link.
    onFocus: (e) => {
      if ((e.target as Element).matches(":focus-visible")) setActive(n);
    },
    onBlur: () => release(n),
    onClick: (e) => {
      const keyboard = e.detail === 0;
      const href = PINS.find((p) => p.n === n)?.href;
      if (!href) {
        // VCC and GND only light up.
        setActive((cur) => (cur === n && !keyboard ? null : n));
        return;
      }
      // Touch: the first tap lights the pin, the second tap opens it.
      if (!keyboard && lastPointer.current !== "mouse" && active !== n) {
        e.preventDefault();
        setActive(n);
        if (isInternal(href)) router.prefetch(href);
        return;
      }
      // A part pin opens its datasheet page with a client-side navigation.
      // A modified click keeps the browser default (new tab, new window).
      if (isInternal(href) && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) {
        e.preventDefault();
        router.push(href);
      }
    },
  });

  return (
    <figure className="fig" data-construct-col>
      <div className="fig-draw" data-construct="block">
        <Drawing layout={WIDE} active={active} handlersFor={handlersFor} />
        <Drawing layout={NARROW} active={active} handlersFor={handlersFor} />
      </div>
      <figcaption className="fig-cap" data-construct="block">
        <span className="fig-title">Figure 1. Typical application</span>
        <span className="probe" aria-live="polite">
          <span className="probe-line">
            <span className="probe-k">Probe</span>
            {pin ? (
              <span className="probe-now" key={pin.n}>
                <span className="probe-pin">
                  Pin {pad(pin.n)} · {pin.tag.startsWith("SRJ") ? `${pin.tag} ${pin.name}` : `${pin.name} (${pin.tag})`}
                </span>
                {pin.href && isInternal(pin.href) ? (
                  <Link className="probe-open" href={pin.href}>
                    {pin.dest}<span className="go" aria-hidden>→</span>
                  </Link>
                ) : pin.href?.startsWith("mailto:") ? (
                  <a className="probe-open" href={pin.href}>
                    {pin.dest}<span className="go go--out" aria-hidden>↗</span>
                  </a>
                ) : pin.href ? (
                  <a className="probe-open" href={pin.href} target="_blank" rel="noopener noreferrer">
                    {pin.dest}<span className="go go--out" aria-hidden>↗</span>
                  </a>
                ) : (
                  <span className="probe-open">{pin.dest}</span>
                )}
              </span>
            ) : (
              <span className="probe-idle">
                <span className="when-hover">Hover a pin to trace its net.</span>
                <span className="when-touch">Tap a pin to trace its net. Tap again to open it.</span>
              </span>
            )}
          </span>
          <span className="probe-desc t-voice" key={pin ? pin.n : "idle"}>{pin ? pin.desc : "\u00a0"}</span>
        </span>
      </figcaption>
    </figure>
  );
}
