import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/screens.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="board">
      <App />
    </div>
  </StrictMode>,
);

// Register the service worker so Home-Screen installs auto-update when online.
// Production only: the SW's stale-while-revalidate assumes content-hashed
// filenames, which holds for the build output but not for the dev server,
// where modules are served under bare paths like /src/data/store.ts. Left on
// in dev it serves yesterday's code and edits appear not to work.
if ("serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .then((reg) => reg.update())
        .catch(() => {
          /* SW unsupported or blocked — app still works without it */
        });
    });
  } else {
    // Tear down a worker registered by an earlier dev session, and drop its
    // caches, so a dev browser heals itself instead of serving stale modules.
    void navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .then(() => caches?.keys())
      .then((keys) => Promise.all((keys ?? []).map((k) => caches.delete(k))))
      .catch(() => {
        /* nothing registered, or storage unavailable — fine */
      });
  }
}

