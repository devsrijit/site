"use client";

import { useEffect, useState } from "react";

// The live issue line: the real time in IST and whether the device is
// awake. He works nights, so the awake window is 20:00 to 08:00 IST.
// IST is a fixed UTC+05:30 with no daylight saving, so the clock adds the
// offset itself and names no place.

const IST_OFFSET_MS = 330 * 60 * 1000;

type Reading = { time: string; awake: boolean };

const two = (n: number) => String(n).padStart(2, "0");

function read(now: Date): Reading {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const h = ist.getUTCHours();
  const time = `${two(h)}:${two(ist.getUTCMinutes())}:${two(ist.getUTCSeconds())}`;
  return { time, awake: h >= 20 || h < 8 };
}

export function IssueLine() {
  // The server renders a neutral placeholder. The real time fills in after
  // mount, so the server HTML and the first client render match.
  const [r, setR] = useState<Reading | null>(null);

  // Each tick lands just after a whole second, so the digits change on the
  // second. The same tick sets html[data-tick], which blinks both LEDs: on
  // for even seconds, off for odd ones.
  useEffect(() => {
    const root = document.documentElement;
    let id = 0;
    const tick = () => {
      const now = new Date();
      setR(read(now));
      root.dataset.tick = String(now.getUTCSeconds() % 2);
      id = window.setTimeout(tick, 1000 - now.getMilliseconds() + 5);
    };
    tick();
    return () => {
      window.clearTimeout(id);
      delete root.dataset.tick;
    };
  }, []);

  return (
    <p className="issue t-label" aria-label="Live status">
      <span className="issue-time" data-live={r ? "" : undefined}>
        {r ? r.time : "--:--:--"}
      </span>
      <span className="issue-k">IST</span>
      <span
        className="issue-state"
        data-state={r ? (r.awake ? "awake" : "standby") : "unknown"}
      >
        <i className="issue-dot" aria-hidden />
        {r ? (r.awake ? "Awake" : "Standby") : " "}
      </span>
    </p>
  );
}
