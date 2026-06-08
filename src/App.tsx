// App shell: holds navigation state, the theme, and the persisted store,
// then renders the active screen inside the phone frame + tab bar.

import { useEffect, useRef, useState } from "react";
import type { Screen } from "./types";
import type { AppCtx } from "./ctx";
import { useBookStore } from "./data/store";
import { StatusBar } from "./components/StatusBar";
import { TabBar } from "./components/TabBar";
import { Icon } from "./components/Icon";
import { HomeScreen } from "./screens/HomeScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { DetailScreen } from "./screens/DetailScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { NotesScreen } from "./screens/NotesScreen";
import { InsightsScreen } from "./screens/InsightsScreen";
import { AddBookScreen } from "./screens/AddBookScreen";

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
  const store = useBookStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const scrollHostRef = useRef<HTMLDivElement>(null);

  // Keep <html data-theme> in sync so the board background also themes.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  function resetScroll() {
    if (scrollHostRef.current) scrollHostRef.current.scrollTop = 0;
  }
  function nav(s: Screen) {
    setScreen(s);
    resetScroll();
  }
  function openBook(id: string) {
    setDetailId(id);
    setScreen("detail");
    resetScroll();
  }
  function back() {
    setScreen("library");
    resetScroll();
  }

  const ctx: AppCtx = { ...store, nav, openBook, back, detailId };

  // Book detail & add-book are sub-views of Library — keep that tab lit.
  const navActive: Screen =
    screen === "detail" || screen === "addbook" ? "library" : screen;

  return (
    <div className="phone" data-theme={theme}>
      <button
        className="theme-toggle"
        onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
        aria-label={theme === "light" ? "Темна тема" : "Світла тема"}
      >
        <Icon name={theme === "light" ? "moon" : "sun"} size={17} />
      </button>

      <div className="screen">
        <StatusBar />
        <div
          className="screen-scroll-host"
          style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
          ref={scrollHostRef}
        >
          {screen === "home" && <HomeScreen ctx={ctx} />}
          {screen === "library" && <LibraryScreen ctx={ctx} />}
          {screen === "detail" && <DetailScreen ctx={ctx} />}
          {screen === "analytics" && <AnalyticsScreen ctx={ctx} />}
          {screen === "notes" && <NotesScreen ctx={ctx} />}
          {screen === "insights" && <InsightsScreen ctx={ctx} />}
          {screen === "addbook" && <AddBookScreen ctx={ctx} />}
        </div>
        <div className="toast" data-show={!!store.toastMsg}>
          {store.toastMsg}
        </div>
        <TabBar active={navActive} onNav={nav} />
      </div>
    </div>
  );
}
