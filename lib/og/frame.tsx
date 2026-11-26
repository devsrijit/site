// Shared pieces of the share cards: the 1200 x 630 frame, the masthead,
// the edge-to-edge display line, the part badge and the package in the
// lower right. app/opengraph-image.tsx and lib/og/partCard.tsx use them.

import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { Chip, chipSize } from "./Chip";
import { DISPLAY, DISPLAY_CAP_TOP, MONO, SERIF, displayInk, ogFonts } from "./fonts";
import { C } from "./tokens";

export const CARD = { width: 1200, height: 630 };

export const M = 48; // outer margin
const TRACK = -0.012; // display tracking, from .t-display
const NAME_CAP_TOP = 92; // y of the cap top of the big name
const NAME_MAX = 236; // largest font size: keeps the name above the package

function Masthead({ left, right }: { left: [string, string]; right: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: M,
        right: M,
        top: 30,
        height: 42,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        borderBottom: `4px solid ${C.ink}`,
        fontFamily: MONO,
        fontSize: 20,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <div style={{ display: "flex", gap: 22 }}>
        <span style={{ fontWeight: 600, color: C.ink }}>{left[0]}</span>
        <span style={{ fontWeight: 500, color: C.grey }}>{left[1]}</span>
      </div>
      <span style={{ fontWeight: 600, color: C.ink }}>{right}</span>
    </div>
  );
}

/**
 * A line in the display face. The font size makes the ink, not the advance
 * box, fill `width` from the left margin, up to `max` px.
 */
function DisplayLine({ text, width, max, capTop }: { text: string; width: number; max: number; capTop: number }) {
  const ink = displayInk(text, TRACK);
  const size = Math.min(max, Math.floor(width / ink.width));
  return (
    <div
      style={{
        position: "absolute",
        left: M - Math.round(size * ink.lsb),
        top: capTop - Math.round(size * DISPLAY_CAP_TOP),
        display: "flex",
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: `${TRACK}em`,
        textTransform: "uppercase",
        color: C.ink,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

export function PartBadge({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        border: `2px solid ${C.ink}`,
        padding: "3px 10px 2px",
        fontFamily: MONO,
        fontWeight: 600,
        fontSize: 22,
        letterSpacing: "0.06em",
        color: C.ink,
      }}
    >
      {text}
    </div>
  );
}

/** Title in the display face, under the name. */
export function Title({ lines, size = 64 }: { lines: string[]; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontFamily: DISPLAY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.94,
        letterSpacing: `${TRACK}em`,
        textTransform: "uppercase",
      }}
    >
      {lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}

/** A sentence in the serif italic: the voice face. */
export function Voice({ children, size = 50 }: { children: ReactNode; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: SERIF,
        fontStyle: "italic",
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.12,
      }}
    >
      {children}
    </div>
  );
}

type CardProps = {
  masthead: [string, string];
  name: string;
  /** Lit pin on the package (1 to 6), or null. */
  lit: number | null;
  /** The text column under the name, left of the package. */
  children: ReactNode;
};

/**
 * One card: masthead, the name edge to edge, a text column, and the
 * package in the lower right. The lit pin's trace runs off the bottom edge.
 */
export function renderCard({ masthead, name, lit, children }: CardProps) {
  const chip = { pitch: 64, bodyH: 240, dieScale: 3, lit, tail: 60 };
  const cs = chipSize(chip);
  const chipTop = CARD.height - cs.h + 4;
  const bodyTop = chipTop + 28; // lead length plus stroke
  const bodyBottom = bodyTop + chip.bodyH;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: C.paper,
          color: C.ink,
        }}
      >
        <Masthead left={masthead} right="srijit.me" />
        <DisplayLine text={name} width={CARD.width - M * 2} max={NAME_MAX} capTop={NAME_CAP_TOP} />

        <div
          style={{
            position: "absolute",
            left: M,
            top: bodyTop,
            height: bodyBottom - bodyTop,
            width: CARD.width - M * 2 - cs.w - 32,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>

        <div style={{ position: "absolute", right: M - 2, top: chipTop, display: "flex" }}>
          <Chip {...chip} />
        </div>
      </div>
    ),
    { ...CARD, fonts: ogFonts() },
  );
}
