"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Moves the split between "outline" and "rendered" by drag. While the
 * pointer is down the line sits exactly under it, with no smoothing, so fast
 * and jittery moves never lag. A click away from the line glides it there on
 * a short spring. The handle is also a slider for the keyboard: arrows move it
 * by 2%, Home and End jump to the ends. With reduced motion every move is
 * direct.
 */
export function ColophonSplit({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const handle = knob.current;
    if (!el || !handle) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MIN = 0.005;
    const MAX = 0.995;
    let pos = 0.56;
    let vel = 0;
    let target = pos;
    let raf = 0;
    let last = 0;
    let dragging = false;

    const paint = () => {
      el.style.setProperty("--split", `${(pos * 100).toFixed(3)}%`);
      handle.setAttribute("aria-valuenow", String(Math.round(pos * 100)));
    };

    const step = (t: number) => {
      const dt = Math.min(0.032, last ? (t - last) / 1000 : 0.016);
      last = t;
      // Critically damped spring, about 0.25 s to settle.
      const k = 320;
      const c = 2 * Math.sqrt(k);
      vel += (k * (target - pos) - c * vel) * dt;
      pos += vel * dt;
      paint();
      if (Math.abs(target - pos) > 0.0005 || Math.abs(vel) > 0.0005) {
        raf = requestAnimationFrame(step);
      } else {
        pos = target;
        vel = 0;
        paint();
        raf = 0;
        last = 0;
      }
    };

    const glide = (to: number) => {
      target = Math.min(MAX, Math.max(MIN, to));
      if (reduce) {
        pos = target;
        paint();
      } else if (!raf) raf = requestAnimationFrame(step);
    };

    const snap = (to: number) => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      vel = 0;
      pos = target = Math.min(MAX, Math.max(MIN, to));
      paint();
    };

    const at = (clientX: number) => {
      const r = el.getBoundingClientRect();
      return (clientX - r.left) / r.width;
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const x = at(e.clientX);
      // A press on or near the line grabs it; a press elsewhere glides it there.
      const nearLine = Math.abs(x - pos) * el.getBoundingClientRect().width < 28;
      dragging = true;
      el.setPointerCapture(e.pointerId);
      el.dataset.drag = "";
      if (nearLine) snap(x);
      else glide(x);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      snap(at(e.clientX));
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      delete el.dataset.drag;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const onKey = (e: KeyboardEvent) => {
      const by = e.shiftKey ? 0.1 : 0.02;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") glide(target - by);
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") glide(target + by);
      else if (e.key === "Home") glide(MIN);
      else if (e.key === "End") glide(MAX);
      else return;
      e.preventDefault();
    };

    paint();
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    handle.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      handle.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="colo-art">
      {children}
      <div className="colo-split">
        <span
          ref={knob}
          className="colo-knob"
          role="slider"
          tabIndex={0}
          aria-label="Outline and rendered split"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={56}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
            <path d="M6 4 2 8l4 4M10 4l4 4-4 4" />
          </svg>
        </span>
      </div>
    </div>
  );
}
