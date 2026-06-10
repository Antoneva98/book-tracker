// One-time migration of legacy localStorage data into Supabase.
// buildMigrationPayload is pure (id generator injected) so it is testable.
// runMigration receives repo functions by injection.

import type { Activity, Book, Note, YearStat } from "../types";
import { activityMapToRows } from "./mappers";

export interface LegacyLocal {
  books: Book[];
  notes: Note[];
  activity: Activity;
}

export interface MigrationPayload {
  books: Book[];
  notes: Note[];
  activity: { day: string; pages: number }[];
  yearStats: YearStat[];
}

export function buildMigrationPayload(
  local: LegacyLocal,
  yearly: YearStat[],
  newId: () => string,
): MigrationPayload {
  const idMap = new Map<string, string>(); // oldBookId -> new uuid
  const books = local.books.map((b) => {
    const id = newId();
    idMap.set(b.id, id);
    return { ...b, id };
  });
  const notes = local.notes
    .filter((n) => idMap.has(n.bookId))
    .map((n) => ({ ...n, id: newId(), bookId: idMap.get(n.bookId)! }));
  return {
    books,
    notes,
    activity: activityMapToRows(local.activity),
    yearStats: yearly,
  };
}

export interface MigrationDeps {
  local: LegacyLocal;
  yearly: YearStat[];
  newId: () => string;
  insertBooks: (b: Book[]) => Promise<void>;
  insertNotes: (n: Note[]) => Promise<void>;
  setActivityBulk: (r: { day: string; pages: number }[]) => Promise<void>;
  upsertYearStats: (y: YearStat[]) => Promise<void>;
}

/** Runs the migration. Throws if any insert fails (caller leaves flag unset). */
export async function runMigration(deps: MigrationDeps): Promise<void> {
  const p = buildMigrationPayload(deps.local, deps.yearly, deps.newId);
  await deps.insertBooks(p.books);
  await deps.insertNotes(p.notes);
  await deps.setActivityBulk(p.activity);
  await deps.upsertYearStats(p.yearStats);
}
