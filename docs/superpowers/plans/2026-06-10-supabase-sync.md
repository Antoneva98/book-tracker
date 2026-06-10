# Supabase Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the «Світло» reading tracker from `localStorage` to per-user Supabase storage with Google + email login, online-first sync, and a one-time migration of existing local data.

**Architecture:** A pure mapping layer (`mappers.ts`) converts between DB rows and domain types; a thin network layer (`repo.ts`) does Supabase CRUD; `store.ts` keeps its existing interface for screens but becomes async with optimistic updates; `useSession.ts` gates the app behind auth. Migration logic is a pure payload builder + a dependency-injected runner, so it is unit-testable without the network.

**Tech Stack:** React 18, Vite 5, TypeScript (strict), `@supabase/supabase-js` v2, Vitest (new).

**Design refinements over the spec (intent preserved):**
- Pure mappers live in `src/data/mappers.ts` (NOT `repo.ts`) so unit tests never import the Supabase client (which throws without env vars).
- New row ids are generated client-side with `crypto.randomUUID()`. This gives stable optimistic updates (no temp-id reconciliation) and supplies the uuid to `insert`. The DB `default gen_random_uuid()` remains as a fallback.
- Migration is split into a pure `buildMigrationPayload(local, yearly, newId)` and a `runMigration(deps)` runner that receives repo functions by injection — both testable.

---

## File Structure

```
src/data/mappers.ts          🆕 pure row↔domain functions (no network import)
src/data/repo.ts             🆕 Supabase CRUD (imports supabase + mappers)
src/data/migrate.ts          🆕 buildMigrationPayload (pure) + runMigration (DI)
src/auth/useSession.ts       🆕 session hook (user / loading / signOut)
src/screens/LoginScreen.tsx  🆕 Google + email magic link
src/AuthedApp.tsx            🆕 the current App body (store + screens + migration dialog)
src/data/store.ts            ✏️ async rewrite, same BookStore interface + new fields
src/App.tsx                  ✏️ owns theme + phone frame; swaps splash/login/authed
src/screens/AnalyticsScreen.tsx ✏️ read yearStats from ctx, not YEARLY_HISTORY const
src/screens/HomeScreen.tsx   ✏️ profile/logout button in header
src/types.ts                 ✏️ add YearStat
src/data/seed.ts             ✏️ YearStat type moves to types.ts (re-export for migration)
src/i18n/uk.ts               ✏️ login / migration / error / logout strings
vitest.config.ts             🆕 test config
package.json                 ✏️ vitest devDep + "test" script
.github/workflows/deploy.yml ✏️ pass Supabase env to build
tests/data/mappers.test.ts   🆕
tests/data/migrate.test.ts   🆕
```

---

## Task 1: Vitest test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/smoke.test.ts`

- [ ] **Step 1: Install Vitest**

```bash
cd "src project root" && npm i -D vitest
```
Expected: `vitest` appears under devDependencies.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Write a smoke test**

`tests/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/smoke.test.ts
git commit -m "test: add Vitest infrastructure"
```

---

## Task 2: Move YearStat type to types.ts

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data/seed.ts:36-40`
- Modify: `src/screens/AnalyticsScreen.tsx:6`

This is a pure refactor: the app still reads `YEARLY_HISTORY`. Behaviour unchanged.

- [ ] **Step 1: Add YearStat to types.ts**

Append to `src/types.ts`:
```ts
/** Yearly reading totals (archive + current year). */
export interface YearStat {
  year: number;
  books: number;
  pages: number;
}
```

- [ ] **Step 2: Re-export from seed.ts instead of redefining**

In `src/data/seed.ts`, replace the `export interface YearStat { ... }` block (lines ~36-40) with:
```ts
import type { YearStat } from "../types";
export type { YearStat };
```
(Add `YearStat` to the existing `import type { Book, Cover, CoverStyle, Note, Activity } from "../types";` line, or keep a separate import — both fine. The `YEARLY_HISTORY: YearStat[]` constant stays as-is.)

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/data/seed.ts
git commit -m "refactor: move YearStat type to types.ts"
```

