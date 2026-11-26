// Writes app/favicon.ico from the pixel icons in lib/og/icon.tsx: one
// 16 px and one 32 px frame, each drawn on its own grid. The frames are
// PNG data inside the ICO container, which every current browser reads.
// Run: bun scripts/favicon.tsx

import { writeFileSync } from "node:fs";
import { ImageResponse } from "next/og";
import { IconImage } from "../lib/og/icon";

const frames = await Promise.all(
  ([16, 32] as const).map(async (n) => {
    const res = new ImageResponse(<IconImage n={n} />, { width: n, height: n });
    return { n, png: Buffer.from(await res.arrayBuffer()) };
  }),
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(frames.length, 4);

let offset = 6 + 16 * frames.length;
const entries = frames.map(({ n, png }) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(n, 0); // width
  e.writeUInt8(n, 1); // height
  e.writeUInt8(0, 2); // no palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});

writeFileSync("app/favicon.ico", Buffer.concat([header, ...entries, ...frames.map((f) => f.png)]));
console.log(`app/favicon.ico: ${frames.map((f) => `${f.n}px ${f.png.length} B`).join(", ")}`);
