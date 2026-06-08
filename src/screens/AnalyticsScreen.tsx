// ANALYTICS / Статистика — calm stats: books & pages per month/year,
// a bar chart, a month legend, and a 10-week activity heatmap.

import { useState, type CSSProperties } from "react";
import type { AppCtx } from "../ctx";
import { SEED_MONTHLY } from "../data/seed";
import { heat } from "../data/derive";
import { fmtNum } from "../lib/format";
import { t } from "../i18n/uk";

const HEAT_OPACITY = [0, 0.35, 0.65, 1];

export function AnalyticsScreen({ ctx }: { ctx: AppCtx }) {
  const [range, setRange] = useState<"month" | "year">("year");
  const data = SEED_MONTHLY;
  const maxPages = Math.max(...data.map((d) => d.pages));
  const totalPages = data.reduce((s, d) => s + d.pages, 0);
  const totalBooks = data.reduce((s, d) => s + d.books, 0);
  const current = data[data.length - 1];

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
            {range === "year" ? totalBooks : current.books}
          </div>
          <div className="stat-cap">{t.completed}</div>
        </div>
        <div className="card stat-card">
          <span className="eyebrow muted">
            {range === "year" ? t.pagesPerYear : t.pagesPerMonthShort}
          </span>
          <div className="stat-big mt-3">
            {fmtNum(range === "year" ? totalPages : current.pages)}
          </div>
          <div className="stat-cap">{t.read}</div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="row-between">
          <span className="section-label">{t.pagesPerMonth}</span>
        </div>
        <div className="bars mt-5">
          {data.map((d, i) => (
            <div className="bar-col" key={d.month}>
              <div
                className="bar"
                style={
                  {
                    height: `${(d.pages / maxPages) * 100}%`,
                    animationDelay: `${i * 60}ms`,
                  } as CSSProperties
                }
              />
              <span className="bar-x">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4">
        <span className="section-label">{t.booksByMonth}</span>
        <div className="donut-legend mt-4">
          {data
            .filter((d) => d.books > 0)
            .map((d) => (
              <div className="legend-item" key={d.month}>
                <span className="ld" style={{ background: "var(--c-accent)" }} />
                {d.month} <b>{d.books}</b>
              </div>
            ))}
        </div>
      </div>

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
                style={
                  lv
                    ? { background: "var(--c-warn)", opacity: op }
                    : undefined
                }
                title={`${h.date}: ${h.pages} ${t.pagesUnit}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
