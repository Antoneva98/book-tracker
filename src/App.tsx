// App shell: owns theme + phone frame, then renders splash / login / app
// depending on the auth session.

import { useEffect, useState } from "react";
import { Icon } from "./components/Icon";
import { useSession } from "./auth/useSession";
import { LoginScreen } from "./screens/LoginScreen";
import { AuthedApp } from "./AuthedApp";
import { t } from "./i18n/uk";

type Theme = "light" | "dark";
const THEME_KEY = "svitlo-theme";

function initialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const { user, loading } = useSession();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <div className="phone" data-theme={theme}>
      <button
        className="theme-toggle"
        onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
        aria-label={theme === "light" ? "Темна тема" : "Світла тема"}
      >
        <Icon name={theme === "light" ? "moon" : "sun"} size={17} />
      </button>

      {loading ? (
        <div className="screen">
          <div className="screen-scroll" style={{ justifyContent: "center", textAlign: "center" }}>
            <div className="es-sub">{t.loadingData}</div>
          </div>
        </div>
      ) : user ? (
        <AuthedApp />
      ) : (
        <div className="screen">
          <LoginScreen />
        </div>
      )}
    </div>
  );
}
