// Tiny shared presentational bits: status pill + star rating row.

import type { CSSProperties } from "react";
import type { BookStatus } from "../types";
import { statusMeta } from "../lib/format";

export function StatusPill({ status }: { status: BookStatus }) {
  const m = statusMeta(status);
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: m.color,
  };
  return (
    <span style={style}>
      <span className="status-dot" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, color: "var(--c-warn)" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= n ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M12 3l2.6 5.6L21 9.3l-4.5 4.3L17.6 21 12 17.6 6.4 21l1.1-7.4L3 9.3l6.4-.7z" />
        </svg>
      ))}
    </span>
  );
}
