// Small presentation helpers shared across screens.

import type { BookStatus } from "../types";
import { t } from "../i18n/uk";

export function statusMeta(s: BookStatus): { label: string; color: string } {
  return {
    reading: { label: t.statusReading, color: "var(--c-accent)" },
    completed: { label: t.statusCompleted, color: "var(--c-good)" },
    abandoned: { label: t.statusAbandoned, color: "var(--c-bad)" },
    toread: { label: t.statusToread, color: "var(--c-ink-3)" },
  }[s];
}

/** "12 чер 26" style date, mono-friendly. Returns "—" for null. */
export function fmtDate(isoStr: string | null): string {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return `${d.getDate()} ${t.monthsShort[d.getMonth()]} ${String(
    d.getFullYear(),
  ).slice(2)}`;
}

/** Locale-grouped number, e.g. 5970 → "5 970". */
export function fmtNum(n: number): string {
  return n.toLocaleString("uk");
}
