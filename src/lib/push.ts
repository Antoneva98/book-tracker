// Web Push helpers: capability checks + subscribe/unsubscribe.
// The push subscription is stored in Supabase (see data/repo); a scheduled
// Edge Function sends the daily reminder. iOS only delivers pushes to a
// Home-Screen install on 16.4+.

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

export interface PushSub {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const pushSupported =
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  typeof window !== "undefined" &&
  "PushManager" in window &&
  "Notification" in window;

export const hasVapidKey = !!VAPID_PUBLIC_KEY;

export const isIOS = /iphone|ipad|ipod/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : "",
);

/** True when launched from the Home Screen (required for push on iOS). */
export function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function notificationPermission(): NotificationPermission {
  return typeof Notification !== "undefined" ? Notification.permission : "denied";
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function toPushSub(sub: PushSubscription): PushSub {
  const json = sub.toJSON();
  return {
    endpoint: json.endpoint!,
    p256dh: json.keys!.p256dh,
    auth: json.keys!.auth,
  };
}

/** Request permission + subscribe. Returns the subscription, or throws. */
export async function subscribeToPush(): Promise<PushSub> {
  if (!pushSupported) throw new Error("unsupported");
  if (!VAPID_PUBLIC_KEY) throw new Error("no-vapid");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("denied");

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }
  return toPushSub(sub);
}

/** Returns the current subscription's endpoint (if any), else null. */
export async function currentEndpoint(): Promise<string | null> {
  if (!pushSupported) return null;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return sub?.endpoint ?? null;
}

/** Unsubscribe locally; returns the removed endpoint (for server cleanup). */
export async function unsubscribeFromPush(): Promise<string | null> {
  if (!pushSupported) return null;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return null;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  return endpoint;
}
