// Designed typographic book cover (no copyrighted art). Renders the
// genre eyebrow + title + author over a CSS motif chosen by cover.style.

import type { CSSProperties } from "react";
import type { Book } from "../types";

interface CoverProps {
  book: Book;
  className?: string;
  style?: CSSProperties;
  showTop?: boolean;
}

export function Cover({ book, className = "", style, showTop = true }: CoverProps) {
  const c = book.cover;
  return (
    <div
      className={`cover ${className}`}
      data-cover-style={c.style}
      style={
        {
          ...style,
          "--cv-bg": c.bg,
          "--cv-fg": c.fg,
          "--cv-accent": c.accent,
          containerType: "inline-size",
        } as CSSProperties
      }
    >
      {showTop && c.style !== "type" && <div className="cv-top">{book.genre}</div>}
      <div className="cv-title">{book.title}</div>
      {c.style === "type" && <div className="cv-rule" />}
      <div className="cv-author">{book.author}</div>
    </div>
  );
}
