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
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((reg) => reg.update())
      .catch(() => {
        /* SW unsupported or blocked — app still works without it */
      });
  });
}

