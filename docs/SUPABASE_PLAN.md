# План: багатокористувацький режим на Supabase

Мета: дати кожному користувачу окремий акаунт і власні дані (книги, нотатки,
активність, річний архів), із синхронізацією між пристроями. Фронтенд (React)
лишається на GitHub Pages і звертається до Supabase по мережі.

> Це план на майбутню ітерацію. Зараз застосунок працює на `localStorage`.

---

## 0. Як це працюватиме (огляд)

```
[React на GitHub Pages]  ──HTTPS──>  [Supabase: Auth + Postgres]
        │                                   │
   вхід (email/Google)              кожен рядок має user_id;
   читання/запис даних              Row-Level Security віддає
                                    користувачу ЛИШЕ його рядки
```

`anon`-ключ Supabase **можна публікувати** (він і так потрапляє у фронтенд) —
безпеку забезпечує не таємність ключа, а політики RLS на рівні бази.

---

## 1. Створити проєкт Supabase (у панелі supabase.com)

1. Зареєструватися → **New project**.
2. Вказати: назву, **Database password** (зберегти у менеджері паролів), регіон
   (напр. *Central EU (Frankfurt)*).
3. Після створення відкрити **Project Settings → API** і скопіювати:
   - **Project URL** (напр. `https://xxxx.supabase.co`)
   - **anon public** key

---

## 2. Схема бази + політики доступу

Відкрити **SQL Editor → New query**, вставити все нижче і натиснути **Run**.

```sql
-- ── Таблиці ───────────────────────────────────────────────
create table public.books (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null default auth.uid() references auth.users on delete cascade,
  title     text not null,
  author    text default '',
  pages     int  not null default 0,
  read      int  not null default 0,
  status    text not null default 'reading'
            check (status in ('reading','completed','abandoned','toread')),
  genre     text default '',
  start     date,
  finish    date,
  rating    int,
  cover     jsonb not null,                 -- { bg, fg, accent, style }
  blurb     text default '',
  created_at timestamptz not null default now()
);

create table public.notes (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null default auth.uid() references auth.users on delete cascade,
  book_id   uuid references public.books on delete cascade,
  type      text not null check (type in ('idea','quote','application')),
  page      int  default 0,
  text      text not null,
  date      date,
  created_at timestamptz not null default now()
);

create table public.activity (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  day     date not null,
  pages   int  not null default 0,
  primary key (user_id, day)
);

create table public.year_stats (         -- річний архів (твій 2019–2024 тощо)
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  year    int  not null,
  books   int  not null default 0,
  pages   int  not null default 0,
  primary key (user_id, year)
);

-- ── Увімкнути Row-Level Security ──────────────────────────
alter table public.books      enable row level security;
alter table public.notes      enable row level security;
alter table public.activity   enable row level security;
alter table public.year_stats enable row level security;

-- ── Політики: кожен працює лише зі своїми рядками ─────────
create policy "own books"  on public.books
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own notes"  on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own activity" on public.activity
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own year_stats" on public.year_stats
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Індекси для швидких вибірок ──────────────────────────
create index on public.books (user_id, created_at desc);
create index on public.notes (user_id, created_at desc);
create index on public.notes (book_id);
```

Модель повністю відповідає теперішнім типам у [`src/types.ts`](../src/types.ts)
(`cover` зберігаємо як JSON-об'єкт `{bg, fg, accent, style}`).

---

## 3. Налаштувати вхід (Authentication)

**Authentication → Providers:**
- **Email** — увімкнено за замовчуванням. Найпростіше: *magic link* (лист із
  посиланням, без паролів).
- **Google** (за бажанням): створити OAuth-клієнт у Google Cloud Console,
  вставити Client ID/Secret у Supabase.

**Authentication → URL Configuration:**
- **Site URL** = адреса сайту на Pages, напр. `https://antoneva98.github.io/<репо>/`
- **Redirect URLs** — додати ту саму адресу (і `http://localhost:5173` для
  локальної розробки).

---

## 4. Зміни у фронтенді (коли робитимемо)

1. Встановити SDK:
   ```bash
   npm i @supabase/supabase-js
   ```
2. Клієнт `src/data/supabase.ts`:
   ```ts
   import { createClient } from "@supabase/supabase-js";
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
   );
   ```
3. Екран входу (magic link / Google) + збереження сесії.
4. Переписати **лише** шар збереження — зараз це
   [`src/data/store.ts`](../src/data/store.ts): замість `localStorage` —
   читання/запис у Supabase (`select/insert/update/delete`). Усі екрани вже
   працюють через єдиний «store», тож їх майже не чіпаємо.
5. `localStorage` лишити як офлайн-кеш (необов'язково).
6. **Одноразова міграція**: при першому вході запропонувати залити поточні
   локальні дані (книги/нотатки/активність/архів) у хмару.

---

## 5. Секрети для збірки на GitHub

`anon`-ключ публічний, але зручно тримати його у змінних оточення:

1. У репозиторії: **Settings → Secrets and variables → Actions → New repository
   secret** додати:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. У [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) у кроці
   `npm run build` передати їх:
   ```yaml
   - run: npm run build
     env:
       VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
       VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
   ```
3. Для локальної розробки створити `.env.local` (він уже в `.gitignore` через
   `*.local`):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

---

## Орієнтовний обсяг
- Налаштування Supabase (кроки 1–3): ~30–40 хв у панелі.
- Зміни у фронтенді (крок 4): окрема ітерація на кілька годин.

## Вартість
Безкоштовного тарифу Supabase достатньо для особистого користування та друзів
(ліміти на розмір БД і активних користувачів — щедрі для такого застосунку).
