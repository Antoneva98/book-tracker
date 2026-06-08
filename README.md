# Трекер читання · тема «Світло»

Мінімалістичний, спокійний застосунок для **звички читати** (iOS-стиль, українська
мова). Шість екранів — Головна, Бібліотека, Книга, Статистика, Нотатки, Інсайти —
з плаваючою нижньою навігацією, світлою та темною темами.

Реалізовано на **Vite + React + TypeScript**. Денна активність читання (дата → сторінки)
зберігається у `localStorage` і є джерелом правди для серії, статистики та інсайтів.

## Запуск локально

```bash
npm install
npm run dev      # http://localhost:5173
```

Інші команди: `npm run build` (зібрати у `dist/`), `npm run preview` (переглянути збірку),
`npm run typecheck`.

## Деплой на GitHub Pages

1. Створіть репозиторій на GitHub і запуште цей проєкт у гілку `main`.
2. У репозиторії: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Готово — workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) на кожен
   пуш у `main` збирає застосунок і публікує його. Адреса з'явиться у вкладці **Actions**
   (зазвичай `https://<користувач>.github.io/<репозиторій>/`).

`vite.config.ts` використовує `base: "./"`, тож збірка працює за будь-якої назви репозиторію.

## Структура

| Шлях | Призначення |
|---|---|
| `src/styles/tokens.css` | Токени теми «Світло» (light + dark) |
| `src/styles/screens.css` | Стилі екранів і компонентів |
| `src/i18n/uk.ts` | Шар локалізації (увесь текст інтерфейсу) |
| `src/data/seed.ts` | Початкові дані (книги, нотатки, активність) |
| `src/data/store.ts` | Стан + збереження у `localStorage` |
| `src/data/derive.ts` | Похідні (серія, теплокарта) з журналу активності |
| `src/components/` | Спільні примітиви (Cover, Ring, Progress, TabBar, …) |
| `src/screens/` | Шість екранів |
| `reference/`, `screenshots/` | Оригінальні дизайн-референси (не використовуються у збірці) |

Повна специфікація дизайну — нижче.

---

# Handoff: Трекер читання — тема «Світло» (Book Tracker, "Світло" theme)

## Overview
A minimalist personal **reading-habit tracker** for mobile (iOS-style). It helps a user build a
daily reading habit, track progress through physical books, reflect via structured notes, and see
calm behavioral insights — **without** social features, badges, aggressive gamification, or chart
overload.

This package documents **one** of three explored design systems: **«Світло»** — a light, calm,
royal-blue theme built on soft white cards. It ships with a matching **dark** variant.

Language: **Ukrainian** (UI copy below is exact). Numbers/dates use a monospaced face.

---

## About the Design Files
The files in `reference/` are **design references built in HTML/React** — a prototype that shows the
intended look, layout, and behavior. **They are not production code to ship directly.**

Your task is to **recreate these designs in the target codebase's environment** using its established
patterns and libraries (React Native, Swift/SwiftUI, Flutter, a web stack, etc.). If no environment
exists yet, pick the most appropriate framework for a mobile app and implement the designs there.
Treat the HTML/CSS as the **source of truth for visuals and tokens**, and the prose below as the spec.

### What's in `reference/`
| File | Role |
|---|---|
| `index.html` | Standalone preview of all 6 «Світло» screens with a light/dark toggle. Open it in a browser. |
| `svitlo-tokens.css` | **Distilled design tokens** for «Світло» (light + dark). Start here — port these first. |
| `theme.css` | Working theme source. Contains the `.phone` shell + all token sets (the other two themes are present but unused here). |
| `screens.css` | All component/layout styles, consuming the `--c-*` tokens. The precise source for spacing, radii, type. |
| `components.jsx` | Shared primitives: icons, `Cover`, `Ring`, `Progress`, `StatusBar`, `TabBar`, helpers. |
| `screens.jsx` | The six screens + the `BookApp` shell that holds all live state. |
| `data.js` | Sample data model (books, notes, daily activity, monthly aggregates, insights) + derived helpers. |

