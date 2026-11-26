// A damped spring, sampled into a CSS linear() easing. The animation then
// runs as a normal WAAPI animation: it is composited, and cancel() stops it
// at once.

export type Spring = { easing: string; duration: number };

/** Mass 1. The defaults overshoot by about 8 % and settle in about 580 ms. */
export function spring(stiffness = 380, damping = 24): Spring {
  const w0 = Math.sqrt(stiffness);
  const zeta = damping / (2 * w0);
  const wd = w0 * Math.sqrt(Math.max(1e-6, 1 - zeta * zeta));
  const x = (t: number) =>
    zeta < 1
      ? 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
      : 1 - Math.exp(-w0 * t) * (1 + w0 * t);

  // Settled: the envelope is under 0.1 % of the travel.
  const duration = Math.min(1.2, 6.9 / (zeta * w0));
  const n = 48;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const v = i === n ? 1 : x((i / n) * duration);
    pts.push(String(Math.round(v * 10000) / 10000));
  }

  const supported = typeof CSS !== "undefined" && CSS.supports("animation-timing-function", "linear(0, 1)");
  return {
    easing: supported ? `linear(${pts.join(", ")})` : "cubic-bezier(0.34, 1.36, 0.64, 1)",
    duration: Math.round(duration * 1000),
  };
}
