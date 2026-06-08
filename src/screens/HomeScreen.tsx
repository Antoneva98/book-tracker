// HOME / Головна — daily touchpoint: current book, page logger, rings, teaser.

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

export function HomeScreen({ ctx }: { ctx: AppCtx }) {
  const {
    books,
    activity,
    current,
    streak,
    doneToday,
    finishedThisYear,
    logReading,
    openBook,
    nav,
  } = ctx;
  const [logging, setLogging] = useState(false);
  const [pages, setPages] = useState(20);

  const hour = TODAY.getHours();
  const greet =
    hour < 12 ? t.greetMorning : hour < 18 ? t.greetDay : t.greetEvening;
  const insights = buildInsights(activity, books, TODAY.getFullYear());
  const teaser = insights[0];

  const dateLine = `${t.weekdays[TODAY.getDay()]} · ${TODAY.getDate()} ${
    t.monthsLong[TODAY.getMonth()]
  }`;

  return (
    <div className="screen-scroll fade-up">
      <div className="greet-head stack gap-2">
        <span className="eyebrow muted">{dateLine}</span>
        <h1 className="h-title">{greet}.</h1>
      </div>

      {!current ? (
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
      ) : (
        /* currently reading hero */
        <div className="card mt-5" style={{ padding: 16 }}>
          <button
            className="brow"
            style={{
              padding: 0,
              background: "none",
              boxShadow: "none",
              border: "none",
            }}
            onClick={() => openBook(current.id)}
          >
            <Cover book={current} style={{ width: 78 }} showTop={false} />
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
              <div className="b-title" style={{ fontSize: 17, whiteSpace: "normal" }}>
                {current.title}
              </div>
              <div className="b-author">{current.author}</div>
            </div>
          </button>

          <div className="mt-4">
            <Progress value={current.read} max={current.pages} />
          </div>

          {!logging ? (
            <button className="btn btn-primary mt-4" onClick={() => setLogging(true)}>
              <Icon name="check" size={18} sw={2.4} /> {t.readTodayCta}
            </button>
          ) : (
            <div
              className="card mt-4"
              style={{ background: "var(--c-surface-2)", boxShadow: "none", padding: 14 }}
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
              <div className="stepper mt-3" style={{ background: "var(--c-surface)" }}>
                <button onClick={() => setPages((p) => Math.max(0, p - 5))}>–</button>
                <span className="sv">
                  {pages} {t.pagesUnit}
                </span>
                <button onClick={() => setPages((p) => p + 5)}>+</button>
              </div>
              <button
                className="btn btn-done mt-3"
                onClick={() => {
                  logReading(pages);
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
      )}

      {/* streak + goal rings */}
      <div
        className="mt-4"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: 16,
          }}
        >
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
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: 16,
          }}
        >
          <Ring
            value={finishedThisYear}
            max={12}
            size={88}
            stroke={9}
            num={`${finishedThisYear}`}
            label={t.goalOf(12)}
            numSize={28}
          />
          <div style={{ textAlign: "center" }}>
            <div style={labelStyle}>{t.goalTitle}</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>
              {t.goalAhead(Math.max(0, 12 - finishedThisYear))}
            </div>
          </div>
        </div>
      </div>

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
