// HOME / Головна — daily touchpoint: books in progress (parallel reading),
// per-book page logger, streak & goal rings, gentle insight teaser.

import { useState, type CSSProperties } from "react";
import type { AppCtx } from "../ctx";
import { Cover } from "../components/Cover";
import { Icon } from "../components/Icon";
import { Progress } from "../components/Progress";
import { Ring } from "../components/Ring";
import { t } from "../i18n/uk";
import { TODAY } from "../data/seed";
import { buildInsights } from "../data/derive";

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 13,
  color: "var(--c-ink)",
};

const cardCol: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  padding: 16,
};

export function HomeScreen({ ctx }: { ctx: AppCtx }) {
  const {
    books,
    activity,
    streak,
    doneToday,
    finishedThisYear,
    goal,
    logReading,
    openBook,
    nav,
    setGoal,
    signOut,
    theme,
    toggleTheme,
  } = ctx;
  const [logBookId, setLogBookId] = useState<string | null>(null);
  const [pages, setPages] = useState(20);
  const [editGoal, setEditGoal] = useState(false);
  const [goalVal, setGoalVal] = useState(12);
  const [menuOpen, setMenuOpen] = useState(false);

  const year = TODAY.getFullYear();
  const insights = buildInsights(activity, books, year);
  const teaser = insights[0];
  const goalRemaining = goal ? Math.max(0, goal - finishedThisYear) : 0;
  const reading = books.filter((b) => b.status === "reading");

  function openGoalEditor() {
    setGoalVal(goal ?? 12);
    setEditGoal(true);
  }
  function openLogger(id: string) {
    setLogBookId(id);
    setPages(20);
  }

  return (
    <div className="screen-scroll fade-up">
      {/* top bar with menu */}
      <div className="home-top">
        <div className="home-menu">
          <button
            className="home-menu-btn"
            aria-label={t.menu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <Icon name="menu" size={20} />
          </button>
          {menuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="menu-pop" role="menu">
                <button
                  className="menu-item"
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                >
                  <Icon name={theme === "light" ? "moon" : "sun"} size={17} />
                  {theme === "light" ? t.themeDark : t.themeLight}
                </button>
                <button
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                >
                  <Icon name="logout" size={17} />
                  {t.signOut}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {books.length === 0 ? (
        /* empty library */
        <div className="card mt-5">
          <div className="empty-state">
            <div className="es-title">{t.emptyHomeTitle}</div>
            <div className="es-sub">{t.emptyHomeSub}</div>
          </div>
          <button className="btn btn-primary" onClick={() => nav("addbook")}>
            <Icon name="plus" size={18} sw={2.4} /> {t.addFirstBook}
          </button>
        </div>
      ) : reading.length === 0 ? (
        /* has books, but none in progress */
        <div className="card mt-5">
          <div className="empty-state">
            <div className="es-sub">{t.noReadingNow}</div>
          </div>
          <button className="btn btn-ghost" onClick={() => nav("library")}>
            {t.toLibrary}
          </button>
        </div>
      ) : (
        /* books in progress — one logger per book (parallel reading) */
        <div className="mt-5">
          <div className="row-between">
            <span className="eyebrow">{t.nowReading}</span>
            {doneToday && (
              <span
                style={{
                  display: "inline-flex",
                  gap: 6,
                  alignItems: "center",
                  color: "var(--c-good)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                <Icon name="check" size={14} sw={2.6} /> {t.readToday}
              </span>
            )}
          </div>

          <div className="stack gap-3 mt-3">
            {reading.map((b) => (
              <div className="card" style={{ padding: 14 }} key={b.id}>
                <button
                  className="brow"
                  style={{
                    padding: 0,
                    background: "none",
                    boxShadow: "none",
                    border: "none",
                  }}
                  onClick={() => openBook(b.id)}
                >
                  <Cover book={b} style={{ width: 54 }} showTop={false} />
                  <div
                    className="b-info"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      className="b-title"
                      style={{ fontSize: 15, whiteSpace: "normal" }}
                    >
                      {b.title}
                    </div>
                    <div className="b-author">{b.author}</div>
                  </div>
                </button>

                <div className="mt-3">
                  <Progress value={b.read} max={b.pages} />
                </div>

                {logBookId === b.id ? (
                  <div
                    className="card mt-3"
                    style={{
                      background: "var(--c-surface-2)",
                      boxShadow: "none",
                      padding: 12,
                    }}
                  >
                    <div className="row-between">
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "var(--c-ink-2)",
                        }}
                      >
                        {t.howManyPages}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-num)",
                          fontWeight: 700,
                          fontSize: 18,
                          color: "var(--c-accent)",
                        }}
                      >
                        {pages}
                      </span>
                    </div>
                    <div
                      className="stepper mt-3"
                      style={{ background: "var(--c-surface)" }}
                    >
                      <button onClick={() => setPages((p) => Math.max(0, p - 5))}>
                        –
                      </button>
                      <span className="sv">
                        {pages} {t.pagesUnit}
                      </span>
                      <button onClick={() => setPages((p) => p + 5)}>+</button>
                    </div>
                    <button
                      className="btn btn-done mt-3"
                      onClick={() => {
                        logReading(pages, b.id);
                        setLogBookId(null);
                      }}
                    >
                      <Icon name="check" size={18} sw={2.6} /> {t.save}
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => openLogger(b.id)}
                  >
                    <Icon name="check" size={18} sw={2.4} /> {t.markPages}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* streak + goal rings */}
      <div
        className="mt-4"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <div className="card" style={cardCol}>
          <Ring
            value={streak}
            max={Math.max(7, streak)}
            size={88}
            stroke={9}
            color="var(--c-warn)"
            num={streak}
            label={t.streakUnit}
            numSize={28}
          />
          <div style={{ textAlign: "center" }}>
            <div style={labelStyle}>{t.streakTitle}</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>
              {t.streakSub}
            </div>
          </div>
        </div>

        <button
          className="card"
          style={{ ...cardCol, border: "none", cursor: "pointer", textAlign: "center" }}
          onClick={openGoalEditor}
        >
          <Ring
            value={goal ? finishedThisYear : 0}
            max={goal ?? 1}
            size={88}
            stroke={9}
            num={`${finishedThisYear}`}
            label={goal ? t.goalOf(goal) : t.goalNone}
            numSize={28}
          />
          <div>
            <div style={labelStyle}>{t.goalTitle(year)}</div>
            <div
              style={{
                fontSize: 11.5,
                color: goal ? "var(--c-ink-3)" : "var(--c-accent)",
                fontWeight: goal ? 400 : 700,
                marginTop: 2,
              }}
            >
              {goal ? t.goalAhead(goalRemaining) : t.goalSetCta}
            </div>
          </div>
        </button>
      </div>

      {/* goal editor (inline) */}
      {editGoal && (
        <div className="card mt-4">
          <span className="eyebrow">{t.goalEditTitle(year)}</span>
          <div className="mt-2" style={{ fontSize: 13, color: "var(--c-ink-2)" }}>
            {t.goalQuestion}
          </div>
          <div className="stepper mt-3">
            <button onClick={() => setGoalVal((v) => Math.max(1, v - 1))}>–</button>
            <span className="sv">
              {goalVal} {t.booksUnitShort}
            </span>
            <button onClick={() => setGoalVal((v) => v + 1)}>+</button>
          </div>
          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              setGoal(goalVal);
              setEditGoal(false);
            }}
          >
            {t.save}
          </button>
          {goal != null && (
            <button
              className="btn btn-ghost mt-2"
              onClick={() => {
                setGoal(null);
                setEditGoal(false);
              }}
            >
              {t.goalRemove}
            </button>
          )}
        </div>
      )}

      {/* soft insight teaser */}
      {teaser && (
        <button
          className="insight mt-4"
          style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
          onClick={() => nav("insights")}
        >
          <span className="ic">
            <Icon name="spark" size={20} fill />
          </span>
          <div style={{ flex: 1 }}>
            <div className="it" style={{ fontSize: 14 }}>
              {teaser.title}
            </div>
            <div className="ix" style={{ fontSize: 13, marginTop: 3 }}>
              {teaser.text}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
