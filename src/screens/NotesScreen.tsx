// NOTES / Нотатки — fast reflection. Notes are typed: Ідея / Цитата / Застосування.

import { useState } from "react";
import type { AppCtx } from "../ctx";
import type { NoteType } from "../types";
import { Icon } from "../components/Icon";
import { NoteCard } from "../components/NoteCard";
import { t } from "../i18n/uk";

const NOTE_TYPES: { id: NoteType; label: string }[] = [
  { id: "idea", label: t.typeIdea },
  { id: "quote", label: t.typeQuote },
  { id: "application", label: t.typeApplication },
];

type Filter = "all" | NoteType;

export function NotesScreen({ ctx }: { ctx: AppCtx }) {
  const { notes, addNote, deleteNote, books, current } = ctx;
  const [type, setType] = useState<NoteType>("idea");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const list = notes.filter((n) => filter === "all" || n.type === filter);
  const canAdd = !!text.trim() && !!current;

  return (
    <div className="screen-scroll fade-up">
      <h1 className="h-title greet-head">{t.notes}</h1>

      <div className="composer mt-4">
        <div className="type-pick">
          {NOTE_TYPES.map((nt) => (
            <button
              key={nt.id}
              data-t={nt.id}
              data-on={type === nt.id}
              onClick={() => setType(nt.id)}
            >
              {nt.label}
            </button>
          ))}
        </div>
        <textarea
          className="mt-3"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.composerPlaceholder}
        />
        <button
          className="btn btn-primary"
          disabled={!canAdd}
          style={{ opacity: canAdd ? 1 : 0.5 }}
          onClick={() => {
            addNote(type, text.trim());
            setText("");
          }}
        >
          <Icon name="plus" size={17} sw={2.4} /> {t.addNote}
        </button>
        {!current && (
          <div style={{ color: "var(--c-ink-3)", fontSize: 12.5, marginTop: 10 }}>
            {t.emptyLibrary}
          </div>
        )}
      </div>

      <div className="chip-row mt-5">
        <button
          className="chip"
          data-on={filter === "all"}
          onClick={() => setFilter("all")}
        >
          {t.filterAll}
        </button>
        {NOTE_TYPES.map((nt) => (
          <button
            key={nt.id}
            className="chip"
            data-on={filter === nt.id}
            onClick={() => setFilter(nt.id)}
          >
            {nt.label}
          </button>
        ))}
      </div>

      <div className="stack gap-3 mt-4">
        {list.map((n) => (
          <NoteCard key={n.id} note={n} books={books} onDelete={deleteNote} />
        ))}
        {list.length === 0 && (
          <div
            style={{
              color: "var(--c-ink-3)",
              fontSize: 14,
              textAlign: "center",
              padding: 30,
            }}
          >
            {t.noNotes}
          </div>
        )}
      </div>
    </div>
  );
}