---

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, and interactions are all defined.
Recreate the UI pixel-accurately using your codebase's component library. Exact hex values, sizes,
and copy are given below.

## Screenshots
Rendered references in `screenshots/` (all «Світло»):
| File | Screen |
|---|---|
| `01-home.png` | Home / Головна (light) |
| `02-library.png` | Library / Бібліотека |
| `03-detail.png` | Book detail / Книга |
| `04-analytics.png` | Analytics / Статистика |
| `05-notes.png` | Notes / Нотатки |
| `06-insights.png` | Insights / Інсайти |
| `07-home-dark.png` | Home in **dark** theme |

---

## Design Tokens

### Colors — Light (default)
| Token | Hex / value | Use |
|---|---|---|
| `--c-bg` | `#eef1f8` | App background |
| `--c-surface` | `#ffffff` | Cards |
| `--c-surface-2` | `#f3f5fb` | Insets: progress track, search field, steppers |
| `--c-ink` | `#131a2b` | Primary text |
| `--c-ink-2` | `#5a6478` | Secondary text |
| `--c-ink-3` | `#95a0b6` | Tertiary text, placeholders, captions |
| `--c-line` | `rgba(19,26,43,.07)` | Hairlines |
| `--c-line-strong` | `rgba(19,26,43,.14)` | Stepper borders, dividers, meta-grid gridlines |
| `--c-accent` | `#2f5bff` | Royal blue — primary buttons, active tab/chip, links, progress fill |
| `--c-accent-ink` | `#ffffff` | Text/icon on accent fills |
| `--c-accent-soft` | `rgba(47,91,255,.12)` | "Idea" note tag bg, insight icon bg |
| `--c-warn` | `#f0992b` | **Streak ring**, "Quote" note tag, activity heat dots |
| `--c-good` | `#2b9d6e` | Completed status, "read today" confirm button |
| `--c-bad` | `#e05656` | Abandoned status |

### Colors — Dark
| Token | Hex / value |
|---|---|
| `--c-bg` | `#0c1120` |
| `--c-surface` | `#141a2c` |
| `--c-surface-2` | `#1b2236` |
| `--c-ink` | `#eef2fb` |
| `--c-ink-2` | `#aab3c9` |
| `--c-ink-3` | `#6c768e` |
| `--c-line` | `rgba(255,255,255,.08)` |
| `--c-line-strong` | `rgba(255,255,255,.16)` |
| `--c-accent` | `#5b82ff` |
| `--c-accent-ink` | `#07101f` |
| `--c-accent-soft` | `rgba(91,130,255,.16)` |
| `--c-warn` | `#f0b04a` |
| `--c-good` | `#2b9d6e` · `--c-bad` `#e05656` |

### Typography
- **Display / UI:** `Manrope` (weights 400–800). Headings use **800**.
- **Body:** `Manrope`.
- **Numbers, dates, %, page counts:** `JetBrains Mono` (500–700), `font-variant-numeric: tabular-nums`, letter-spacing `-0.02em`.
- **Book-cover lettering only:** `Spectral` (serif) — used inside the designed covers, not in the UI chrome.

Type scale (size / weight / line-height / tracking):
| Style | Size | Weight | LH | Tracking | Notes |
|---|---|---|---|---|---|
| Screen title (`.h-title`) | 30px | 800 | 1.04 | -0.02em | e.g. "Бібліотека" |
| Detail title | 23px | 800 | 1.08 | -0.02em | |
| Section label | 16px | 700 | — | -0.01em | "Сторінки за місяць" |
| Eyebrow | 11px | 700 | — | 0.14em, UPPERCASE | accent-colored; muted variant uses `--c-ink-3` |
| Big stat number | 44px | 700 | 0.9 | -0.04em | mono, tabular |
| Body / note text | 15px | 400 | 1.55 | — | |
| List title (`.b-title`) | 15px | 700 | — | — | |
| List author | 12.5px | 400 | — | — | `--c-ink-2` |
| Meta/caption | 11–13px | 400–700 | — | — | mono for values |
| Button label | 15px | 700 | — | 0.01em | |
| Tab label | 9.5px | 700 | — | 0.02em | |

