// Supabase Edge Function — sends a once-a-month "please take our survey" push
// to every subscriber (no hour filter; the monthly cadence comes from cron).
// Deploy: supabase functions deploy send-survey --no-verify-jwt
// Reuses the project's VAPID secrets (set once for send-reminders).
// Schedule monthly via Database → Cron, e.g. `0 10 1 * *` (1st, 10:00 GMT).

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

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScFU6Vit8h1WcPGyBLg6KirAqjeA5SHRS8sY1vuSi5ZqzxOWw/viewform";

Deno.serve(async () => {
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");
  if (error) return new Response(error.message, { status: 500 });

  const payload = JSON.stringify({
    title: "Допоможи зробити застосунок кращим 🙏",
    body: "Маєш хвилинку? Пройди коротке опитування.",
    url: FORM_URL,
  });

  let sent = 0;
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
        await supabase.from("push_subscriptions").delete().eq("id", s.id);
      }
    }
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { "content-type": "application/json" },
  });
});
