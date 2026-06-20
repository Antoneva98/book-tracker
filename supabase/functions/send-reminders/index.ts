// Supabase Edge Function — sends the daily "time to read" push.
// Deploy:  supabase functions deploy send-reminders --no-verify-jwt
// Secrets needed (supabase secrets set ...):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// Schedule it hourly via Database → Cron (see docs/PUSH_NOTIFICATIONS_PLAN.md).
// Each run sends to users whose reminder hour (Europe/Kyiv) matches now.

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  const kyivHour = Number(
    new Intl.DateTimeFormat("uk-UA", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Europe/Kyiv",
    }).format(new Date()),
  );

  const { data: users, error: usersErr } = await supabase
    .from("reminder_settings")
    .select("user_id")
    .eq("enabled", true)
    .eq("remind_hour", kyivHour);
  if (usersErr) {
    return new Response(usersErr.message, { status: 500 });
  }

  const payload = JSON.stringify({
    title: "Трекер читання",
    body: "📖 Час почитати",
    url: "./",
  });

  let sent = 0;
  for (const u of users ?? []) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", u.user_id);

    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          // expired subscription — clean it up
          await supabase.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    }
  }

  return new Response(JSON.stringify({ hour: kyivHour, sent }), {
    headers: { "content-type": "application/json" },
  });
});