### Spacing
8-pt-based scale used throughout: **4, 8, 12, 16, 20, 24, 32, 48, 64**.
- Screen horizontal padding: **22px**. Scroll region bottom padding: **116px** (clears the floating tab bar).
- Card padding: **16–18px**. Gaps between stacked cards: **16px**.

### Radii
| Token | Value | Applied to |
|---|---|---|
| `--radius` | 22px | Cards, search field, segmented-control thumb |
| `--radius-sm` | 14px | List rows, meta cells, notes, insight icon |
| `--radius-lg` | 30px | Floating tab bar |
| `--radius-pill` | 999px | Buttons, chips, progress bars, status dots |
| (covers) | 6px | Designed book covers |

### Shadows
- Card: `0 2px 10px rgba(19,26,43,.05)` (light) / `0 2px 10px rgba(0,0,0,.35)` (dark)
- Tab bar / toast: `0 22px 48px -18px rgba(40,60,140,.28)` (light) / `…rgba(0,0,0,.6)` (dark)
- Book cover: `0 6px 16px -6px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.3)`

### Motion
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out).
- Screen enter: fade + 10px rise, ~420ms.
- Ring sweep: stroke-dashoffset, ~900ms. Progress fill: width, ~600ms. Bars grow with 60ms stagger.
- Honour `prefers-reduced-motion: reduce` (disable the entrance animation).

---

## Navigation & Shell
- **Bottom tab bar** — a floating pill, `--c-surface`, `--radius-lg`, `--shadow-lg`, inset 14px from the
  bottom, 64px tall, `backdrop-filter: blur(8px)`. 5 tabs, icon + label stacked, active tab tinted
  `--c-accent`. The "Інсайти" tab icon fills when active.
  - Tabs: **Головна** (home), **Бібліотека** (library), **Статистика** (chart), **Нотатки** (note), **Інсайти** (spark).
