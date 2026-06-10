// Supabase CRUD. Domain in, domain out — all row mapping happens via mappers.
// user_id is filled by the DB (default auth.uid()); RLS enforces ownership.

import { supabase } from "./supabase";
import type { Activity, Book, Note, YearStat } from "../types";
import {
  activityRowsToMap,
  bookToRow,
  goalRowsToMap,
  noteToRow,
  rowToBook,
  rowToNote,
  rowToYearStat,
  yearStatToRow,
} from "./mappers";

function check<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export interface Snapshot {
  books: Book[];
  notes: Note[];
  activity: Activity;
  yearStats: YearStat[];
  goals: Record<number, number>;
}

export async function fetchAll(): Promise<Snapshot> {
  const [books, notes, activity, years, goals] = await Promise.all([
    supabase.from("books").select("*").order("created_at", { ascending: false }),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("activity").select("day, pages"),
    supabase.from("year_stats").select("year, books, pages").order("year"),
    supabase.from("goals").select("year, target"),
  ]);
  return {
    books: check(books.data, books.error).map(rowToBook),
    notes: check(notes.data, notes.error).map(rowToNote),
    activity: activityRowsToMap(check(activity.data, activity.error)),
    yearStats: check(years.data, years.error).map(rowToYearStat),
    // tolerate a missing `goals` table so the app still loads before the
    // optional goals migration has been run in Supabase.
    goals: goals.error ? {} : goalRowsToMap(goals.data ?? []),
  };
}

/** Set (or clear) the yearly book goal. */
export async function setGoal(year: number, target: number): Promise<void> {
  const { error } = await supabase
    .from("goals")
    .upsert({ year, target }, { onConflict: "user_id,year" });
  if (error) throw new Error(error.message);
}

export async function deleteGoal(year: number): Promise<void> {
  const { error } = await supabase.from("goals").delete().eq("year", year);
  if (error) throw new Error(error.message);
}

export async function insertBook(book: Book): Promise<void> {
  const { error } = await supabase.from("books").insert(bookToRow(book));
  if (error) throw new Error(error.message);
}

export async function insertBooks(books: Book[]): Promise<void> {
  if (books.length === 0) return;
  const { error } = await supabase.from("books").insert(books.map(bookToRow));
  if (error) throw new Error(error.message);
}

export async function updateBook(id: string, patch: Partial<Book>): Promise<void> {
  // patch keys are domain names; books columns match 1:1, so pass through.
  const { error } = await supabase.from("books").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBook(id: string): Promise<void> {
  // notes are removed by ON DELETE CASCADE in the DB.
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertNote(note: Note): Promise<void> {
  const { error } = await supabase.from("notes").insert(noteToRow(note));
  if (error) throw new Error(error.message);
}

export async function insertNotes(notes: Note[]): Promise<void> {
  if (notes.length === 0) return;
  const { error } = await supabase.from("notes").insert(notes.map(noteToRow));
  if (error) throw new Error(error.message);
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Upsert the absolute page total for one day. */
export async function setActivity(day: string, pages: number): Promise<void> {
  const { error } = await supabase
    .from("activity")
    .upsert({ day, pages }, { onConflict: "user_id,day" });
  if (error) throw new Error(error.message);
}

export async function setActivityBulk(
  rows: { day: string; pages: number }[],
): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase
    .from("activity")
    .upsert(rows, { onConflict: "user_id,day" });
  if (error) throw new Error(error.message);
}

export async function upsertYearStats(stats: YearStat[]): Promise<void> {
  if (stats.length === 0) return;
  const { error } = await supabase
    .from("year_stats")
    .upsert(stats.map(yearStatToRow), { onConflict: "user_id,year" });
  if (error) throw new Error(error.message);
}
