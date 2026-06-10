import { describe, it, expect } from "vitest";
import { buildMigrationPayload, type LegacyLocal } from "../../src/data/migrate";
import type { YearStat } from "../../src/types";

function counterIds(): () => string {
  let n = 0;
  return () => `uuid-${++n}`;
}

const legacy: LegacyLocal = {
  books: [
    {
      id: "b1",
      title: "Книга",
      author: "Автор",
      pages: 100,
      read: 50,
      status: "reading",
      genre: "—",
      start: "2026-01-01",
      finish: null,
      rating: null,
      cover: { bg: "#1f3d2e", fg: "#e9d8a6", accent: "#c97b3c", style: "frame" },
      blurb: "",
    },
  ],
  notes: [
    { id: "n1", bookId: "b1", type: "idea", page: 10, text: "x", date: "2026-01-02" },
  ],
  activity: { "2026-01-02": 50 },
};

const yearly: YearStat[] = [{ year: 2024, books: 2, pages: 428 }];

describe("buildMigrationPayload", () => {
  it("assigns new uuids to books and re-points notes", () => {
    const p = buildMigrationPayload(legacy, yearly, counterIds());
    expect(p.books[0].id).toBe("uuid-1");
    expect(p.notes[0].bookId).toBe("uuid-1"); // re-pointed from b1
    expect(p.notes[0].id).toBe("uuid-2");
  });
  it("converts activity to rows", () => {
    const p = buildMigrationPayload(legacy, yearly, counterIds());
    expect(p.activity).toEqual([{ day: "2026-01-02", pages: 50 }]);
  });
  it("passes year stats through", () => {
    const p = buildMigrationPayload(legacy, yearly, counterIds());
    expect(p.yearStats).toEqual(yearly);
  });
  it("drops notes whose book is missing", () => {
    const orphan: LegacyLocal = { ...legacy, notes: [
      { id: "n9", bookId: "ghost", type: "idea", page: 0, text: "y", date: "" },
    ] };
    const p = buildMigrationPayload(orphan, yearly, counterIds());
    expect(p.notes).toHaveLength(0);
  });
});
