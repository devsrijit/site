// The share card for the home page: the datasheet cover, cut down for a
// feed. The name runs edge to edge, the title sits under it, and the
// package with its die photo fills the lower right. Pin 1 is lit, as if
// a probe touches it.

import { PartBadge, Title, Voice, renderCard } from "./frame";

export function renderHomeCard() {
  return renderCard({
    masthead: ["Datasheet", "SRJT-0001 – November 2026"],
    name: "SRIJIT GHOSH",
    lit: 1,
    children: (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex" }}>
          <PartBadge text="SRJT-0001" />
        </div>
        <div style={{ display: "flex", marginTop: 20 }}>
          <Title lines={["Single-chip, full-stack", "product engineer"]} />
        </div>
        <div style={{ display: "flex", marginTop: 10 }}>
          <Voice size={43}>with an integrated “designer’s eye”</Voice>
        </div>
      </div>
    ),
  });
}