- **Status bar** — faux iOS bar, 50px, 9:41 + signal/wifi/battery glyphs in `--c-ink`.
- Book detail is a sub-view of Library (the tab bar keeps "Бібліотека" highlighted while it's open).

---

## Screens / Views

### 1 · Home / Головна  (`initial="home"`)
**Purpose:** daily touchpoint — see current book, log today's reading, glance at streak & goal.

Layout, top → bottom (single scroll column, 22px side padding):
1. **Greeting header** — muted eyebrow `НЕДІЛЯ · 8 ЧЕРВНЯ`; `.h-title` greeting `Доброго вечора.`
   (time-based: ранку / дня / вечора).
2. **"Зараз читаю" hero card** (`--c-surface`, radius 22, padding 16):
   - Tappable row → opens Book detail. Cover (78px wide, 2:3) + column: accent eyebrow `Зараз читаю`,
     title 17px/700, author 12.5px.
   - **Progress** bar (track `--c-surface-2`, fill `--c-accent`, 7px tall, pill) + meta row:
     `142 / 224 стор.` (mono, `--c-ink-2`) and `63%` (accent, bold).
   - **Primary button** `Я читав сьогодні` (check icon, accent fill, full width, pill).
     - On tap → inline logger card (`--c-surface-2`): "Скільки сторінок?" + a **stepper** (–/value/+,
       step 5, default 20) + green **`Зберегти`** button.
     - After saving → adds pages to the current book, shows toast `Записано! +N стор. сьогодні`,
       streak +1, and a green confirmation line `Прочитано сьогодні`.
3. **Two rings, side by side** (grid, 12px gap):
   - **Серія читання** (streak) — `Ring`, color `--c-warn`, center = streak number + "днів";
     subtitle "день за днем".
   - **Ціль 2026** (goal) — `Ring`, color `--c-accent`, center = books finished + "з 12";
     subtitle "{remaining} попереду".
4. **Insight teaser** — tappable insight card (icon + title + text) → navigates to Інсайти.

### 2 · Library / Бібліотека  (`initial="library"`)
**Purpose:** browse the whole shelf, filter by status.
1. Header row: `.h-title` "Бібліотека" + a **FAB** (accent, `--radius-sm`, plus icon → toast "Додавання книги").
2. **Search field** card: search icon + input, placeholder `Назва або автор…`.
3. **Filter chips** (pill, wrap): `Усі`, `Читаю`, `Прочитано`, `Плани`, `Покинуто`. Active chip = accent fill.
4. **Book grid** — 3 columns, 16×14px gaps. Each cell: designed cover, then a row of a status dot
   (color by status) + title (700, ellipsis), and the author's last name beneath. Tap → Book detail.
   Empty state: centered "Нічого не знайдено".

### 3 · Book Detail / Книга  (`initial="detail"`, sample book `tini`)
**Purpose:** manage one book.
1. Top bar: back link `← Бібліотека` (accent) and a share icon (muted).
2. **Hero**: large cover (124px) + column with **status pill** (dot + uppercase label), title (23/800),
   author, and a 5-star rating row (filled to `book.rating`, `--c-warn`) when present.
3. **Blurb** paragraph (`--c-ink-2`).
4. **Progress** bar + meta.
5. **"Оновити прогрес" card** (only when status = `reading`): eyebrow + stepper (–/value/+ step 5,
   clamped 0…pages) + accent **`Зберегти прогрес`** button (disabled until value changes). Saving past
   `pages` flips the book to **completed** and stamps the finish date.
6. **Meta grid** (2×2, hairline-separated cells): Сторінок, Жанр, Початок, Завершено (dates via mono).
7. **Notes section**: "Нотатки" + "Усі ›"; list of this book's notes (compact cards) and a ghost
   **`+ Додати нотатку`** button → Нотатки.

### 4 · Analytics / Статистика  (`initial="analytics"`)
**Purpose:** simple, calm stats — books and pages per month/year only.
1. `.h-title` "Статистика".
2. **Segmented control**: `Місяць` / `Рік` (thumb = `--c-surface`, active label `--c-ink`).
3. **Two stat cards**: "Книг за рік/місяць" → big number + "завершено"; "Сторінок…" → big number
   (locale-grouped, e.g. `5 970`) + "прочитано".
4. **Bar chart** "Сторінки за місяць" — 6 columns (Січ…Чер), accent bars, value-scaled height,
   month label beneath. 150px tall.
5. **"Книги за місяць"** — simple legend list: swatch + month + count (mono).
6. **"Активність · 10 тижнів"** — calm dot heatmap: 7 rows × 10 cols, empty = `--c-surface-2`,
   active = `--c-warn` at one of 3 opacity levels (0.35/0.65/1) by page volume. Tooltip = date + pages.

### 5 · Notes / Нотатки  (`initial="notes"`)
**Purpose:** fast, frictionless reflection. Notes are typed: **Ідея / Цитата / Застосування**.
1. `.h-title` "Нотатки".
2. **Composer card**: a 3-way type picker (pills; selected pill takes its type color — idea=accent,
   quote=warn, application=good), a textarea (placeholder `Запиши думку, цитату чи як це застосувати…`),
   and an accent **`+ Додати нотатку`** button (disabled until non-empty). Adds to the top of the list,
   attached to the current book, toast `Нотатку додано`.
3. **Filter chips**: Усі / Ідея / Цитата / Застосування.
4. **Note list** — cards with a colored **type tag**, the text (quotes render italic in `Spectral`),
   and a source line `{Book title} · с. {page}` (mono, muted).

### 6 · Insights / Інсайти  (`initial="insights"`)
**Purpose:** 1–2 gentle behavioral observations at a time. No pressure.
1. Header: muted eyebrow `ТИЖДЕНЬ ЗА ТИЖНЕМ`, `.h-title` "Інсайти", subtitle
   "Спокійні спостереження про твій ритм читання. Без тиску."
2. **Insight cards** (gap 16): rounded icon chip (`--c-accent-soft` bg, accent icon) + title (700) +
   text (`--c-ink-2`). Icon by kind: rhythm→trend, up→chart, time→clock, pace→target.

---

## Interactions & Behavior
- **Tab navigation** resets scroll to top on switch.
- **Tap a book** anywhere (hero, grid, … ) → Book detail; **back** returns to Library.
- **"Я читав сьогодні"** → reveals page logger → save increments current book's `read`, sets
  `doneToday`, bumps streak, toast.
- **Update progress** stepper (step 5, clamped) → save persists `read`; reaching `pages` → status
  `completed` + finish date.
- **Add note** → prepends to notes, tagged with current book + current page.
- **Toast**: bottom-centered pill, `--c-ink` bg on `--c-bg` text, auto-dismiss ~1.9s.
- All press targets ≥ 44px. Buttons scale to 0.975 on `:active`.

## State Management
Held in the `BookApp` shell (see `screens.jsx`):
- `screen` — current view (`home|library|detail|analytics|notes|insights`).
- `detailId` — book open in detail.
- `books[]` — working copy of the book list (mutated by logging / progress updates).
- `notes[]` — working copy (prepended on add).
- `doneToday` (bool) + derived `streak` = `baseStreak + (doneToday ? 1 : 0)`.
- `toastMsg` (transient).
- Derived: `currentId` (first `reading` book), `finishedThisYear` (Σ monthly books = 7), `streak`.

In production, back these with a real store + persistence. Persist: daily activity log (date→pages),
per-book `read` + start/finish dates, page-progress history, notes. The UI only needs current values,
but the **data layer should store daily activity** so streaks/analytics/insights stay accurate.

## Data Model (see `data.js`)
- **Book**: `id, title, author, pages, read, status (reading|completed|abandoned|toread), genre,
  start, finish, rating, cover{bg,fg,accent,style}, blurb`.
- **Note**: `id, bookId, type (idea|quote|application), page, text, date`.
- **Activity**: `{ 'YYYY-MM-DD': pagesRead }` for the trailing 90 days → streak/heatmap.
- **Monthly**: `[{ month, pages, books }]` → analytics.
- **Insights**: `[{ id, kind, title, text }]`.
- Helpers: `currentStreak()`, `pagesToday()`, `last7()`, `heat(weeks)`, `byId/byStatus/notesFor`.

## Book covers
Covers are **designed typographically in CSS** (no copyrighted artwork). Each book carries a
`cover` object: `bg`, `fg`, `accent`, and a `style` motif — one of `frame, grid, star, leaf, split,
type`. The `Cover` component (in `components.jsx`) renders genre eyebrow + title + author + the motif.
In production you can keep this generative-cover approach, **or** fetch real cover images by ISBN and
fall back to the generated design (the spec lists "auto-fetch cover, manual override").

## Assets
- **No raster assets.** All icons are inline SVG (stroke-based, 24×24, `currentColor`) — see
  `ICON_PATHS` in `components.jsx`. Status-bar glyphs and star/rating are inline SVG too.
- **Fonts** from Google Fonts: Manrope, JetBrains Mono, Spectral (Cyrillic subsets). Swap for your
  app's licensed equivalents if needed; keep a geometric humanist sans + a mono for numerals.

## Files to reference
`reference/index.html` (run it), then `reference/svitlo-tokens.css` → `reference/screens.css` →
`reference/screens.jsx` / `reference/components.jsx` / `reference/data.js`.
