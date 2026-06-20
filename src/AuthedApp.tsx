// The authenticated app: store, navigation, screens, and the one-time
// migration dialog. Rendered only when a session exists.

import { useRef, useState } from "react";
import type { Screen } from "./types";
import type { AppCtx } from "./ctx";
import { useBookStore } from "./data/store";
import { TabBar } from "./components/TabBar";
import { HomeScreen } from "./screens/HomeScreen";
import { LibraryScreen } from "./screens/LibraryScreen";
import { DetailScreen } from "./screens/DetailScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { NotesScreen } from "./screens/NotesScreen";
import { InsightsScreen } from "./screens/InsightsScreen";
import { AddBookScreen } from "./screens/AddBookScreen";
import { NotificationsScreen } from "./screens/NotificationsScreen";
import { t } from "./i18n/uk";

export function AuthedApp({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const store = useBookStore();
  const [screen, setScreen] = useState<Screen>("home");
  const [detailId, setDetailId] = useState<string | null>(null);
  const scrollHostRef = useRef<HTMLDivElement>(null);

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

  if (store.loading) {
    return (
      <div className="screen">
        <div className="screen-scroll" style={{ justifyContent: "center", textAlign: "center" }}>
          <div className="es-sub">{t.loadingData}</div>
        </div>
      </div>
    );
  }

  if (store.loadError) {
    return (
      <div className="screen">
        <div className="screen-scroll" style={{ justifyContent: "center", textAlign: "center" }}>
          <div className="es-title">{t.offlineTitle}</div>
          <div className="es-sub">{t.offlineSub}</div>
          <button className="btn btn-primary mt-4" onClick={store.reload}>
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  const ctx: AppCtx = { ...store, nav, openBook, back, detailId, theme, toggleTheme };
  const navActive: Screen =
    screen === "detail" || screen === "addbook"
      ? "library"
      : screen === "notifications"
        ? "home"
        : screen;

  return (
    <div className="screen">
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
        {screen === "notifications" && <NotificationsScreen ctx={ctx} />}
      </div>

      <div className="toast" data-show={!!store.toastMsg}>
        {store.toastMsg}
      </div>

      {store.migrationPrompt && (
        <div className="card" style={{ position: "absolute", left: 12, right: 12, bottom: 76, padding: 16, zIndex: 20 }}>
          <div className="es-title">{t.migrateTitle}</div>
          <div className="es-sub mt-2">{t.migrateSub}</div>
          <button className="btn btn-primary mt-3" onClick={store.confirmMigration}>
            {t.migrateConfirm}
          </button>
          <button className="btn mt-2" onClick={store.skipMigration}>
            {t.migrateSkip}
          </button>
        </div>
      )}

      <TabBar active={navActive} onNav={nav} />
    </div>
  );
}
