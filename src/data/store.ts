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
  goal: number | null;
  toastMsg: string | null;
  loading: boolean;
  loadError: boolean;
  migrationPrompt: boolean;
  // actions
  logReading: (pages: number) => void;
  updateProgress: (id: string, val: number) => void;
  addNote: (type: NoteType, text: string, page: number) => void;
  deleteNote: (id: string) => void;
  addBook: (input: AddBookInput) => string;
  deleteBook: (id: string) => void;
  setGoal: (target: number | null) => void;
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
  const [goals, setGoals] = useState<Record<number, number>>({});
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
      setGoals(snap.goals);
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
  const goal = goals[YEAR] ?? null;

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
    (type: NoteType, text: string, page: number) => {
      const cId =
        books.find((b) => b.status === "reading")?.id ?? books[0]?.id;
      if (!cId) return;
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

  const setGoal = useCallback(
    (target: number | null) => {
      const prev = goals;
      setGoals((g) => {
        const next = { ...g };
        if (target == null) delete next[YEAR];
        else next[YEAR] = target;
        return next;
      });
      toast(t.goalSavedToast);
      void (async () => {
        try {
          if (target == null) await repo.deleteGoal(YEAR);
          else await repo.setGoal(YEAR, target);
        } catch {
          setGoals(prev);
          toast(t.saveFailed);
        }
      })();
    },
    [goals, toast],
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
    goal,
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
    setGoal,
    notesFor,
    toast,
    reload,
    confirmMigration,
    skipMigration,
    signOut,
  };
}
