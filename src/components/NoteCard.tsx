// A single note card. `compact` hides the source line (used in Book detail).

import type { Book, Note } from "../types";
import { t } from "../i18n/uk";

const TYPE_LABEL = {
  idea: t.typeIdea,
  quote: t.typeQuote,
  application: t.typeApplication,
} as const;

interface NoteCardProps {
  note: Note;
  books: Book[];
  compact?: boolean;
}

export function NoteCard({ note, books, compact }: NoteCardProps) {
  const book = books.find((b) => b.id === note.bookId);
  return (
    <div className="note" data-t={note.type}>
      <span className="note-tag" data-t={note.type}>
        {TYPE_LABEL[note.type]}
      </span>
      <div className="note-text">{note.text}</div>
      {!compact && (
        <div className="note-src">
          {book ? book.title : ""} · {t.pageAbbr} {note.page}
        </div>
      )}
    </div>
  );
}
