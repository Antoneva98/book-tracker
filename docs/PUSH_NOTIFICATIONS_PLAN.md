# План: щоденні нагадування читати (Web Push)

Мета: щодня у вибраний час надсилати пуш «📖 Час почитати», навіть коли
застосунок закритий. Працює через **Web Push** + **Supabase** (зберігання
підписок і планувальник).

> Це план. Нічого ще не реалізовано. Реалізація — окрема ітерація.

---

## Обмеження (важливо)
- Пуші на iPhone приходять **лише** якщо застосунок **додано на екран «Початок»**,
  на **iOS 16.4+**, і користувач **дав дозвіл**. У звичайній вкладці Safari — ні.
- Дозвіл на сповіщення можна запитати **тільки за дією користувача** (натискання
  кнопки), і на iOS — у режимі встановленого застосунку (standalone).
- Надсилає сервер (Supabase Edge Function за розкладом); пристрій лише показує.

## Архітектура
```
[Застосунок] --підписка(endpoint,keys)--> [Supabase: push_subscriptions]
[Застосунок] --налаштування(час,увімк.)--> [Supabase: reminder_settings]

[pg_cron щогодини] -> [Edge Function send-reminders]
   -> вибирає юзерів, у кого зараз їх час і увімкнено
   -> для кожного шле Web Push (підпис VAPID) на їхні endpoints
[Service worker] --подія push--> показує сповіщення
```

---

## Крок 1. Згенерувати VAPID-ключі (один раз)
Локально:
```bash
npx web-push generate-vapid-keys
```
Отримаєш `Public Key` і `Private Key`. Публічний піде у фронтенд, приватний —
у секрети Supabase (нікуди більше).

## Крок 2. Таблиці в Supabase (SQL Editor → Run)
```sql
-- підписки пристроїв (у одного юзера може бути кілька)
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "own subs" on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- налаштування нагадувань (одне на користувача)
create table public.reminder_settings (
  user_id     uuid primary key default auth.uid() references auth.users on delete cascade,
  enabled     boolean not null default false,
  remind_hour int not null default 20,          -- година за Києвом (0..23)
  updated_at  timestamptz not null default now()
);
alter table public.reminder_settings enable row level security;
create policy "own reminder" on public.reminder_settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

## Крок 3. Секрети Supabase
У **Project Settings → Edge Functions → Secrets** (або через CLI) додати:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` = `mailto:antoneva123@gmail.com`

## Крок 4. Service worker — обробники пушів
Додати у [`public/sw.js`](../public/sw.js):
```js
self.addEventListener("push", (event) => {
  const data = (() => { try { return event.data.json(); } catch { return {}; } })();
  const title = data.title || "Трекер читання";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "📖 Час почитати",
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      data: { url: data.url || "./" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const all = await clients.matchAll({ type: "window", includeUncontrolled: true });
      const url = event.notification.data?.url || "./";
      const existing = all.find((c) => "focus" in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })(),
  );
});
```

## Крок 5. Клієнт — дозвіл, підписка, налаштування
- Новий екран/розділ **«Сповіщення»** (у меню Головної): перемикач «Нагадувати
  читати» + вибір години.
- Логіка вмикання (по кліку):
  1. `Notification.requestPermission()` → якщо `granted`:
  2. `reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VITE_VAPID_PUBLIC_KEY) })`
  3. Зберегти `endpoint`, `keys.p256dh`, `keys.auth` у `push_subscriptions`.
  4. Записати `reminder_settings { enabled: true, remind_hour }`.
- Вимкнення: `subscription.unsubscribe()` + видалити рядок + `enabled=false`.
- Публічний VAPID-ключ — через env `VITE_VAPID_PUBLIC_KEY` (див. крок 8).

## Крок 6. Edge Function `send-reminders`
`supabase/functions/send-reminders/index.ts` (Deno):
```ts
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role: читає всі рядки
);

Deno.serve(async () => {
  // поточна година за Києвом
  const hour = Number(
    new Intl.DateTimeFormat("uk-UA", {
      hour: "2-digit", hour12: false, timeZone: "Europe/Kyiv",
    }).format(new Date()),
  );

  const { data: users } = await supabase
    .from("reminder_settings")
    .select("user_id")
    .eq("enabled", true)
    .eq("remind_hour", hour);

  for (const u of users ?? []) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", u.user_id);
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ title: "Трекер читання", body: "📖 Час почитати" }),
        );
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    }
  }
  return new Response("ok");
});
```
Деплой: `supabase functions deploy send-reminders` (через Supabase CLI).

## Крок 7. Розклад (cron)
Найпростіше — у дашборді Supabase **Database → Cron** (або через `pg_cron` +
`pg_net`) створити завдання, що **щогодини о :00** викликає функцію:
```sql
select cron.schedule(
  'send-reading-reminders',
  '0 * * * *',
  $$ select net.http_post(
       url := 'https://<project>.functions.supabase.co/send-reminders',
       headers := jsonb_build_object('Authorization', 'Bearer <ANON_OR_SERVICE_KEY>')
     ); $$
);
```
Функція сама перевіряє, кому зараз їх година.

## Крок 8. Публічний ключ у збірці
- У GitHub: **Settings → Secrets and variables → Actions** додати
  `VITE_VAPID_PUBLIC_KEY`.
- У [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) додати його в
  `env:` кроку `npm run build` (поряд із Supabase-ключами).
- Локально — у `.env.local`.

## Крок 9. Перевірка
1. Додати застосунок на екран «Початок» (iOS 16.4+), відкрити.
2. Увімкнути «Нагадувати», дати дозвіл.
3. Тимчасово виставити `remind_hour` на поточну годину → дочекатись cron (або
   викликати функцію вручну) → має прийти пуш.
4. Натиснути на сповіщення → відкривається застосунок.

---

## Орієнтовний обсяг
- Supabase (таблиці, секрети, функція, cron): ~1 год у панелі/CLI.
- Клієнт (екран налаштувань, підписка) + SW: окрема ітерація, кілька годин.
- Потрібен **Supabase CLI** для деплою Edge Function (`brew install supabase/tap/supabase`).

## Спрощений варіант (без сервера) — для порівняння
Якщо не хочеш бекенд: можна показувати **підказку в застосунку** при відкритті
(«ти ще не читав сьогодні») — але це не нагадає, коли застосунок закритий. Для
справжніх щоденних нагадувань потрібні кроки вище.
