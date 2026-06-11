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
  goalTitle: (y: number) => `Ціль ${y}`,
  goalOf: (n: number) => `з ${n}`,
  goalAhead: (n: number) => `${n} попереду`,
  goalNone: "без цілі",
  goalSetCta: "Постав ціль",
  goalEditTitle: (y: number) => `Ціль на ${y} рік`,
  goalQuestion: "Скільки книг прочитати?",
  goalRemove: "Прибрати ціль",
  goalSavedToast: "Ціль збережено",
  booksUnitShort: "книг",

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
  notePage: "Сторінка",
  noteAddedToast: "Нотатку додано",
  noNotes: "Ще немає нотаток.",
  typeIdea: "Ідея",
  typeQuote: "Цитата",
  typeApplication: "Застосування",

  // insights
  insightsEyebrow: "Тиждень за тижнем",
  insights: "Інсайти",
  insightsSub: "Спокійні спостереження про твій ритм читання.",

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
  insightsEmpty: "Спостереження з'являться, коли ти трохи почитаєш.",

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

  // auth
  appName: "Світло",
  loginTagline: "Твій тихий трекер читання",
  signInGoogle: "Увійти через Google",
  orDivider: "або",
  emailPlaceholder: "твоя@пошта.com",
  sendMagicLink: "Надіслати посилання",
  magicLinkSent: "Перевір пошту — ми надіслали посилання для входу.",
  signOut: "Вийти",
  menu: "Меню",
  themeLight: "Світла тема",
  themeDark: "Темна тема",
  // loading / errors
  loadingData: "Завантаження…",
  offlineTitle: "Немає з’єднання",
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
};

export type Dict = typeof uk;
export const t = uk;
