// Domain model for the reading tracker. See README → "Data Model".

export type BookStatus = "reading" | "completed" | "abandoned" | "toread";
export type CoverStyle = "frame" | "grid" | "star" | "leaf" | "split" | "type";
export type NoteType = "idea" | "quote" | "application";
export type Screen =
  | "home"
  | "library"
  | "detail"
  | "analytics"
  | "notes"
  | "insights"
  | "addbook";

export interface Cover {
  bg: string;
  fg: string;
  accent: string;
  style: CoverStyle;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  read: number;
  status: BookStatus;
  genre: string;
  start: string | null;
  finish: string | null;
  rating: number | null;
  cover: Cover;
  blurb: string;
}

export interface Note {
  id: string;
  bookId: string;
  type: NoteType;
  page: number;
  text: string;
  date: string;
}

/** Daily reading activity: ISO date (YYYY-MM-DD) → pages read that day. */
export type Activity = Record<string, number>;

export interface MonthAggregate {
  month: string;
  pages: number;
  books: number;
}

export type InsightKind = "rhythm" | "up" | "time" | "pace";

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  text: string;
}