---

## Task 3: Pure mapping layer (mappers.ts) — TDD

**Files:**
- Create: `src/data/mappers.ts`
- Test: `tests/data/mappers.test.ts`

DB column names match domain field names 1:1 for `books`, `activity`, `year_stats`. The ONLY mismatch is `notes.book_id` ↔ `Note.bookId`.

- [ ] **Step 1: Write failing tests**

`tests/data/mappers.test.ts`:
```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/data/mappers.test.ts`
Expected: FAIL — cannot find module `../../src/data/mappers`.

- [ ] **Step 3: Implement mappers.ts**

`src/data/mappers.ts`:
```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/data/mappers.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/mappers.ts tests/data/mappers.test.ts
git commit -m "feat: add pure row<->domain mappers with tests"
```

---

## Task 4: Network layer (repo.ts)

**Files:**
- Create: `src/data/repo.ts`

No unit tests (thin wrapper over Supabase + mappers; verified via typecheck + manual run later). Every function throws on Supabase error so the store can roll back.

- [ ] **Step 1: Implement repo.ts**

`src/data/repo.ts`:
```ts
// Supabase CRUD. Domain in, domain out — all row mapping happens via mappers.
// user_id is filled by the DB (default auth.uid()); RLS enforces ownership.

import { supabase } from "./supabase";
import type { Activity, Book, Note, YearStat } from "../types";
import {
  activityRowsToMap,
  bookToRow,
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
}

export async function fetchAll(): Promise<Snapshot> {
  const [books, notes, activity, years] = await Promise.all([
    supabase.from("books").select("*").order("created_at", { ascending: false }),
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("activity").select("day, pages"),
    supabase.from("year_stats").select("year, books, pages").order("year"),
  ]);
  return {
    books: check(books.data, books.error).map(rowToBook),
    notes: check(notes.data, notes.error).map(rowToNote),
    activity: activityRowsToMap(check(activity.data, activity.error)),
    yearStats: check(years.data, years.error).map(rowToYearStat),
  };
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/repo.ts
git commit -m "feat: add Supabase repo layer"
```

---

## Task 5: Migration (migrate.ts) — TDD

**Files:**
- Create: `src/data/migrate.ts`
- Test: `tests/data/migrate.test.ts`

`buildMigrationPayload` is pure: it takes legacy local data + yearly history + an id generator, and returns the rows to insert, with **new uuids** and notes re-pointed to their books' new ids.

- [ ] **Step 1: Write failing tests**

`tests/data/migrate.test.ts`:
```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/data/migrate.test.ts`
Expected: FAIL — cannot find module `../../src/data/migrate`.

- [ ] **Step 3: Implement migrate.ts**

`src/data/migrate.ts`:
```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/data/migrate.test.ts`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/migrate.ts tests/data/migrate.test.ts
git commit -m "feat: add migration payload builder + runner with tests"
```

---

## Task 6: Session hook (useSession.ts)

**Files:**
- Create: `src/auth/useSession.ts`

- [ ] **Step 1: Implement useSession.ts**

`src/auth/useSession.ts`:
```ts
// Auth session state. Subscribes to Supabase auth changes.

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../data/supabase";

export interface SessionState {
  user: User | null;
  loading: boolean;
}

export function useSession(): SessionState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw new Error(error.message);
}

