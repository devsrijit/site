import { ImageResponse } from "next/og";
import { IconImage } from "@/lib/og/icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<IconImage n={32} />, size);
}
