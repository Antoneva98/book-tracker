// ADD BOOK / Нова книга — form to add a book to the library.

import { useState } from "react";
import type { AppCtx } from "../ctx";
import type { BookStatus } from "../types";
import { Icon } from "../components/Icon";
import { t } from "../i18n/uk";

const STATUS_OPTS: { id: BookStatus; label: string }[] = [
  { id: "reading", label: t.statusReading },
  { id: "completed", label: t.statusCompleted },
  { id: "toread", label: t.statusToread },
  { id: "abandoned", label: t.statusAbandoned },
];

export function AddBookScreen({ ctx }: { ctx: AppCtx }) {
  const { addBook, openBook, back } = ctx;
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState<BookStatus>("reading");
  const [read, setRead] = useState("");
  const [rating, setRating] = useState<number>(0);

  const pagesNum = parseInt(pages, 10) || 0;
  const readNum = Math.min(parseInt(read, 10) || 0, pagesNum);
  const valid = title.trim().length > 0 && pagesNum > 0;
  const showProgress = status === "reading" || status === "abandoned";
  const showRating = status === "completed" || status === "abandoned";

  function save() {
    if (!valid) return;
    const id = addBook({
      title: title.trim(),
      author: author.trim() || "—",
      pages: pagesNum,
      status,
      genre: genre.trim(),
      read: showProgress ? readNum : 0,
      rating: showRating && rating > 0 ? rating : null,
    });
    openBook(id);
  }

  return (
    <div className="screen-scroll fade-up" style={{ paddingTop: 2 }}>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <button className="link-btn" onClick={back}>
          <Icon name="arrowL" size={18} sw={2.2} /> {t.backToLibrary}
        </button>
      </div>

      <h1 className="h-title">{t.addBookTitle}</h1>

      <div className="card mt-5 stack gap-4">
        <div className="form-field">
          <label className="form-label" htmlFor="bk-title">
            {t.fldTitle}
          </label>
          <input
            id="bk-title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.fldTitlePh}
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="bk-author">
            {t.fldAuthor} <span className="opt">· {t.optional}</span>
          </label>
          <input
            id="bk-author"
            className="form-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t.fldAuthorPh}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-field">
            <label className="form-label" htmlFor="bk-pages">
              {t.fldPages}
            </label>
            <input
              id="bk-pages"
              className="form-input num"
              inputMode="numeric"
              value={pages}
              onChange={(e) => setPages(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="bk-genre">
              {t.fldGenre} <span className="opt">· {t.optional}</span>
            </label>
            <input
              id="bk-genre"
              className="form-input"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder={t.fldGenrePh}
            />
          </div>
        </div>

        <div className="form-field">
          <span className="form-label">{t.fldStatus}</span>
          <div className="chip-row">
            {STATUS_OPTS.map((s) => (
              <button
                key={s.id}
                className="chip"
                data-on={status === s.id}
                onClick={() => setStatus(s.id)}
                type="button"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {showProgress && (
          <div className="form-field">
            <label className="form-label" htmlFor="bk-read">
              {t.fldCurrentPage} <span className="opt">· {t.optional}</span>
            </label>
            <input
              id="bk-read"
              className="form-input num"
              inputMode="numeric"
              value={read}
              onChange={(e) => setRead(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
            />
          </div>
        )}

        {showRating && (
          <div className="form-field">
            <span className="form-label">
              {t.fldRating} <span className="opt">· {t.optional}</span>
            </span>
            <button
              type="button"
              className="rating-pick"
              aria-label={t.fldRating}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <svg
                  key={i}
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill={i <= rating ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.6"
                  onClick={() => setRating(i === rating ? 0 : i)}
                  style={{ cursor: "pointer" }}
                >
                  <path d="M12 3l2.6 5.6L21 9.3l-4.5 4.3L17.6 21 12 17.6 6.4 21l1.1-7.4L3 9.3l6.4-.7z" />
                </svg>
              ))}
            </button>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary mt-4"
        disabled={!valid}
        style={{ opacity: valid ? 1 : 0.5 }}
        onClick={save}
      >
        <Icon name="check" size={18} sw={2.4} /> {t.saveBook}
      </button>
      <button className="btn btn-ghost mt-3" onClick={back}>
        {t.cancel}
      </button>
    </div>
  );
}
