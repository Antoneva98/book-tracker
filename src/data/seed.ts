// Sample data (Ukrainian), ported from reference/data.js.
// The activity log is the source of truth for streak/heatmap; books carry
// their own read/progress + start/finish dates. "Today" is anchored to
// 2026-06-08 so the seeded activity pattern and screenshots stay accurate.

import type { Activity, Book, Insight, MonthAggregate, Note } from "../types";

/** The app's "today" anchor for the demo dataset. */
export const TODAY = new Date("2026-06-08T09:00:00");

export function iso(d: Date): string {
  // Local date (not UTC) so day boundaries match the anchor above.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysAgo(n: number, from: Date = TODAY): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

export const SEED_BOOKS: Book[] = [
  {
    id: "tini",
    title: "Тіні забутих предків",
    author: "Михайло Коцюбинський",
    pages: 224,
    read: 142,
    status: "reading",
    genre: "Класика",
    start: "2026-05-12",
    finish: null,
    rating: null,
    cover: { bg: "#1f3d2e", fg: "#e9d8a6", accent: "#c97b3c", style: "frame" },
    blurb:
      "Гуцульська трагедія про Івана та Марічку — кохання, що сильніше за смерть.",
  },
  {
    id: "misto",
    title: "Місто",
    author: "Валер'ян Підмогильний",
    pages: 384,
    read: 96,
    status: "reading",
    genre: "Роман",
    start: "2026-05-28",
    finish: null,
    rating: null,
    cover: { bg: "#26313f", fg: "#f2efe6", accent: "#e2603b", style: "grid" },
    blurb: "Степан Радченко підкорює Київ — амбіції, спокуси й ціна успіху.",
  },
  {
    id: "pryns",
    title: "Маленький принц",
    author: "Антуан де Сент-Екзюпері",
    pages: 112,
    read: 88,
    status: "reading",
    genre: "Притча",
    start: "2026-06-01",
    finish: null,
    rating: null,
    cover: { bg: "#1d2a52", fg: "#f6c453", accent: "#f6c453", style: "star" },
    blurb: "Найголовнішого очима не побачиш — пильнує лише серце.",
  },
  {
    id: "kobzar",
    title: "Кобзар",
    author: "Тарас Шевченко",
    pages: 540,
    read: 540,
    status: "completed",
    genre: "Поезія",
    start: "2026-02-03",
    finish: "2026-04-18",
    rating: 5,
    cover: { bg: "#3a2417", fg: "#e9d8a6", accent: "#c0392b", style: "frame" },
    blurb: "Голос народу — від «Заповіту» до «Гайдамаків».",
  },
  {
    id: "lisova",
    title: "Лісова пісня",
    author: "Леся Українка",
    pages: 160,
    read: 160,
    status: "completed",
    genre: "Драма",
    start: "2026-04-22",
    finish: "2026-05-06",
    rating: 5,
    cover: { bg: "#234438", fg: "#f0ead2", accent: "#7fb069", style: "leaf" },
    blurb: "Мавка, Лукаш і вічна пісня лісу про душу та зраду.",
  },
  {
    id: "sapiens",
    title: "Сапієнс",
    author: "Ювал Ной Харарі",
    pages: 512,
    read: 188,
    status: "abandoned",
    genre: "Нон-фікшн",
    start: "2026-03-10",
    finish: null,
    rating: 3,
    cover: { bg: "#d9c5a0", fg: "#1a1a1a", accent: "#1a1a1a", style: "type" },
    blurb: "Коротка історія людства — від савани до алгоритмів.",
  },
  {
    id: "kaneman",
    title: "Мислення швидке й повільне",
    author: "Деніел Канеман",
    pages: 480,
    read: 0,
    status: "toread",
    genre: "Нон-фікшн",
    start: null,
    finish: null,
    rating: null,
    cover: { bg: "#11151c", fg: "#e8e8e8", accent: "#e2603b", style: "split" },
    blurb: "Дві системи мислення, що керують усім, як ми вирішуємо.",
  },
  {
    id: "pratchet",
    title: "Колір магії",
    author: "Террі Пратчетт",
    pages: 288,
    read: 0,
    status: "toread",
    genre: "Фентезі",
    start: null,
    finish: null,
    rating: null,
    cover: { bg: "#4a1f5e", fg: "#f6c453", accent: "#7fb069", style: "star" },
    blurb: "Перша подорож Дискосвітом — хаос, тролі й невдаха-чарівник.",
  },
];

export const SEED_NOTES: Note[] = [
  {
    id: "n1",
    bookId: "pryns",
    type: "idea",
    page: 67,
    text: "Приручити — означає взяти відповідальність назавжди. Зв'язок робить буденне унікальним.",
    date: "2026-06-06",
  },
  {
    id: "n2",
    bookId: "pryns",
    type: "quote",
    page: 72,
    text: "«Ти назавжди береш на себе відповідальність за тих, кого приручив.»",
    date: "2026-06-06",
  },
  {
    id: "n3",
    bookId: "misto",
    type: "application",
    page: 88,
    text: "Помічати, коли амбіція починає витісняти людей навколо — раз на тиждень звіряти мотиви.",
    date: "2026-06-04",
  },
  {
    id: "n4",
    bookId: "tini",
    type: "idea",
    page: 130,
    text: "Природа в Коцюбинського — не тло, а діюча особа. Ландшафт відчуває разом із героями.",
    date: "2026-06-02",
  },
  {
    id: "n5",
    bookId: "kobzar",
    type: "quote",
    page: 211,
    text: "«Борітеся — поборете, вам Бог помагає!»",
    date: "2026-04-15",
  },
  {
    id: "n6",
    bookId: "lisova",
    type: "application",
    page: 140,
    text: "Не зраджувати власну «пісню» заради побутового комфорту — тримати творчий ритуал щоранку.",
    date: "2026-05-05",
  },
];

const PAGE_PATTERN = [
  22, 18, 0, 30, 26, 14, 0, 0, 24, 31, 19, 0, 28, 22, 17, 0, 25, 33, 20, 0, 0,
  29, 18, 24, 15, 0, 27, 30, 21, 0, 19, 26, 0, 0, 23, 28, 16, 31, 0, 22, 20, 0,
  25, 18, 29, 0, 0, 24, 33, 21, 17, 0, 26, 22, 19, 0, 28, 24, 0, 20, 31, 18, 0,
  0, 25, 29, 23, 16, 0, 27, 30, 21, 19, 0, 24, 0, 28, 22, 18, 26, 31, 20, 0, 25,
  29, 17, 23, 0, 30, 24,
];

export function buildSeedActivity(): Activity {
  const activity: Activity = {};
  for (let i = 0; i < 90; i++) {
    activity[iso(daysAgo(i))] = PAGE_PATTERN[i] || 0;
  }
  // Ensure a live current streak (last few days read).
  activity[iso(daysAgo(0))] = 28;
  activity[iso(daysAgo(1))] = 24;
  activity[iso(daysAgo(2))] = 19;
  activity[iso(daysAgo(3))] = 31;
  activity[iso(daysAgo(4))] = 22;
  return activity;
}

// Monthly aggregates for analytics (books finished + pages read).
export const SEED_MONTHLY: MonthAggregate[] = [
  { month: "Січ", pages: 410, books: 1 },
  { month: "Лют", pages: 980, books: 1 },
  { month: "Бер", pages: 1240, books: 2 },
  { month: "Кві", pages: 1520, books: 2 },
  { month: "Тра", pages: 1180, books: 1 },
  { month: "Чер", pages: 640, books: 0 },
];

export const SEED_INSIGHTS: Insight[] = [
  {
    id: "i1",
    kind: "rhythm",
    title: "Ти читаєш хвилями",
    text: "Зазвичай 5 днів поспіль, потім день паузи. Це твій природний ритм — не привід картати себе.",
  },
  {
    id: "i2",
    kind: "up",
    title: "Цього місяця — рівніше",
    text: "У травні ти пропускав у середньому 2 дні на тиждень. У червні — лише один. Звичка міцнішає.",
  },
  {
    id: "i3",
    kind: "time",
    title: "Вечір — твій час",
    text: "78% сторінок ти читаєш після 21:00. Спробуй залишати книжку біля подушки.",
  },
  {
    id: "i4",
    kind: "pace",
    title: "Маленький принц майже завершений",
    text: "Лишилось 24 сторінки. За твоїм темпом — це один вечір.",
  },
];
