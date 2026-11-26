"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Holds its drawings undrawn until they scroll into view, then lets the
 * CSS draw-on run once. See [data-draw] in globals.css.
 */
export function DrawOnView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-draw="" data-seen={seen ? "" : undefined}>
      {children}
    </div>
  );
}
