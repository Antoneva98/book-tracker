// BOOK DETAIL / Книга — manage one book: progress, meta, notes.

import { useEffect, useState } from "react";
import type { AppCtx } from "../ctx";
import { Cover } from "../components/Cover";
import { Icon } from "../components/Icon";
import { Progress } from "../components/Progress";
import { NoteCard } from "../components/NoteCard";
import { StatusPill, Stars } from "../components/bits";
import { fmtDate } from "../lib/format";
import { t } from "../i18n/uk";

export function DetailScreen({ ctx }: { ctx: AppCtx }) {
  const { books, detailId, back, updateProgress, deleteBook, notesFor, nav, toast } =
    ctx;
  const book = books.find((b) => b.id === detailId);
  const [val, setVal] = useState(book ? book.read : 0);

  useEffect(() => {
    if (book) setVal(book.read);
    // re-sync the stepper whenever the open book or its saved progress changes
  }, [detailId, book?.read]);

  if (!book) return null;
  const notes = notesFor(book.id);

  return (
    <div className="screen-scroll fade-up" style={{ paddingTop: 2 }}>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <button className="link-btn" onClick={back}>
          <Icon name="arrowL" size={18} sw={2.2} /> {t.backToLibrary}
        </button>
        <button
          className="link-btn"
          onClick={() => toast(t.shareToast)}
          style={{ color: "var(--c-ink-3)" }}
          aria-label={t.shareToast}
        >
          <Icon name="share" size={18} />
        </button>
      </div>

      <div className="detail-hero">
        <Cover book={book} style={{ width: 124 }} />
        <div style={{ flex: 1, paddingBottom: 4 }}>
          <StatusPill status={book.status} />
          <div className="detail-title mt-3">{book.title}</div>
          <div className="detail-author">{book.author}</div>
          {book.rating && (
            <div className="mt-3">
              <Stars n={book.rating} />
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14.5,
          lineHeight: 1.55,
          color: "var(--c-ink-2)",
          marginTop: 18,
        }}
      >
        {book.blurb}
      </p>

      <div className="mt-5">
        <Progress value={val} max={book.pages} />
      </div>

      {book.status === "reading" && (
        <div className="card mt-4">
          <span className="eyebrow">{t.updateProgress}</span>
          <div className="stepper mt-3">
            <button onClick={() => setVal((v) => Math.max(0, v - 5))}>–</button>
            <span className="sv">
              {val} {t.pagesUnit}
            </span>
            <button onClick={() => setVal((v) => Math.min(book.pages, v + 5))}>+</button>
          </div>
          <button
            className="btn btn-primary mt-3"
            disabled={val === book.read}
            style={{ opacity: val === book.read ? 0.5 : 1 }}
            onClick={() => updateProgress(book.id, val)}
          >
            {t.saveProgress}
          </button>
        </div>
      )}

      <div className="meta-grid mt-4">
        <div className="meta-cell">
          <div className="mk">{t.metaPages}</div>
          <div className="mv">{book.pages}</div>
        </div>
        <div className="meta-cell">
          <div className="mk">{t.metaGenre}</div>
          <div className="mv" style={{ fontSize: 14 }}>
            {book.genre}
          </div>
        </div>
        <div className="meta-cell">
          <div className="mk">{t.metaStart}</div>
          <div className="mv" style={{ fontSize: 14 }}>
            {fmtDate(book.start)}
          </div>
        </div>
        <div className="meta-cell">
          <div className="mk">{t.metaFinish}</div>
          <div className="mv" style={{ fontSize: 14 }}>
            {fmtDate(book.finish)}
          </div>
        </div>
      </div>

      <div className="row-between mt-6">
        <span className="section-label">{t.notes}</span>
        <button className="see-all" onClick={() => nav("notes")}>
          {t.seeAll} <Icon name="chevR" size={13} sw={2.4} />
        </button>
      </div>
      <div className="stack gap-3 mt-3">
        {notes.length ? (
          notes.map((n) => <NoteCard key={n.id} note={n} books={books} compact />)
        ) : (
          <div style={{ color: "var(--c-ink-3)", fontSize: 14, padding: "8px 0" }}>
            {t.noBookNotes}
          </div>
        )}
        <button className="btn btn-ghost" onClick={() => nav("notes")}>
          <Icon name="plus" size={17} sw={2.2} /> {t.addNote}
        </button>
      </div>

      <button
        className="btn btn-danger mt-6"
        onClick={() => {
          if (window.confirm(t.deleteBookConfirm)) {
            deleteBook(book.id);
            back();
          }
        }}
      >
        <Icon name="trash" size={17} sw={2} /> {t.deleteBook}
      </button>
    </div>
  );
}
