import { renderHomeCard } from "@/lib/og/homeCard";

export const alt =
  "SRIJIT GHOSH. SRJT-0001: single-chip, full-stack product engineer with an integrated “designer’s eye”. A datasheet cover with a 12-pin chip and a dithered die.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return renderHomeCard();
}
