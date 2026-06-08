// Initial data. The app now starts with an empty library — the user adds
// their own books. Past reading (2019–2024) is kept as yearly totals for
// the statistics screen. "Today" is anchored to 2026-06-08.

import type { Book, Cover, CoverStyle, Note, Activity } from "../types";

/** The app's "today" anchor. */
export const TODAY = new Date("2026-06-08T09:00:00");

export function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgo(n: number, from: Date = TODAY): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

/** Fresh start: empty library, notes and activity log. */
export const SEED_BOOKS: Book[] = [];
export const SEED_NOTES: Note[] = [];
export function buildSeedActivity(): Activity {
  return {};
}

/**
 * Reading history before the app existed — yearly totals only.
 * Source: the user's own records. `books` = titles finished that year,
 * `pages` = sum of their page counts (a few titles had no page count and
 * count as 0 pages but still as a finished book).
 */
export interface YearStat {
  year: number;
  books: number;
  pages: number;
}
export const YEARLY_HISTORY: YearStat[] = [
  { year: 2019, books: 28, pages: 6792 },
  { year: 2020, books: 12, pages: 2769 },
  { year: 2021, books: 6, pages: 1251 },
  { year: 2022, books: 9, pages: 2006 },
  { year: 2023, books: 8, pages: 1869 },
  { year: 2024, books: 2, pages: 428 },
];

// ---- cover generation for newly added books ----
const COVER_PALETTES: Omit<Cover, "style">[] = [
  { bg: "#1f3d2e", fg: "#e9d8a6", accent: "#c97b3c" },
  { bg: "#26313f", fg: "#f2efe6", accent: "#e2603b" },
  { bg: "#1d2a52", fg: "#f6c453", accent: "#f6c453" },
  { bg: "#3a2417", fg: "#e9d8a6", accent: "#c0392b" },
  { bg: "#234438", fg: "#f0ead2", accent: "#7fb069" },
  { bg: "#11151c", fg: "#e8e8e8", accent: "#e2603b" },
  { bg: "#4a1f5e", fg: "#f6c453", accent: "#7fb069" },
  { bg: "#2a3b4d", fg: "#dce6f0", accent: "#5b82ff" },
  { bg: "#5a2a2a", fg: "#f0d9b5", accent: "#d98c5f" },
  { bg: "#d9c5a0", fg: "#1a1a1a", accent: "#1a1a1a" },
];
const COVER_STYLES: CoverStyle[] = [
  "frame",
  "grid",
  "star",
  "leaf",
  "split",
  "type",
];

/** Stable-ish cover derived from a string seed (e.g. the title). */
export function coverFor(seed: string): Cover {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const pal = COVER_PALETTES[h % COVER_PALETTES.length];
  const style = COVER_STYLES[(h >> 3) % COVER_STYLES.length];
  return { ...pal, style };
}
