"use client";

import { useEffect, useRef, useState } from "react";

// The back-to-top button at the foot of the page: an ink circle with an
// outline arrow, in the same language as the colophon knob.
//
//   arrive  each time it scrolls into view, the arrow swipes up into the
//           circle from below
//   hover   the arrow swipes up: it leaves through the top while a twin
//           comes up from below, and a light fill grows behind. Hover out
//           swipes it back down the same way.
//   press   the button squeezes a little
//   click   the arrow launches, the page glides to the top, and keyboard
//           focus moves to Home without a second jump
//
// The twin arrow sits one step below the first. On hover the pair moves up
// one step, so the twin lands where the first one was.

const STEP = 32; // the distance between the two arrows: the twin waits fully below the window
const ARROW = "M24 31V17M17.5 23.5L24 17L30.5 23.5";

export function ToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = useState(false);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Fully in view: the arrow swipes in. Fully out of view: reset, so
        // the next arrival swipes in again.
        if (entry.intersectionRatio >= 0.99) setSeen(true);
        else if (!entry.isIntersecting) {
          setSeen(false);
          setLaunched(false);
        }
      },
      { threshold: [0, 0.99] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLaunched(true);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // Keyboard users continue from the top of the page.
    document.querySelector<HTMLElement>(".nav-home")?.focus({ preventScroll: true });
  };

  return (
    <button
      ref={ref}
      type="button"
      className="to-top"
      aria-label="Back to top"
      onClick={toTop}
      data-seen={seen ? "" : undefined}
      data-launched={launched ? "" : undefined}
      data-construct="block"
    >
      <svg viewBox="0 0 48 48" width={48} height={48} aria-hidden focusable="false">
        <defs>
          <clipPath id="to-top-clip">
            <circle cx={24} cy={24} r={22} />
          </clipPath>
        </defs>
        <circle className="to-top-ring" cx={24} cy={24} r={23.375} />
        <g clipPath="url(#to-top-clip)">
          <g className="to-top-rise">
            <g className="to-top-loop">
              <path className="to-top-arrow" d={ARROW} />
              <path className="to-top-arrow" d={ARROW} transform={`translate(0 ${STEP})`} />
            </g>
          </g>
        </g>
      </svg>
    </button>
  );
}
