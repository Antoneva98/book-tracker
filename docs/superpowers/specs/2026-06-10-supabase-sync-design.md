# Дизайн: багатокористувацький режим на Supabase

**Дата:** 2026-06-10
**Статус:** затверджено до реалізації

Перехід застосунку «Світло» з локального `localStorage` на хмару Supabase: окремі
акаунти, власні дані в кожного користувача, синхронізація між пристроями.
Фронтенд (React + Vite) лишається на GitHub Pages.

Інфраструктура вже готова (схема БД, RLS, індекси, Auth URL, секрети, SDK, клієнт
`src/data/supabase.ts`). Цей документ описує **крок 4 — код**.

---

## Рішення

| Тема | Рішення |
|---|---|
| Вхід | Google (основний) + email magic link (запасний) |
| Синхронізація | Онлайн-перший: база — джерело правди, стан у пам'яті під час роботи |
| Архітектура | Шар-репозиторій + оптимістичні оновлення; інтерфейс `store` незмінний |
| Локальні дані | Одноразова міграція в хмару при першому вході, автоматично з діалогом |
| Річний архів | Переносимо `year_stats`; нові юзери — порожньо; без UI редагування (поки) |
| Logout | Кнопка профілю в шапці Home (email + «Вийти») |
| Тести | Vitest (юніт-тести repo та migrate) |

---

## Архітектура модулів

```
src/data/supabase.ts        ✅ є — клієнт Supabase
src/data/repo.ts            🆕 async CRUD + мапінг рядок↔домен
src/data/migrate.ts         🆕 одноразова міграція localStorage → хмара
src/auth/useSession.ts      🆕 хук: стан сесії (user / loading / signOut)
src/screens/LoginScreen.tsx 🆕 екран входу (Google + email)
src/data/store.ts           ✏️ нутрощі переписуємо, інтерфейс лишаємо
src/screens/AnalyticsScreen.tsx ✏️ читає yearStats зі store замість константи
src/App.tsx                 ✏️ гейт: немає сесії → LoginScreen; інакше застосунок
src/components/...           ✏️ кнопка профілю в шапці Home
```

### Потік даних

```
App
 └─ useSession()  ── немає сесії ──> <LoginScreen/>
         │ є сесія
         ▼
   useBookStore()  ──fetchAll()──> Supabase (repo)
         │ перший вхід + є локальні дані ──> діалог міграції ──> migrate.ts
         ▼
   екрани (Home, Library, Analytics, …) — інтерфейс store незмінний
```

---

## Auth (`useSession.ts`, `LoginScreen.tsx`)

- `useSession` слухає `supabase.auth.onAuthStateChange`; тримає `{ user, loading }`.
- Поки сесія завантажується — лоадер (щоб не блимав LoginScreen).
- Після Google-редіректу Supabase сам підхоплює сесію з URL.
- `LoginScreen`: кнопка «Увійти через Google» (`signInWithOAuth({ provider: 'google' })`)
  + поле email для magic link (`signInWithOtp`).
- Протермінована сесія → `onAuthStateChange` повертає на LoginScreen.

> Передумова (поза кодом): створити OAuth-клієнт у Google Cloud Console,
> вставити Client ID/Secret у Supabase → Authentication → Sign In / Providers → Google.

---

## Repo (`repo.ts`) — єдине місце мапінгу

Дві невідповідності домен ↔ БД вирішуються тут:

1. **Поля:** `Note.bookId` ↔ `notes.book_id`. Функції `rowToBook/bookToRow`,
   `rowToNote/noteToRow`. `Book.cover` (jsonb) — без змін.
2. **ID:** при вставці id **не передаємо** — база видає `gen_random_uuid()`,
   повертаємо через `.insert(...).select().single()`. Тип `id: string` лишається.
3. **Activity:** у пам'яті об'єкт `{ "2026-06-10": 12 }`, у БД таблиця
   `activity(day, pages)`. Repo конвертує обидва боки; запис — `upsert` по `(user_id, day)`.
