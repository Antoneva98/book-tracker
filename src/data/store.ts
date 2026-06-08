// Persisted application state. The activity log (date → pages) is the
// source of truth for streak/analytics/insights. Persistence is localStorage.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Activity, Book, BookStatus, Note, NoteType } from "../types";
import { t } from "../i18n/uk";
import {
  buildSeedActivity,
  coverFor,
  daysAgo,
  iso,
  SEED_BOOKS,
  SEED_NOTES,
  TODAY,
} from "./seed";
import { baseStreak, booksCompletedInYear } from "./derive";

const STORAGE_KEY = "svitlo-book-tracker";
const STORAGE_VERSION = 2; // bumped: empty library + CRUD
const TODAY_ISO = iso(daysAgo(0));
const YEAR = TODAY.getFullYear();

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
  current: Book | null;
  currentId: string | null;
  streak: number;
  doneToday: boolean;
  finishedThisYear: number;
  toastMsg: string | null;
  // actions
  logReading: (pages: number) => void;
  updateProgress: (id: string, val: number) => void;
  addNote: (type: NoteType, text: string) => void;
  deleteNote: (id: string) => void;
  addBook: (input: AddBookInput) => string;
  deleteBook: (id: string) => void;
  notesFor: (id: string) => Note[];
  toast: (msg: string) => void;
  resetData: () => void;
}

export function useBookStore(): BookStore {
  const [state, setState] = useState<Persisted>(loadState);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — run in-memory */
    }
  }, [state]);

  const { books, notes, activity, doneToday } = state;

  const currentId = useMemo(
    () => books.find((b) => b.status === "reading")?.id ?? books[0]?.id ?? null,
    [books],
  );
  const current = useMemo(
    () => books.find((b) => b.id === currentId) ?? null,
    [books, currentId],
  );
  const streak = useMemo(
    () => baseStreak(activity) + (doneToday ? 1 : 0),
    [activity, doneToday],
  );
  const finishedThisYear = useMemo(
    () => booksCompletedInYear(books, YEAR),
    [books],
  );

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

  const logReading = useCallback(
    (pages: number) => {
      setState((prev) => {
        const cId = prev.books.find((b) => b.status === "reading")?.id;
        return {
          ...prev,
          books: cId
            ? prev.books.map((b) =>
                b.id === cId
                  ? { ...b, read: Math.min(b.pages, b.read + pages) }
                  : b,
              )
            : prev.books,
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
          prev.books[0]?.id;
        if (!cId) return prev;
        const page = prev.books.find((b) => b.id === cId)?.read ?? 0;
        const note: Note = {
          id: "n" + Date.now(),
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

  const deleteNote = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        notes: prev.notes.filter((n) => n.id !== id),
      }));
      toast(t.noteDeletedToast);
    },
    [toast],
  );

  const addBook = useCallback(
    (input: AddBookInput): string => {
      const id = "b" + Date.now();
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
      setState((prev) => ({ ...prev, books: [book, ...prev.books] }));
      toast(t.bookAddedToast);
      return id;
    },
    [toast],
  );

  const deleteBook = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        books: prev.books.filter((b) => b.id !== id),
        notes: prev.notes.filter((n) => n.bookId !== id),
      }));
      toast(t.bookDeletedToast);
    },
    [toast],
  );

  const notesFor = useCallback(
    (id: string) => notes.filter((n) => n.bookId === id),
    [notes],
  );

  const resetData = useCallback(() => {
    setState(seedState());
    toast(t.dataResetToast);
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
    deleteNote,
    addBook,
    deleteBook,
    notesFor,
    toast,
    resetData,
  };
}
