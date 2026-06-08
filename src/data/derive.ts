// Pure derivations over the activity log — the source of truth for
// streak and the heatmap (per CLAUDE.md). No React, no side effects.

import type { Activity } from "../types";
import { daysAgo, iso } from "./seed";

/**
 * Consecutive days with reading, counted from yesterday backwards.
 * Today is excluded here; the live streak adds today via `doneToday`
 * (matches the reference: today only counts once it has been logged).
 */
export function baseStreak(activity: Activity): number {
  let s = 0;
  for (let i = 1; i < 90; i++) {
    if ((activity[iso(daysAgo(i))] || 0) > 0) s++;
    else break;
  }
  return s;
}

export function pagesToday(activity: Activity): number {
  return activity[iso(daysAgo(0))] || 0;
}

export interface HeatCell {
  date: string;
  pages: number;
}

/** weeks*7 cells, oldest → newest, ending today. */
export function heat(activity: Activity, weeks: number): HeatCell[] {
  const total = weeks * 7;
  const cells: HeatCell[] = [];
  for (let i = total - 1; i >= 0; i--) {
    const d = daysAgo(i);
    cells.push({ date: iso(d), pages: activity[iso(d)] || 0 });
  }
  return cells;
}
