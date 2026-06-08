// Pure derivations over the activity log + books — the source of truth for
// streak, heatmap, monthly/yearly stats and the gentle insights.

import type { Activity, Book, Insight } from "../types";
import { daysAgo, iso } from "./seed";

/**
 * Consecutive days with reading, counted from yesterday backwards.
 * Today is excluded; the live streak adds today via `doneToday`.
 */
export function baseStreak(activity: Activity): number {
  let s = 0;
  for (let i = 1; i < 400; i++) {
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

/** Total pages logged within a calendar year. */
export function pagesInYear(activity: Activity, year: number): number {
  const prefix = `${year}-`;
  let sum = 0;
  for (const [date, pages] of Object.entries(activity)) {
    if (date.startsWith(prefix)) sum += pages;
  }
  return sum;
}

/** Books finished (status completed) within a calendar year. */
export function booksCompletedInYear(books: Book[], year: number): number {
  return books.filter(
    (b) => b.status === "completed" && b.finish?.startsWith(`${year}-`),
  ).length;
}

export interface MonthStat {
  monthIdx: number; // 0..11
  pages: number;
  books: number;
}

/** Per-month pages (from log) + books finished, for months elapsed in `year`. */
export function monthlyForYear(
  activity: Activity,
  books: Book[],
  year: number,
  uptoMonth: number,
): MonthStat[] {
  const out: MonthStat[] = [];
  for (let m = 0; m <= uptoMonth; m++) {
    const prefix = `${year}-${String(m + 1).padStart(2, "0")}-`;
    let pages = 0;
    for (const [date, p] of Object.entries(activity)) {
      if (date.startsWith(prefix)) pages += p;
    }
    const finished = books.filter(
      (b) => b.status === "completed" && b.finish?.startsWith(prefix),
    ).length;
    out.push({ monthIdx: m, pages, books: finished });
  }
  return out;
}

/**
 * A few calm, data-driven observations. Returns [] when there isn't enough
 * to say anything honest yet (the screen shows a gentle empty state).
 */
export function buildInsights(
  activity: Activity,
  books: Book[],
  year: number,
): Insight[] {
  const out: Insight[] = [];
  const streak = baseStreak(activity) + (pagesToday(activity) > 0 ? 1 : 0);

  // a book that's nearly finished
  const almost = books
    .filter((b) => b.status === "reading" && b.pages > 0)
    .map((b) => ({ b, left: b.pages - b.read, frac: b.read / b.pages }))
    .filter((x) => x.frac >= 0.8 && x.left > 0)
    .sort((a, z) => a.left - z.left)[0];
  if (almost) {
    out.push({
      id: "pace",
      kind: "pace",
      title: `«${almost.b.title}» майже завершено`,
      text: `Лишилось ${almost.left} стор. Ще трохи — і книга прочитана.`,
    });
  }

  if (streak >= 3) {
    out.push({
      id: "rhythm",
      kind: "rhythm",
      title: `Серія — ${streak} ${pluralDays(streak)}`,
      text: "Ти тримаєш ритм день за днем. Спокійно й без поспіху.",
    });
  }

  const pagesY = pagesInYear(activity, year);
  const booksY = booksCompletedInYear(books, year);
  if (pagesY > 0 || booksY > 0) {
    out.push({
      id: "up",
      kind: "up",
      title: "Цьогоріч ти читаєш",
      text: `Уже ${pagesY.toLocaleString("uk")} стор.${
        booksY ? ` і ${booksY} ${pluralBooks(booksY)} завершено` : ""
      }. Звичка міцнішає.`,
    });
  }

  return out;
}

function pluralDays(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "день";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "дні";
  return "днів";
}
function pluralBooks(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "книга";
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "книги";
  return "книг";
}
