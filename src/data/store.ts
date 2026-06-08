// Persisted application state. The activity log (date → pages) is the
// source of truth for streak/analytics/insights, so it is stored even
// though most screens read derived values. Persistence is localStorage.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Activity, Book, Note, NoteType } from "../types";
import { t } from "../i18n/uk";
import {
  buildSeedActivity,
  daysAgo,
  iso,
  SEED_BOOKS,
  SEED_MONTHLY,
  SEED_NOTES,
} from "./seed";
import { baseStreak } from "./derive";

const STORAGE_KEY = "svitlo-book-tracker";
const STORAGE_VERSION = 1;
const TODAY_ISO = iso(daysAgo(0));

interface Persisted {
  version: number;
  books: Book[];
  notes: Note[];
  activity: Activity;
  doneToday: boolean;
}

function seedState(): Persisted {
  return {
    version: STORAGE_VERSION,
    books: SEED_BOOKS.map((b) => ({ ...b, cover: { ...b.cover } })),
    notes: SEED_NOTES.map((n) => ({ ...n })),
    activity: buildSeedActivity(),
    doneToday: false,
  };
}

function loadState(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed.version !== STORAGE_VERSION) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export interface BookStore {
  books: Book[];
  notes: Note[];
  activity: Activity;
  current: Book;
  currentId: string;
  streak: number;
  doneToday: boolean;
  finishedThisYear: number;
  toastMsg: string | null;
  // actions
  logReading: (pages: number) => void;
  updateProgress: (id: string, val: number) => void;
  addNote: (type: NoteType, text: string) => void;
  notesFor: (id: string) => Note[];
  toast: (msg: string) => void;
  resetData: () => void;
}

export function useBookStore(): BookStore {
  const [state, setState] = useState<Persisted>(loadState);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable (private mode) — run in-memory */
    }
  }, [state]);

  const { books, notes, activity, doneToday } = state;

  const currentId = useMemo(
    () => books.find((b) => b.status === "reading")?.id ?? books[0].id,
    [books],
  );
  const current = useMemo(
    () => books.find((b) => b.id === currentId) ?? books[0],
    [books, currentId],
  );
  const streak = useMemo(
    () => baseStreak(activity) + (doneToday ? 1 : 0),
    [activity, doneToday],
  );
  const finishedThisYear = useMemo(
    () => SEED_MONTHLY.reduce((s, d) => s + d.books, 0),
    [],
  );

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1900);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const logReading = useCallback(
    (pages: number) => {
      setState((prev) => {
        const cId = prev.books.find((b) => b.status === "reading")?.id ??
          prev.books[0].id;
        return {
          ...prev,
          books: prev.books.map((b) =>
            b.id === cId
              ? { ...b, read: Math.min(b.pages, b.read + pages) }
              : b,
          ),
          // activity log is the source of truth — record today's pages
          activity: {
            ...prev.activity,
            [TODAY_ISO]: (prev.activity[TODAY_ISO] || 0) + pages,
          },
          doneToday: true,
        };
      });
      toast(t.loggedToast(pages));
    },
    [toast],
  );

  const updateProgress = useCallback(
    (id: string, val: number) => {
      let completed = false;
      setState((prev) => ({
        ...prev,
        books: prev.books.map((b) => {
          if (b.id !== id) return b;
          const done = val >= b.pages;
          if (done && b.status !== "completed") completed = true;
          return {
            ...b,
            read: val,
            status: done ? "completed" : b.status,
            finish: done ? TODAY_ISO : b.finish,
          };
        }),
      }));
      toast(completed ? t.bookCompletedToast : t.progressUpdatedToast);
    },
    [toast],
  );

  const addNote = useCallback(
    (type: NoteType, text: string) => {
      setState((prev) => {
        const cId = prev.books.find((b) => b.status === "reading")?.id ??
          prev.books[0].id;
        const page = prev.books.find((b) => b.id === cId)?.read ?? 0;
        const note: Note = {
          id: "u" + Date.now(),
          bookId: cId,
          type,
          page,
          text,
          date: TODAY_ISO,
        };
        return { ...prev, notes: [note, ...prev.notes] };
      });
      toast(t.noteAddedToast);
    },
    [toast],
  );

  const notesFor = useCallback(
    (id: string) => notes.filter((n) => n.bookId === id),
    [notes],
  );

  const resetData = useCallback(() => {
    setState(seedState());
    toast("Дані скинуто");
  }, [toast]);

  return {
    books,
    notes,
    activity,
    current,
    currentId,
    streak,
    doneToday,
    finishedThisYear,
    toastMsg,
    logReading,
    updateProgress,
    addNote,
    notesFor,
    toast,
    resetData,
  };
}
