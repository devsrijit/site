// The share card for one part in the catalogue, in the style of the home
// card. The part name runs edge to edge (up to the size of the home name),
// the one-liner sits under it in the voice face, and the package lights the
// pin that belongs to the part: pin n for SRJ-00n.
//
// Use it from a part route's opengraph-image.tsx:
//   export default () => renderPartCard({ part: "SRJ-002", name: "BLACKBOX", oneLiner: "..." });

import { PartBadge, Voice, renderCard } from "./frame";
import { MONO } from "./fonts";
import { C } from "./tokens";

export type PartCardInput = {
  /** Part number, for example "SRJ-002". */
  part: string;
  /** Part name, for example "BLACKBOX". */
  name: string;
  /** One sentence. Up to about 90 characters fit; past 60 the type gets smaller. */
  oneLiner: string;
};

export function partAlt({ part, name, oneLiner }: PartCardInput) {
  return `${part} ${name}: ${oneLiner} A part of SRJ-0001, Srijit Ghosh.`;
}

/** Pin on the package for a part number: SRJ-002 is pin 2. Null if out of range. */
function pinFor(part: string): number | null {
  const n = Number.parseInt(part.replace(/\D/g, ""), 10);
  return n >= 1 && n <= 6 ? n : null;
}

export function renderPartCard(input: PartCardInput) {
  const pin = pinFor(input.part);
  return renderCard({
    masthead: ["SRJ-0001", "Catalogue"],
    name: input.name,
    lit: pin,
    children: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <PartBadge text={input.part} />
          {pin !== null && (
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 500,
                fontSize: 22,
                letterSpacing: "0.06em",
                color: C.grey,
              }}
            >
              {`PIN ${String(pin).padStart(2, "0")} OF SRJ-0001`}
            </span>
          )}
        </div>
        <div style={{ display: "flex", marginTop: 22 }}>
          <Voice size={input.oneLiner.length <= 60 ? 50 : 42}>{input.oneLiner}</Voice>
        </div>
      </div>
    ),
  });
}
