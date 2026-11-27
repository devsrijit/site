"use client";

import { useEffect, useState } from "react";

// The live issue line: the real time in IST, and a red dot that blinks
// with the seconds. IST is a fixed UTC+05:30 with no daylight saving, so
// the clock adds the offset itself and names no place.

const IST_OFFSET_MS = 330 * 60 * 1000;

const two = (n: number) => String(n).padStart(2, "0");

function read(now: Date): string {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  return `${two(ist.getUTCHours())}:${two(ist.getUTCMinutes())}:${two(ist.getUTCSeconds())}`;
}

export function IssueLine() {
  // The server renders a neutral placeholder. The real time fills in after
  // mount, so the server HTML and the first client render match.
  const [time, setTime] = useState<string | null>(null);

  // Each tick lands just after a whole second, so the digits change on the
  // second. The same tick sets html[data-tick], which blinks both LEDs: on
  // for even seconds, off for odd ones.
  useEffect(() => {
    const root = document.documentElement;
    let id = 0;
    const tick = () => {
      const now = new Date();
      setTime(read(now));
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
    <p className="issue t-label" aria-label="Time in IST">
      <i className="issue-dot" data-live={time ? "" : undefined} aria-hidden />
      <span className="issue-time" data-live={time ? "" : undefined}>
        {time ?? "--:--:--"}
      </span>
      <span className="issue-k">IST</span>
    </p>
  );
}
