// Login: Google (primary) + email magic link (fallback).

import { useState } from "react";
import { t } from "../i18n/uk";
import { signInWithGoogle, signInWithEmail } from "../auth/useSession";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function google() {
    setErr(null);
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      setErr(t.saveFailed);
      setBusy(false);
    }
  }

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmail(email.trim());
      setSent(true);
    } catch {
      setErr(t.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen-scroll fade-up" style={{ justifyContent: "center" }}>
      <div className="greet-head stack gap-2" style={{ textAlign: "center" }}>
        <h1 className="h-title">{t.appName}</h1>
        <span className="eyebrow muted">{t.loginTagline}</span>
      </div>

      <div className="card mt-5" style={{ padding: 16 }}>
        <button className="btn btn-primary" onClick={google} disabled={busy}>
          {t.signInGoogle}
        </button>

        {sent ? (
          <div className="es-sub mt-4" style={{ textAlign: "center" }}>
            {t.magicLinkSent}
          </div>
        ) : (
          <>
            <div className="eyebrow muted mt-4" style={{ textAlign: "center" }}>
              {t.orDivider}
            </div>
            <form className="stack gap-2 mt-3" onSubmit={magic}>
              <input
                className="input"
                type="email"
                inputMode="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn" type="submit" disabled={busy || !email.trim()}>
                {t.sendMagicLink}
              </button>
            </form>
          </>
        )}

        {err && (
          <div className="es-sub mt-3" style={{ color: "var(--c-bad, #c0392b)", textAlign: "center" }}>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
