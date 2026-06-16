// HOME / Головна — daily touchpoint: a hero for the book you're reading now,
// a switcher of the other in-progress books (parallel reading), then the
// streak & goal rings and a gentle insight teaser.

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
  fontSize: 12.5,
  color: "var(--c-ink)",
};

const cardCol: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 14,
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
  const [logging, setLogging] = useState(false);
  const [pages, setPages] = useState(20);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editGoal, setEditGoal] = useState(false);
  const [goalVal, setGoalVal] = useState(12);
  const [menuOpen, setMenuOpen] = useState(false);

  const year = TODAY.getFullYear();
  const insights = buildInsights(activity, books, year);
  const teaser = insights[0];
  const goalRemaining = goal ? Math.max(0, goal - finishedThisYear) : 0;

  const reading = books.filter((b) => b.status === "reading");
  const hero = reading.find((b) => b.id === selectedId) ?? reading[0] ?? null;
  const others = reading.filter((b) => b.id !== hero?.id);

  function openGoalEditor() {
    setGoalVal(goal ?? 12);
    setEditGoal(true);
  }
  function selectBook(id: string) {
    setSelectedId(id);
    setLogging(false);
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
      ) : !hero ? (
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
        <>
          {/* hero — the book you're reading now */}
          <div className="card mt-5" style={{ padding: 16 }}>
            <button
              className="brow"
              style={{
                padding: 0,
                background: "none",
                boxShadow: "none",
                border: "none",
              }}
              onClick={() => openBook(hero.id)}
            >
              <Cover book={hero} style={{ width: 78 }} showTop={false} />
              <div
                className="b-info"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "flex-start",
                }}
              >
                <span className="eyebrow">{t.nowReading}</span>
                <div
                  className="b-title"
                  style={{ fontSize: 17, whiteSpace: "normal" }}
                >
                  {hero.title}
                </div>
                <div className="b-author">{hero.author}</div>
              </div>
            </button>

            <div className="mt-4">
              <Progress value={hero.read} max={hero.pages} />
            </div>

            {!logging ? (
              <button
                className="btn btn-primary mt-4"
                onClick={() => {
                  setPages(20);
                  setLogging(true);
                }}
              >
                <Icon name="check" size={18} sw={2.4} /> {t.readTodayCta}
              </button>
            ) : (
              <div
                className="card mt-4"
                style={{
                  background: "var(--c-surface-2)",
                  boxShadow: "none",
                  padding: 14,
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
                    logReading(pages, hero.id);
                    setLogging(false);
                  }}
                >
                  <Icon name="check" size={18} sw={2.6} /> {t.save}
                </button>
              </div>
            )}

            {doneToday && !logging && (
              <div
                className="row-between mt-3"
                style={{
                  color: "var(--c-good)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}>
                  <Icon name="check" size={16} sw={2.6} /> {t.readToday}
                </span>
              </div>
            )}
          </div>

          {/* other books in progress — tap to switch the hero */}
          {others.length > 0 && (
            <div className="mt-4">
              <span className="eyebrow muted">{t.alsoReading}</span>
              <div className="read-switcher mt-3">
                {others.map((b) => (
                  <button
                    key={b.id}
                    className="rs-item"
                    onClick={() => selectBook(b.id)}
                  >
                    <Cover book={b} showTop={false} />
                    <div className="rs-info">
                      <div className="rs-title">{b.title}</div>
                      <div className="rs-author">{b.author}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* streak + goal rings (compact) */}
      <div
        className="mt-4"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <div className="card" style={cardCol}>
          <Ring
            value={streak}
            max={Math.max(7, streak)}
            size={72}
            stroke={8}
            color="var(--c-warn)"
            num={streak}
            label={t.streakUnit}
            numSize={24}
          />
          <div style={{ textAlign: "center" }}>
            <div style={labelStyle}>{t.streakTitle}</div>
            <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 2 }}>
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
            size={72}
            stroke={8}
            num={`${finishedThisYear}`}
            label={goal ? t.goalOf(goal) : t.goalNone}
            numSize={24}
          />
          <div>
            <div style={labelStyle}>{t.goalTitle(year)}</div>
            <div
              style={{
                fontSize: 11,
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
