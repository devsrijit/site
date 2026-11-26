// Renders sample share cards to .comp-shots/og/ (gitignored) for review.
// Run: bun scripts/og-samples.tsx

import { mkdirSync, writeFileSync } from "node:fs";
import { renderHomeCard } from "../lib/og/homeCard";
import { renderPartCard, type PartCardInput } from "../lib/og/partCard";

const OUT = ".comp-shots/og";
mkdirSync(OUT, { recursive: true });

const parts: PartCardInput[] = [
  { part: "SRJ-001", name: "MILLION", oneLiner: "A spreadsheet engine for the browser, written from scratch." },
  { part: "SRJ-002", name: "BLACKBOX", oneLiner: "A flight recorder for AI agents." },
];

// Stress cases: the longest name and a one-liner that wraps.
const stress: PartCardInput[] = [
  {
    part: "SRJ-005",
    name: "DUALSENSE",
    oneLiner: "A control surface for the PS5 DualSense controller in the browser, over WebHID.",
  },
  { part: "SRJ-004", name: "ISLET", oneLiner: "A free, open-source Dynamic Island for the MacBook notch." },
];

const save = async (file: string, res: Response) => {
  writeFileSync(`${OUT}/${file}`, Buffer.from(await res.arrayBuffer()));
  console.log(`${OUT}/${file}`);
};

await save("sample-home.png", await renderHomeCard());
for (const p of [...parts, ...stress]) {
  await save(`part-${p.part.toLowerCase()}-${p.name.toLowerCase()}.png`, await renderPartCard(p));
}
