// LIBRARY / Бібліотека — browse the whole shelf, search + filter by status.

import { useState } from "react";
import type { AppCtx } from "../ctx";
import type { BookStatus } from "../types";
import { Cover } from "../components/Cover";
import { Icon } from "../components/Icon";
import { statusMeta } from "../lib/format";
import { t } from "../i18n/uk";

type Filter = "all" | BookStatus;

const LIB_FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: t.filterAll },
  { id: "reading", label: t.filterReading },
  { id: "completed", label: t.filterCompleted },
  { id: "toread", label: t.filterToread },
  { id: "abandoned", label: t.filterAbandoned },
];

export function LibraryScreen({ ctx }: { ctx: AppCtx }) {
  const { books, openBook, toast } = ctx;
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const list = books.filter(
    (b) =>
      (filter === "all" || b.status === filter) &&
      (q === "" || (b.title + b.author).toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="screen-scroll fade-up">
      <div className="greet-head row-between">
        <h1 className="h-title">{t.library}</h1>
        <button
          className="fab"
          aria-label={t.addNote}
          onClick={() => toast(t.addBookToast)}
        >
          <Icon name="plus" size={22} sw={2.4} />
        </button>
      </div>

      <div
        className="card mt-4"
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}
      >
        <Icon name="search" size={18} style={{ color: "var(--c-ink-3)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          style={{
            flex: 1,
            border: "none",
            background: "transparent",
            outline: "none",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--c-ink)",
          }}
        />
      </div>

      <div className="chip-row mt-4">
        {LIB_FILTERS.map((f) => (
          <button
            key={f.id}
            className="chip"
            data-on={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="book-grid mt-5">
        {list.map((b) => (
          <button key={b.id} className="grid-cell" onClick={() => openBook(b.id)}>
            <Cover book={b} />
            <div className="row-between" style={{ marginTop: 8, gap: 6 }}>
              <span
                className="status-dot"
                style={{ background: statusMeta(b.status).color }}
              />
              <div className="gc-title" style={{ flex: 1 }}>
                {b.title}
              </div>
            </div>
            <div className="gc-author">{b.author.split(" ").slice(-1)[0]}</div>
          </button>
        ))}
        {list.length === 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              color: "var(--c-ink-3)",
              padding: 40,
              fontSize: 14,
            }}
          >
            {t.nothingFound}
          </div>
        )}
      </div>
    </div>
  );
}
