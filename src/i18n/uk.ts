// Localisation layer. All UI copy lives here so other languages can be
// added later without touching components (per CLAUDE.md). Strings are the
// exact Ukrainian copy from the README. `t` is the active dictionary.

const uk = {
  // tab bar
  tabHome: "Головна",
  tabLibrary: "Бібліотека",
  tabAnalytics: "Статистика",
  tabNotes: "Нотатки",
  tabInsights: "Інсайти",

  // greetings (time-based)
  greetMorning: "Доброго ранку",
  greetDay: "Доброго дня",
  greetEvening: "Доброго вечора",

  // home
  nowReading: "Зараз читаю",
  readTodayCta: "Я читав сьогодні",
  howManyPages: "Скільки сторінок?",
  save: "Зберегти",
  readToday: "Прочитано сьогодні",
  streakTitle: "Серія читання",
  streakSub: "день за днем",
  streakUnit: "днів",
  goalTitle: "Ціль 2026",
  goalOf: (n: number) => `з ${n}`,
  goalAhead: (n: number) => `${n} попереду`,

  // library
  library: "Бібліотека",
  searchPlaceholder: "Назва або автор…",
  addBookToast: "Додавання книги — у прототипі",
  nothingFound: "Нічого не знайдено",
  filterAll: "Усі",
  filterReading: "Читаю",
  filterCompleted: "Прочитано",
  filterToread: "Плани",
  filterAbandoned: "Покинуто",

  // detail
  backToLibrary: "Бібліотека",
  shareToast: "Поділитися",
  updateProgress: "Оновити прогрес",
  saveProgress: "Зберегти прогрес",
  metaPages: "Сторінок",
  metaGenre: "Жанр",
  metaStart: "Початок",
  metaFinish: "Завершено",
  notes: "Нотатки",
  seeAll: "Усі",
  noBookNotes: "Ще немає нотаток до цієї книги.",
  addNote: "Додати нотатку",

  // analytics
  analytics: "Статистика",
  rangeMonth: "Місяць",
  rangeYear: "Рік",
  booksPerYear: "Книг за рік",
  booksPerMonth: "Книг за місяць",
  pagesPerYear: "Сторінок за рік",
  pagesPerMonthShort: "За місяць",
  completed: "завершено",
  read: "прочитано",
  pagesPerMonth: "Сторінки за місяць",
  booksByMonth: "Книги за місяць",
  activity10w: "Активність · 10 тижнів",

  // notes
  composerPlaceholder: "Запиши думку, цитату чи як це застосувати…",
  noteAddedToast: "Нотатку додано",
  noNotes: "Ще немає нотаток.",
  typeIdea: "Ідея",
  typeQuote: "Цитата",
  typeApplication: "Застосування",

  // insights
  insightsEyebrow: "Тиждень за тижнем",
  insights: "Інсайти",
  insightsSub: "Спокійні спостереження про твій ритм читання. Без тиску.",

  // statuses
  statusReading: "Читаю",
  statusCompleted: "Прочитано",
  statusAbandoned: "Покинуто",
  statusToread: "У планах",

  // misc
  pagesUnit: "стор.",
  pageAbbr: "с.",
  loggedToast: (n: number) => `Записано! +${n} стор. сьогодні`,
  progressUpdatedToast: "Прогрес оновлено",
  bookCompletedToast: "Книгу завершено 🎉",
  bookAddedToast: "Книгу додано",
  bookDeletedToast: "Книгу видалено",
  noteDeletedToast: "Нотатку видалено",
  dataResetToast: "Дані скинуто",

  // add book form
  addBookTitle: "Нова книга",
  fldTitle: "Назва",
  fldAuthor: "Автор",
  fldPages: "Сторінок",
  fldGenre: "Жанр",
  fldStatus: "Статус",
  fldCurrentPage: "Прочитано сторінок",
  fldRating: "Оцінка",
  fldTitlePh: "Назва книги",
  fldAuthorPh: "Ім'я автора",
  fldGenrePh: "напр. Роман, Нон-фікшн…",
  optional: "необов'язково",
  saveBook: "Зберегти книгу",
  cancel: "Скасувати",

  // delete
  deleteBook: "Видалити книгу",
  deleteBookConfirm: "Видалити цю книгу та її нотатки? Цю дію не можна скасувати.",
  deleteNoteAria: "Видалити нотатку",

  // empty states
  emptyHomeTitle: "Почни з першої книги",
  emptyHomeSub: "Додай книгу, яку зараз читаєш, — і щодня відмічай прогрес.",
  addFirstBook: "Додати книгу",
  emptyLibrary: "Бібліотека порожня. Додай першу книгу кнопкою «+».",
  insightsEmpty: "Спостереження з'являться, коли ти трохи почитаєш. Без поспіху.",

  // analytics — yearly history
  byYears: "За роками",
  totalRead: "Усього прочитано",
  booksWord: "книг",
  beforeAppNote: "Книги до 2025 — з твого читацького архіву.",

  // months (short, for dates)
  monthsShort: [
    "січ",
    "лют",
    "бер",
    "кві",
    "тра",
    "чер",
    "лип",
    "сер",
    "вер",
    "жов",
    "лис",
    "гру",
  ],
  monthsLong: [
    "січня",
    "лютого",
    "березня",
    "квітня",
    "травня",
    "червня",
    "липня",
    "серпня",
    "вересня",
    "жовтня",
    "листопада",
    "грудня",
  ],
  weekdays: [
    "Неділя",
    "Понеділок",
    "Вівторок",
    "Середа",
    "Четвер",
    "П’ятниця",
    "Субота",
  ],
};

export type Dict = typeof uk;
export const t = uk;