export async function signInWithEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw new Error(error.message);
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/auth/useSession.ts
git commit -m "feat: add useSession auth hook"
```

---

## Task 7: i18n strings for auth/migration/errors

**Files:**
- Modify: `src/i18n/uk.ts`

- [ ] **Step 1: Add strings**

Inside the `const uk = { ... }` object (anywhere before the closing brace), add:
```ts
  // auth
  appName: "Світло",
  loginTagline: "Твій тихий трекер читання",
  signInGoogle: "Увійти через Google",
  orDivider: "або",
  emailPlaceholder: "твоя@пошта.com",
  sendMagicLink: "Надіслати посилання",
  magicLinkSent: "Перевір пошту — ми надіслали посилання для входу.",
  signOut: "Вийти",
  // loading / errors
  loadingData: "Завантаження…",
  offlineTitle: "Немає з'єднання",
  offlineSub: "Не вдалося завантажити дані.",
  retry: "Спробувати ще",
  saveFailed: "Не вдалося зберегти, спробуй ще",
  // migration
  migrateTitle: "Перенести твої дані?",
  migrateSub: "Ми знайшли збережені локально книги, нотатки й історію. Залити їх у твій акаунт?",
  migrateConfirm: "Перенести",
  migrateSkip: "Почати з чистого",
  migrateDone: "Дані перенесено",
  migrateFailed: "Не вдалося перенести дані",
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/uk.ts
git commit -m "feat: add auth/migration/error UI strings"
```

---

## Task 8: LoginScreen.tsx

**Files:**
- Create: `src/screens/LoginScreen.tsx`

- [ ] **Step 1: Implement LoginScreen**

`src/screens/LoginScreen.tsx`:
```tsx
// Login: Google (primary) + email magic link (fallback).

