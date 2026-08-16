import { describe, it, expect } from "vitest";
import { progressPatch } from "../../src/data/derive";
import type { Book } from "../../src/types";

const book = (over: Partial<Book> = {}): Book => ({
  id: "b1",
  title: "Тіні забутих предків",
  author: "Михайло Коцюбинський",
  pages: 200,
  read: 190,
  status: "reading",
  genre: "Проза",
  start: "2026-06-01",
  finish: null,
  rating: null,
  cover: { bg: "#123", fg: "#fff", accent: "#2f5bff", style: "type" },
  blurb: "",
  ...over,
});

describe("progressPatch", () => {
  it("flips the book to completed on the last page", () => {
    const p = progressPatch(book(), 200, "2026-08-16");
    expect(p.read).toBe(200);
    expect(p.status).toBe("completed");
    expect(p.finish).toBe("2026-08-16");
  });

  it("keeps the book reading while pages remain", () => {
    const p = progressPatch(book(), 199, "2026-08-16");
    expect(p.status).toBe("reading");
    expect(p.finish).toBeNull();
  });

  it("clamps overshoot to the page count", () => {
    const p = progressPatch(book(), 260, "2026-08-16");
    expect(p.read).toBe(200);
    expect(p.status).toBe("completed");
  });

  it("clamps negatives to zero", () => {
    expect(progressPatch(book(), -10, "2026-08-16").read).toBe(0);
  });

  it("does not re-date a book that is already completed", () => {
    const done = book({ status: "completed", read: 200, finish: "2026-07-01" });
    const p = progressPatch(done, 200, "2026-08-16");
    expect(p.finish).toBe("2026-07-01");
  });

  it("does not un-complete a book when progress is corrected downwards", () => {
    const done = book({ status: "completed", read: 200, finish: "2026-07-01" });
    const p = progressPatch(done, 150, "2026-08-16");
    expect(p.status).toBe("completed");
    expect(p.finish).toBe("2026-07-01");
  });
});
