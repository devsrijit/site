// The catalogue in order. Page 1 is the cover; part N is on page N + 1.

import { MILLION } from "./srj-001-million";
import { BLACKBOX } from "./srj-002-blackbox";
import { UNTELL } from "./srj-003-untell";
import { ISLET } from "./srj-004-islet";
import { DUALSENSE } from "./srj-005-dualsense";
import { VITALS } from "./srj-006-vitals";
import type { Part } from "./types";

export type { Part } from "./types";

export const PARTS: Part[] = [MILLION, BLACKBOX, UNTELL, ISLET, DUALSENSE, VITALS];

/** Total pages in the document: the cover plus one page per part. */
export const PAGES = PARTS.length + 1;

export const partBySlug = (slug: string) => PARTS.find((p) => p.slug === slug);

/** 1-based position in the catalogue. */
export const indexOf = (p: Part) => PARTS.indexOf(p) + 1;

export const pageOf = (p: Part) => indexOf(p) + 1;