import { useState } from "react";
import { t } from "../i18n/uk";
import { signInWithGoogle, signInWithEmail } from "../auth/useSession";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function google() {
    setErr(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      setErr(t.saveFailed);
      setBusy(false);
    }
  }

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmail(email.trim());
      setSent(true);
    } catch {
      setErr(t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen-scroll fade-up" style={{ justifyContent: "center" }}>
      <div className="greet-head stack gap-2" style={{ textAlign: "center" }}>
        <h1 className="h-title">{t.appName}</h1>
        <span className="eyebrow muted">{t.loginTagline}</span>
      </div>

      <div className="card mt-5" style={{ padding: 16 }}>
        <button className="btn btn-primary" onClick={google} disabled={busy}>
          {t.signInGoogle}
        </button>

        {sent ? (
          <div className="es-sub mt-4" style={{ textAlign: "center" }}>
            {t.magicLinkSent}
          </div>
        ) : (
          <>
            <div className="eyebrow muted mt-4" style={{ textAlign: "center" }}>
              {t.orDivider}
            </div>
            <form className="stack gap-2 mt-3" onSubmit={magic}>
              <input
                className="input"
                type="email"
                inputMode="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn" type="submit" disabled={busy || !email.trim()}>
                {t.sendMagicLink}
              </button>
            </form>
          </>
        )}

        {err && (
          <div className="es-sub mt-3" style={{ color: "var(--c-bad, #c0392b)", textAlign: "center" }}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors. (If `.input` class is missing in CSS, the field still works; styling is refined during manual verification.)

- [ ] **Step 3: Commit**

```bash
git add src/screens/LoginScreen.tsx
git commit -m "feat: add LoginScreen (Google + magic link)"
```

---

## Task 9: Rewrite store.ts (async, optimistic, migration-aware)

**Files:**
- Modify: `src/data/store.ts` (full rewrite of internals; interface preserved + extended)

The store now loads from Supabase, applies optimistic updates with rollback, exposes loading/error/migration state, and wires the migration runner.

- [ ] **Step 1: Replace store.ts**

Replace the **entire** contents of `src/data/store.ts` with:
```ts
// Application state, backed by Supabase. The store keeps the same interface
// screens already use; mutations update local state optimistically and write
// through to the database, rolling back on failure.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Activity,
  Book,
  BookStatus,
  Note,
  NoteType,
  YearStat,
} from "../types";
import { t } from "../i18n/uk";
import { coverFor, daysAgo, iso, TODAY, YEARLY_HISTORY } from "./seed";
import { baseStreak, booksCompletedInYear } from "./derive";
import * as repo from "./repo";
import { runMigration } from "./migrate";
import { signOut as authSignOut } from "../auth/useSession";

const LEGACY_KEY = "svitlo-book-tracker";
const MIGRATED_KEY = "svitlo-migrated";
const TODAY_ISO = iso(daysAgo(0));
const YEAR = TODAY.getFullYear();

const newId = (): string => crypto.randomUUID();

interface LegacyPersisted {
  books: Book[];
  notes: Note[];
  activity: Activity;
}

function readLegacyLocal(): LegacyPersisted | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<LegacyPersisted>;
    return {
      books: p.books ?? [],
      notes: p.notes ?? [],
      activity: p.activity ?? {},
    };
  } catch {
    return null;
  }
}

export interface AddBookInput {
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
  genre: string;
  read: number;
  rating: number | null;
}

export interface BookStore {
  books: Book[];
  notes: Note[];
  activity: Activity;
  yearStats: YearStat[];
  current: Book | null;
  currentId: string | null;
  streak: number;
  doneToday: boolean;
  finishedThisYear: number;
  toastMsg: string | null;
  loading: boolean;
  loadError: boolean;
  migrationPrompt: boolean;
  // actions
  logReading: (pages: number) => void;
  updateProgress: (id: string, val: number) => void;
  addNote: (type: NoteType, text: string) => void;
  deleteNote: (id: string) => void;
  addBook: (input: AddBookInput) => string;
  deleteBook: (id: string) => void;
  notesFor: (id: string) => Note[];
  toast: (msg: string) => void;
  reload: () => void;
  confirmMigration: () => void;
  skipMigration: () => void;
  signOut: () => void;
}

export function useBookStore(): BookStore {
  const [books, setBooks] = useState<Book[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activity, setActivity] = useState<Activity>({});
  const [yearStats, setYearStats] = useState<YearStat[]>([]);
  const [doneToday, setDoneToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [migrationPrompt, setMigrationPrompt] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1900);
  }, []);
  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const snap = await repo.fetchAll();
      setBooks(snap.books);
      setNotes(snap.notes);
      setActivity(snap.activity);
      setYearStats(snap.yearStats);
      setDoneToday((snap.activity[TODAY_ISO] || 0) > 0);

      const cloudEmpty =
        snap.books.length === 0 &&
        snap.notes.length === 0 &&
        Object.keys(snap.activity).length === 0 &&
        snap.yearStats.length === 0;
      const already = localStorage.getItem(MIGRATED_KEY) === "1";
      const legacy = readLegacyLocal();
      const hasLegacy =
        (legacy &&
          (legacy.books.length > 0 ||
            legacy.notes.length > 0 ||
            Object.keys(legacy.activity).length > 0)) ||
        YEARLY_HISTORY.length > 0;
      if (cloudEmpty && !already && hasLegacy) setMigrationPrompt(true);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const currentId = useMemo(
    () => books.find((b) => b.status === "reading")?.id ?? books[0]?.id ?? null,
    [books],
  );
  const current = useMemo(
    () => books.find((b) => b.id === currentId) ?? null,
    [books, currentId],
  );
  // baseStreak counts consecutive days up to yesterday; today is added live
  // via doneToday (which mirrors activity[TODAY_ISO] > 0) — same as before.
  const streak = useMemo(
    () => baseStreak(activity) + (doneToday ? 1 : 0),
    [activity, doneToday],
  );
  const finishedThisYear = useMemo(
    () => booksCompletedInYear(books, YEAR),
    [books],
  );

  const logReading = useCallback(
    (pages: number) => {
      const cBook = books.find((b) => b.status === "reading");
      const prevBooks = books;
      const prevActivity = activity;
      const prevDone = doneToday;
      const newTotal = (activity[TODAY_ISO] || 0) + pages;
      if (cBook) {
        setBooks((bs) =>
          bs.map((b) =>
            b.id === cBook.id
              ? { ...b, read: Math.min(b.pages, b.read + pages) }
              : b,
          ),
        );
      }
      setActivity((a) => ({ ...a, [TODAY_ISO]: newTotal }));
      setDoneToday(true);
      toast(t.loggedToast(pages));
      void (async () => {
        try {
          if (cBook) {
            await repo.updateBook(cBook.id, {
              read: Math.min(cBook.pages, cBook.read + pages),
            });
          }
          await repo.setActivity(TODAY_ISO, newTotal);
        } catch {
          setBooks(prevBooks);
          setActivity(prevActivity);
          setDoneToday(prevDone);
          toast(t.saveFailed);
        }
      })();
    },
    [books, activity, doneToday, toast],
  );

  const updateProgress = useCallback(
    (id: string, val: number) => {
      const target = books.find((b) => b.id === id);
      if (!target) return;
      const prevBooks = books;
      const done = val >= target.pages;
      const patch: Partial<Book> = {
        read: val,
        status: done ? "completed" : target.status,
        finish: done ? TODAY_ISO : target.finish,
      };
      setBooks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
      toast(
        done && target.status !== "completed"
          ? t.bookCompletedToast
          : t.progressUpdatedToast,
      );
      void repo.updateBook(id, patch).catch(() => {
        setBooks(prevBooks);
        toast(t.saveFailed);
      });
    },
    [books, toast],
  );

  const addNote = useCallback(
    (type: NoteType, text: string) => {
      const cId =
        books.find((b) => b.status === "reading")?.id ?? books[0]?.id;
      if (!cId) return;
      const page = books.find((b) => b.id === cId)?.read ?? 0;
      const note: Note = {
        id: newId(),
        bookId: cId,
        type,
        page,
        text,
        date: TODAY_ISO,
      };
      const prevNotes = notes;
      setNotes((ns) => [note, ...ns]);
      toast(t.noteAddedToast);
      void repo.insertNote(note).catch(() => {
        setNotes(prevNotes);
        toast(t.saveFailed);
      });
    },
    [books, notes, toast],
  );

  const deleteNote = useCallback(
    (id: string) => {
      const prevNotes = notes;
      setNotes((ns) => ns.filter((n) => n.id !== id));
      toast(t.noteDeletedToast);
      void repo.deleteNote(id).catch(() => {
        setNotes(prevNotes);
        toast(t.saveFailed);
      });
    },
    [notes, toast],
  );

  const addBook = useCallback(
    (input: AddBookInput): string => {
      const id = newId();
      const isDone = input.status === "completed";
      const book: Book = {
        id,
        title: input.title,
        author: input.author,
        pages: input.pages,
        read: isDone ? input.pages : Math.min(input.read, input.pages),
        status: input.status,
        genre: input.genre || "—",
        start: input.status === "toread" ? null : TODAY_ISO,
        finish: isDone ? TODAY_ISO : null,
        rating: input.rating,
        cover: coverFor(input.title + input.author),
        blurb: "",
      };
      const prevBooks = books;
      setBooks((bs) => [book, ...bs]);
      toast(t.bookAddedToast);
      void repo.insertBook(book).catch(() => {
        setBooks(prevBooks);
        toast(t.saveFailed);
      });
      return id;
    },
    [books, toast],
  );

  const deleteBook = useCallback(
    (id: string) => {
      const prevBooks = books;
      const prevNotes = notes;
      setBooks((bs) => bs.filter((b) => b.id !== id));
      setNotes((ns) => ns.filter((n) => n.bookId !== id));
      toast(t.bookDeletedToast);
      void repo.deleteBook(id).catch(() => {
        setBooks(prevBooks);
        setNotes(prevNotes);
        toast(t.saveFailed);
      });
    },
    [books, notes, toast],
  );

  const notesFor = useCallback(
    (id: string) => notes.filter((n) => n.bookId === id),
    [notes],
  );

  const confirmMigration = useCallback(() => {
    setMigrationPrompt(false);
    const legacy = readLegacyLocal() ?? { books: [], notes: [], activity: {} };
    void (async () => {
      try {
        await runMigration({
          local: legacy,
          yearly: YEARLY_HISTORY,
          newId,
          insertBooks: repo.insertBooks,
          insertNotes: repo.insertNotes,
          setActivityBulk: repo.setActivityBulk,
          upsertYearStats: repo.upsertYearStats,
        });
        localStorage.setItem(MIGRATED_KEY, "1");
        toast(t.migrateDone);
        await load();
      } catch {
        toast(t.migrateFailed);
      }
    })();
  }, [load, toast]);

  const skipMigration = useCallback(() => {
    localStorage.setItem(MIGRATED_KEY, "1");
    setMigrationPrompt(false);
  }, []);

  const reload = useCallback(() => {
    void load();
  }, [load]);

  const signOut = useCallback(() => {
    void authSignOut();
  }, []);

  return {
    books,
    notes,
    activity,
    yearStats,
    current,
    currentId,
    streak,
    doneToday,
    finishedThisYear,
    toastMsg,
    loading,
    loadError,
    migrationPrompt,
    logReading,
    updateProgress,
    addNote,
    deleteNote,
    addBook,
    deleteBook,
    notesFor,
    toast,
    reload,
    confirmMigration,
    skipMigration,
    signOut,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors. If `noUnusedLocals`/`noUnusedParameters` (strict mode) flags any unused import or variable, remove it.

- [ ] **Step 3: Run unit tests (regression)**

Run: `npm test`
Expected: mappers + migrate tests still PASS.

- [ ] **Step 4: Commit**

```bash
git add src/data/store.ts
git commit -m "feat: back store with Supabase (async + optimistic + migration)"
```

---

## Task 10: AnalyticsScreen reads yearStats from store

**Files:**
- Modify: `src/screens/AnalyticsScreen.tsx:6,35-39`

- [ ] **Step 1: Update imports and source of yearly history**

In `src/screens/AnalyticsScreen.tsx`:

Replace the import on line 6:
```ts
import { TODAY, YEARLY_HISTORY, type YearStat } from "../data/seed";
```
with:
```ts
import { TODAY } from "../data/seed";
import type { YearStat } from "../types";
```

Replace the yearly-history block (lines ~35-39):
```ts
  // yearly history = past archive + current year (live)
  const years: YearStat[] = [
    ...YEARLY_HISTORY,
    { year, books: booksThisYear, pages: pagesThisYear },
  ];
```
with:
```ts
  // yearly history = stored archive (per-user) + current year (live)
  const years: YearStat[] = [
    ...ctx.yearStats.filter((y) => y.year !== year),
    { year, books: booksThisYear, pages: pagesThisYear },
  ];
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/screens/AnalyticsScreen.tsx
git commit -m "feat: analytics reads per-user year stats from store"
```

---

## Task 11: AuthedApp.tsx + App.tsx gate

**Files:**
- Create: `src/AuthedApp.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create AuthedApp.tsx (moved App body + loading/error/migration UI)**

`src/AuthedApp.tsx`:
```tsx
// The authenticated app: store, navigation, screens, and the one-time
// migration dialog. Rendered only when a session exists.

import { useRef, useState } from "react";
import type { Screen } from "./types";
import type { AppCtx } from "./ctx";
import { useBookStore } from "./data/store";
import { TabBar } from "./components/TabBar";
import { HomeScreen } from "./screens/HomeScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { DetailScreen } from "./screens/DetailScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { NotesScreen } from "./screens/NotesScreen";
import { InsightsScreen } from "./screens/InsightsScreen";
import { AddBookScreen } from "./screens/AddBookScreen";
import { t } from "./i18n/uk";

export function AuthedApp() {
  const store = useBookStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [detailId, setDetailId] = useState<string | null>(null);
  const scrollHostRef = useRef<HTMLDivElement>(null);

  function resetScroll() {
    if (scrollHostRef.current) scrollHostRef.current.scrollTop = 0;
  }
  function nav(s: Screen) {
    setScreen(s);
    resetScroll();
  }
  function openBook(id: string) {
    setDetailId(id);
    setScreen("detail");
    resetScroll();
  }
  function back() {
    setScreen("library");
    resetScroll();
  }

  if (store.loading) {
    return (
      <div className="screen">
        <div className="screen-scroll" style={{ justifyContent: "center", textAlign: "center" }}>
          <div className="es-sub">{t.loadingData}</div>
        </div>
      </div>
    );
  }

  if (store.loadError) {
    return (
      <div className="screen">
        <div className="screen-scroll" style={{ justifyContent: "center", textAlign: "center" }}>
          <div className="es-title">{t.offlineTitle}</div>
          <div className="es-sub">{t.offlineSub}</div>
          <button className="btn btn-primary mt-4" onClick={store.reload}>
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  const ctx: AppCtx = { ...store, nav, openBook, back, detailId };
  const navActive: Screen =
    screen === "detail" || screen === "addbook" ? "library" : screen;

  return (
    <div className="screen">
      <div
        className="screen-scroll-host"
        style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        ref={scrollHostRef}
      >
        {screen === "home" && <HomeScreen ctx={ctx} />}
        {screen === "library" && <LibraryScreen ctx={ctx} />}
        {screen === "detail" && <DetailScreen ctx={ctx} />}
        {screen === "analytics" && <AnalyticsScreen ctx={ctx} />}
        {screen === "notes" && <NotesScreen ctx={ctx} />}
        {screen === "insights" && <InsightsScreen ctx={ctx} />}
        {screen === "addbook" && <AddBookScreen ctx={ctx} />}
      </div>

      <div className="toast" data-show={!!store.toastMsg}>
        {store.toastMsg}
      </div>

      {store.migrationPrompt && (
        <div className="card" style={{ position: "absolute", left: 12, right: 12, bottom: 76, padding: 16, zIndex: 20 }}>
          <div className="es-title">{t.migrateTitle}</div>
          <div className="es-sub mt-2">{t.migrateSub}</div>
          <button className="btn btn-primary mt-3" onClick={store.confirmMigration}>
            {t.migrateConfirm}
          </button>
          <button className="btn mt-2" onClick={store.skipMigration}>
            {t.migrateSkip}
          </button>
        </div>
      )}

      <TabBar active={navActive} onNav={nav} />
    </div>
  );
}
```

- [ ] **Step 2: Replace App.tsx with the auth gate**

Replace the **entire** contents of `src/App.tsx` with:
```tsx
// App shell: owns theme + phone frame, then renders splash / login / app
// depending on the auth session.

import { useEffect, useState } from "react";
import { Icon } from "./components/Icon";
import { useSession } from "./auth/useSession";
import { LoginScreen } from "./screens/LoginScreen";
import { AuthedApp } from "./AuthedApp";
import { t } from "./i18n/uk";

type Theme = "light" | "dark";
const THEME_KEY = "svitlo-theme";

function initialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const { user, loading } = useSession();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="phone" data-theme={theme}>
      <button
        className="theme-toggle"
        onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
        aria-label={theme === "light" ? "Темна тема" : "Світла тема"}
      >
        <Icon name={theme === "light" ? "moon" : "sun"} size={17} />
      </button>

      {loading ? (
        <div className="screen">
          <div className="screen-scroll" style={{ justifyContent: "center", textAlign: "center" }}>
            <div className="es-sub">{t.loadingData}</div>
          </div>
        </div>
      ) : user ? (
        <AuthedApp />
      ) : (
        <div className="screen">
          <LoginScreen />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/AuthedApp.tsx
git commit -m "feat: gate app behind auth; loading/error/migration UI"
```

---

## Task 12: Profile / logout button in Home header

**Files:**
- Modify: `src/screens/HomeScreen.tsx:20-49`

- [ ] **Step 1: Add signOut to the destructured ctx and a header button**

In `src/screens/HomeScreen.tsx`, add `signOut` to the destructure (around line 21-31):
```tsx
  const {
    books,
    activity,
    current,
    streak,
    doneToday,
    finishedThisYear,
    logReading,
    openBook,
    nav,
    signOut,
  } = ctx;
```

Replace the greeting header block (lines ~46-50):
```tsx
      <div className="greet-head stack gap-2">
        <span className="eyebrow muted">{dateLine}</span>
        <h1 className="h-title">{greet}.</h1>
      </div>
```
with:
```tsx
      <div className="greet-head row-between">
        <div className="stack gap-2">
          <span className="eyebrow muted">{dateLine}</span>
          <h1 className="h-title">{greet}.</h1>
        </div>
        <button
          className="theme-toggle"
          style={{ position: "static" }}
          onClick={signOut}
          aria-label={t.signOut}
          title={t.signOut}
        >
          <Icon name="user" size={17} />
        </button>
      </div>
```

- [ ] **Step 2: Verify the "user" icon exists**

Run: `grep -n "user" src/components/Icon.tsx`
Expected: a `user` case exists. If NOT, use an available icon name instead (run `grep -oE '"[a-z]+"' src/components/Icon.tsx | sort -u` to list names) — e.g. `"spark"` or `"moon"` — and update the `name=` prop accordingly.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat: add profile/logout button to Home header"
```

---

## Task 13: Pass Supabase env to production build

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add env to the build step**

In `.github/workflows/deploy.yml`, change:
```yaml
      - run: npm run build
```
to:
```yaml
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: pass Supabase env to production build"
```

---

## Final verification (manual — requires Google OAuth configured)

> **External prerequisite (not code):** In Google Cloud Console create an OAuth
> client; in Supabase → Authentication → Sign In / Providers → Google paste the
> Client ID/Secret. Without this, the Google button errors (email magic link
> still works for testing).

- [ ] Run `npm test` — all unit tests pass.
- [ ] Run `npm run typecheck` — clean.
- [ ] Run `npm run dev`, open `http://localhost:5173`:
  - [ ] LoginScreen appears (no session).
  - [ ] Sign in via email magic link (or Google if configured).
  - [ ] On first login with legacy local data: migration dialog appears.
  - [ ] Confirm migration → books/notes/activity/year archive present.
  - [ ] Add a book → reload page → it persists.
  - [ ] Log reading → streak/activity update and persist.
  - [ ] Sign out (Home header button) → returns to LoginScreen.
  - [ ] Sign back in → data still there, migration dialog does NOT reappear.
- [ ] (Optional) Verify in a second browser/account that data is isolated (RLS).

---

## Spec Coverage Check

| Spec requirement | Task |
|---|---|
| Google + email magic link login | 6, 8 |
| Auth gate in App, loading splash | 11 |
| Profile/logout button in Home header | 12 |
| Repo with book_id↔bookId, uuid, activity, year_stats | 3, 4 |
| Online-first async store, optimistic + rollback | 9 |
| `loading` / `yearStats` / `signOut` on store | 9 |
| One-time migration, auto with dialog, id remap, no double-run | 5, 9, 11 |
| AnalyticsScreen reads yearStats from store | 10 |
| New users get empty archive | 10 (filter), 5 (no seed for new users) |
| Error handling (network, write fail, session expiry) | 9, 11, 6 |
| Vitest unit tests for repo mappers + migrate | 1, 3, 5 |
| deploy.yml env (before prod) | 13 |
| No edit UI for year_stats | (intentionally omitted) |
| Offline cache / realtime | (out of scope) |
