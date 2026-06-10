// Pure conversions between Supabase rows and domain types.
// No network imports here, so these are trivially unit-testable.

import type { Activity, Book, Cover, Note, YearStat } from "../types";

// ---- DB row shapes ----
export interface BookRow {
  id: string;
  title: string;
  author: string;
  pages: number;
  read: number;
  status: Book["status"];
  genre: string;
  start: string | null;
  finish: string | null;
  rating: number | null;
  cover: Cover;
  blurb: string;
}

export interface NoteRow {
  id: string;
  book_id: string;
  type: Note["type"];
  page: number;
  text: string;
  date: string | null;
}

export interface ActivityRow {
  day: string;
  pages: number;
}

export interface YearStatRow {
  year: number;
  books: number;
  pages: number;
}

// ---- books ----
export function rowToBook(r: BookRow): Book {
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    pages: r.pages,
    read: r.read,
    status: r.status,
    genre: r.genre,
    start: r.start,
    finish: r.finish,
    rating: r.rating,
    cover: r.cover,
    blurb: r.blurb,
  };
}

/** Insert/update payload: omits server-managed user_id and created_at. */
export function bookToRow(b: Book): BookRow {
  return {
    id: b.id,
    title: b.title,
    author: b.author,
    pages: b.pages,
    read: b.read,
    status: b.status,
    genre: b.genre,
    start: b.start,
    finish: b.finish,
    rating: b.rating,
    cover: b.cover,
    blurb: b.blurb,
  };
}

// ---- notes (the only field-name mismatch) ----
export function rowToNote(r: NoteRow): Note {
  return {
    id: r.id,
    bookId: r.book_id,
    type: r.type,
    page: r.page,
    text: r.text,
    date: r.date ?? "",
  };
}

export function noteToRow(n: Note): NoteRow {
  return {
    id: n.id,
    book_id: n.bookId,
    type: n.type,
    page: n.page,
    text: n.text,
    date: n.date,
  };
}

// ---- activity ----
export function activityRowsToMap(rows: ActivityRow[]): Activity {
  const map: Activity = {};
  for (const r of rows) map[r.day] = r.pages;
  return map;
}

export function activityMapToRows(a: Activity): ActivityRow[] {
  return Object.entries(a).map(([day, pages]) => ({ day, pages }));
}

// ---- year_stats ----
export function rowToYearStat(r: YearStatRow): YearStat {
  return { year: r.year, books: r.books, pages: r.pages };
}

export function yearStatToRow(y: YearStat): YearStatRow {
  return { year: y.year, books: y.books, pages: y.pages };
}