4. **year_stats:** таблиця `year_stats(year, books, pages)` ↔ масив `YearStat[]`.
5. `user_id` **не передаємо** — у схемі `default auth.uid()`, RLS не пустить чуже.

Функції:
```
fetchAll() → { books, notes, activity, yearStats }
insertBook(input) → Book        updateBook(id, patch)        deleteBook(id)
insertNote(input) → Note        deleteNote(id)
logActivity(day, pages)         // upsert
upsertYearStats(rows)           // використовується міграцією
```
Видалення книги: нотатки підчистить `ON DELETE CASCADE` у БД.

---

## Store (`store.ts`) — асинхронний, інтерфейс той самий

- При вході: `fetchAll()` → React-стан; поки тягнеться → `loading: true`.
- Кожна дія: **оптимістичне** оновлення стану + запис у базу через repo.
  Запис впав → відкат стану + toast «Не вдалося зберегти».
- Додаємо в `BookStore`: `loading: boolean`, `yearStats: YearStat[]`, `signOut()`.
- Прибираємо: localStorage-персистенс і `seedState()`.

`AnalyticsScreen` тепер бере річний архів з `ctx.yearStats` (зі store), а не з
імпортованої константи `YEARLY_HISTORY`.

---

## Міграція (`migrate.ts`) — одноразово, автоматично з підтвердженням

```
1. Користувач уперше залогінився.
2. Перевірка: хмара порожня? ТА є дані в localStorage АБО в YEARLY_HISTORY?
3. Якщо так → діалог «Перенести твої дані у хмару?».
4. На «так»: заливаємо localStorage (books, notes, activity) + YEARLY_HISTORY
   (year_stats) → Supabase через repo.
5. Ставимо прапорець "migrated" у localStorage, щоб не питати знову.
```

- **Старі id не переносимо:** база видає нові uuid; нотатки прив'язуємо до нових
  id книг через тимчасову мапу `oldBookId → newBookId`.
- **Захист від подвоєння:** прапорець "migrated" + перевірка «хмара порожня».
- **Збій на півдорозі:** прапорець не ставимо → запропонуємо ще раз наступного разу.
- `YEARLY_HISTORY` лишається в `seed.ts` **лише** як джерело для міграції; для
  відображення більше не використовується. Нові користувачі — порожній архів.

---

## Обробка помилок

| Ситуація | Поведінка |
|---|---|
| Немає мережі при вході | Екран «Немає з'єднання» + «Спробувати ще» (не порожня бібліотека) |
| Запис дії впав | Відкат оптимістичного оновлення + toast |
| Сесія протермінувалася | `onAuthStateChange` → LoginScreen |
| Міграція впала | Не ставимо прапорець → повторна пропозиція |
| Немає env-ключів | `supabase.ts` кидає зрозумілу помилку (вже зроблено) |

---

## Тестування (Vitest)

Додаємо Vitest (рідний для Vite). Юніт-тести чистих функцій, без мережі:

- **repo.ts** — мапінг `rowToBook/bookToRow`, `rowToNote/noteToRow`
  (особливо `book_id↔bookId`), конвертація activity рядки↔об'єкт.
- **migrate.ts** — будує правильний набір вставок з localStorage + YEARLY_HISTORY;
  коректно мапить нотатки на нові id книг через тимчасову мапу.
- **Ручна перевірка** (E2E ускладнений Google OAuth): вхід → міграція → дані на
  місці → додати книгу → перезавантажити → збереглося → вихід/вхід.

---

## Поза scope (на потім)

- Офлайн-кеш / робота без мережі.
- UI редагування річного архіву вручну.
- Realtime-підписки.
- Передати Supabase-env у `deploy.yml` (крок 5 плану) — зробити перед прод-деплоєм:
  ```yaml
  - run: npm run build
    env:
      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  ```
