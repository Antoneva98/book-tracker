// ANALYTICS / Статистика — calm stats from real data: current-year books &
// pages, a monthly chart, a 10-week heatmap, and the yearly reading history.

import { useState, type CSSProperties } from "react";
import type { AppCtx } from "../ctx";
import { TODAY, YEARLY_HISTORY, type YearStat } from "../data/seed";
import {
  heat,
  monthlyForYear,
  pagesInYear,
  booksCompletedInYear,
} from "../data/derive";
import { fmtNum } from "../lib/format";
import { t } from "../i18n/uk";

const HEAT_OPACITY = [0, 0.35, 0.65, 1];

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function AnalyticsScreen({ ctx }: { ctx: AppCtx }) {
  const [range, setRange] = useState<"month" | "year">("year");

  const year = TODAY.getFullYear();
  const monthIdx = TODAY.getMonth();

  const monthly = monthlyForYear(ctx.activity, ctx.books, year, monthIdx);
  const maxMonth = Math.max(...monthly.map((m) => m.pages), 1);

  const pagesThisYear = pagesInYear(ctx.activity, year);
  const booksThisYear = booksCompletedInYear(ctx.books, year);
  const thisMonth = monthly[monthIdx] ?? { pages: 0, books: 0 };

  // yearly history = past archive + current year (live)
  const years: YearStat[] = [
    ...YEARLY_HISTORY,
    { year, books: booksThisYear, pages: pagesThisYear },
  ];
  const maxYear = Math.max(...years.map((y) => y.pages), 1);
  const totalBooks = years.reduce((s, y) => s + y.books, 0);
  const totalPages = years.reduce((s, y) => s + y.pages, 0);

  const cells = heat(ctx.activity, 10);
  const maxHeat = Math.max(...cells.map((h) => h.pages), 1);

  return (
    <div className="screen-scroll fade-up">
      <h1 className="h-title greet-head">{t.analytics}</h1>

      <div className="segment mt-4">
        <button data-on={range === "month"} onClick={() => setRange("month")}>
          {t.rangeMonth}
        </button>
        <button data-on={range === "year"} onClick={() => setRange("year")}>
          {t.rangeYear}
        </button>
      </div>

      <div
        className="mt-5"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
      >
        <div className="card stat-card">
          <span className="eyebrow muted">
            {range === "year" ? t.booksPerYear : t.booksPerMonth}
          </span>
          <div className="stat-big mt-3">
            {range === "year" ? booksThisYear : thisMonth.books}
          </div>
          <div className="stat-cap">{t.completed}</div>
        </div>
        <div className="card stat-card">
          <span className="eyebrow muted">
            {range === "year" ? t.pagesPerYear : t.pagesPerMonthShort}
          </span>
          <div className="stat-big mt-3">
            {fmtNum(range === "year" ? pagesThisYear : thisMonth.pages)}
          </div>
          <div className="stat-cap">{t.read}</div>
        </div>
      </div>

      {/* monthly pages (current year) */}
      <div className="card mt-4">
        <span className="section-label">{t.pagesPerMonth}</span>
        <div className="bars mt-5">
          {monthly.map((m, i) => (
            <div className="bar-col" key={m.monthIdx}>
              <div
                className="bar"
                style={
                  {
                    height: `${(m.pages / maxMonth) * 100}%`,
                    animationDelay: `${i * 60}ms`,
                  } as CSSProperties
                }
              />
              <span className="bar-x">{cap(t.monthsShort[m.monthIdx])}</span>
            </div>
          ))}
        </div>
      </div>

      {/* yearly reading history */}
      <div className="card mt-4">
        <div className="row-between">
          <span className="section-label">{t.byYears}</span>
          <span
            style={{
              fontFamily: "var(--font-num)",
              fontSize: 12,
              color: "var(--c-ink-2)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {totalBooks} {t.booksWord} · {fmtNum(totalPages)} {t.pagesUnit}
          </span>
        </div>
        <div className="bars mt-5">
          {years.map((y, i) => (
            <div className="bar-col" key={y.year}>
              <div
                className="bar"
                style={
                  {
                    height: `${(y.pages / maxYear) * 100}%`,
                    animationDelay: `${i * 60}ms`,
                  } as CSSProperties
                }
                title={`${y.year}: ${fmtNum(y.pages)} ${t.pagesUnit} · ${y.books} ${t.booksWord}`}
              />
              <span className="bar-x">{`'${String(y.year).slice(2)}`}</span>
            </div>
          ))}
        </div>
        <div className="donut-legend mt-5">
          {years.map((y) => (
            <div className="legend-item" key={y.year}>
              <span className="ld" style={{ background: "var(--c-accent)" }} />
              {y.year} <b>{y.books}</b>
            </div>
          ))}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--c-ink-3)",
            marginTop: 14,
            lineHeight: 1.5,
          }}
        >
          {t.beforeAppNote}
        </div>
      </div>

      {/* activity heatmap */}
      <div className="card mt-4">
        <span className="section-label">{t.activity10w}</span>
        <div className="heat mt-4">
          {cells.map((h, i) => {
            const lv = h.pages === 0 ? 0 : Math.ceil((h.pages / maxHeat) * 3);
            const op = HEAT_OPACITY[lv];
            return (
              <span
                className="hd"
                key={i}
                style={lv ? { background: "var(--c-warn)", opacity: op } : undefined}
                title={`${h.date}: ${h.pages} ${t.pagesUnit}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
