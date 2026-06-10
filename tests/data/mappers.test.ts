import { describe, it, expect } from "vitest";
import {
  rowToBook,
  bookToRow,
  rowToNote,
  noteToRow,
  activityRowsToMap,
  activityMapToRows,
  rowToYearStat,
  yearStatToRow,
} from "../../src/data/mappers";
import type { Book, Note } from "../../src/types";

const book: Book = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "Тест",
  author: "Автор",
  pages: 300,
  read: 120,
  status: "reading",
  genre: "Роман",
  start: "2026-06-01",
  finish: null,
  rating: null,
  cover: { bg: "#1f3d2e", fg: "#e9d8a6", accent: "#c97b3c", style: "frame" },
  blurb: "",
};

const note: Note = {
  id: "22222222-2222-2222-2222-222222222222",
  bookId: "11111111-1111-1111-1111-111111111111",
  type: "idea",
  page: 42,
  text: "Думка",
  date: "2026-06-05",
};

describe("book mappers", () => {
  it("round-trips a book through row form", () => {
    expect(rowToBook(bookToRow(book) as any)).toEqual(book);
  });
  it("bookToRow omits server-managed columns", () => {
    const row = bookToRow(book) as Record<string, unknown>;
    expect(row).not.toHaveProperty("user_id");
    expect(row).not.toHaveProperty("created_at");
  });
});

describe("note mappers", () => {
  it("maps bookId <-> book_id", () => {
    const row = noteToRow(note);
    expect(row.book_id).toBe(note.bookId);
    expect(row).not.toHaveProperty("bookId");
    expect(rowToNote(row as any)).toEqual(note);
  });
});

describe("activity mappers", () => {
  it("converts rows to a date->pages map", () => {
    const map = activityRowsToMap([
      { day: "2026-06-01", pages: 10 },
      { day: "2026-06-02", pages: 20 },
    ]);
    expect(map).toEqual({ "2026-06-01": 10, "2026-06-02": 20 });
  });
  it("converts a map back to rows", () => {
    const rows = activityMapToRows({ "2026-06-01": 10 });
    expect(rows).toEqual([{ day: "2026-06-01", pages: 10 }]);
  });
});

describe("year_stats mappers", () => {
  it("round-trips", () => {
    const ys = { year: 2024, books: 2, pages: 428 };
    expect(rowToYearStat(yearStatToRow(ys) as any)).toEqual(ys);
  });
});
