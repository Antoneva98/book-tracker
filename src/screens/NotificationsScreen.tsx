// NOTIFICATIONS / Сповіщення — opt into a daily "time to read" reminder.
// Subscribes via the Push API and stores the subscription + preferred hour
// in Supabase; a scheduled Edge Function sends the actual push.

import { useEffect, useState } from "react";
import type { AppCtx } from "../ctx";
import { Icon } from "../components/Icon";
import { t } from "../i18n/uk";
import {
  hasVapidKey,
  isIOS,
  isStandalone,
  notificationPermission,
  pushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from "../lib/push";
import {
  deletePushSubscription,
  fetchReminderSettings,
  savePushSubscription,
  saveReminderSettings,
} from "../data/repo";

export function NotificationsScreen({ ctx }: { ctx: AppCtx }) {
  const { nav, toast } = ctx;
  const [enabled, setEnabled] = useState(false);
  const [hour, setHour] = useState(20);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(notificationPermission() === "denied");

  useEffect(() => {
    void (async () => {
      const s = await fetchReminderSettings();
      if (s) {
        setEnabled(s.enabled);
        setHour(s.remind_hour);
      }
    })();
  }, []);

  // gating
  const iosNeedsInstall = isIOS && !isStandalone();
  const blockedReason = !pushSupported
    ? t.notifUnsupported
    : !hasVapidKey
      ? t.notifNotReady
      : iosNeedsInstall
        ? t.notifIOSInstall
        : denied
          ? t.notifDenied
          : null;
  const canToggle = !blockedReason || (enabled && !iosNeedsInstall);

  async function enable() {
    setBusy(true);
    try {
      const sub = await subscribeToPush();
      await savePushSubscription(sub);
      await saveReminderSettings({ enabled: true, remind_hour: hour });
      setEnabled(true);
      setDenied(false);
      toast(t.notifOnToast);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "denied") {
        setDenied(true);
        toast(t.notifDenied);
      } else if (msg === "no-vapid") {
        toast(t.notifNotReady);
      } else {
        toast(t.saveFailed);
      }
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const endpoint = await unsubscribeFromPush();
      if (endpoint) await deletePushSubscription(endpoint);
      await saveReminderSettings({ enabled: false, remind_hour: hour });
      setEnabled(false);
      toast(t.notifOffToast);
    } catch {
      toast(t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  function changeHour(next: number) {
    const h = Math.max(0, Math.min(23, next));
    setHour(h);
    if (enabled) void saveReminderSettings({ enabled: true, remind_hour: h });
  }

  return (
    <div className="screen-scroll fade-up" style={{ paddingTop: 2 }}>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <button className="link-btn" onClick={() => nav("home")}>
          <Icon name="arrowL" size={18} sw={2.2} /> {t.tabHome}
        </button>
      </div>

      <h1 className="h-title">{t.notifTitle}</h1>
      <p className="h-sub">{t.notifSub}</p>

      <div className="card mt-5">
        {blockedReason && (
          <div
            className="es-sub"
            style={{ textAlign: "left", marginBottom: 14, lineHeight: 1.5 }}
          >
            {blockedReason}
          </div>
        )}

        <div className="form-field">
          <span className="form-label">{t.notifTimeLabel}</span>
          <div className="stepper mt-2">
            <button onClick={() => changeHour(hour - 1)}>–</button>
            <span className="sv">{t.notifHour(hour)}</span>
            <button onClick={() => changeHour(hour + 1)}>+</button>
          </div>
        </div>

        {!enabled ? (
          <button
            className="btn btn-primary mt-4"
            disabled={busy || !canToggle}
            style={{ opacity: busy || !canToggle ? 0.5 : 1 }}
            onClick={enable}
          >
            <Icon name="check" size={18} sw={2.4} /> {t.notifEnable}
          </button>
        ) : (
          <button
            className="btn btn-ghost mt-4"
            disabled={busy}
            style={{ opacity: busy ? 0.5 : 1 }}
            onClick={disable}
          >
            {t.notifDisable}
          </button>
        )}
      </div>
    </div>
  );
}
