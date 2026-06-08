/* ============================================================
   Book Tracker — shared primitives (icons, cover, ring, nav)
   Exposes components on window for the screen + app scripts.
   ============================================================ */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- Icons ---------------- */
const ICON_PATHS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V20h5v-6h4v6h5V9.5",
  library: "M5 4h3v16H5zM10 4h3v16h-3zM16 5l3 .8-3.5 14.5-3-.8z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  note: "M5 3h9l5 5v13H5zM14 3v5h5M8 13h8M8 17h6",
  spark: "M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  check: "M20 6 9 17l-5-5",
  chevR: "M9 6l6 6-6 6",
  chevL: "M15 6l-6 6 6 6",
  flame: "M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 .5-1.5.5-1.5C16 12 16 14 16 15a4 4 0 1 1-8 0c0-4 4-6 4-12z",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  arrowL: "M19 12H5M12 19l-7-7 7-7",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 13.5H4a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z",
  pen: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  quote: "M7 7h4v4c0 2-1.5 3.5-4 4M14 7h4v4c0 2-1.5 3.5-4 4",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z",
  trend: "M3 17l6-6 4 4 8-8M21 7v5h-5",
  moon: "M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8z",
  share: "M4 12v8h16v-8M12 16V4M8 8l4-4 4 4",
  x: "M18 6 6 18M6 6l12 12",
};
function Icon({ name, size = 22, sw = 1.9, fill = false, style }) {
  const d = ICON_PATHS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
         stroke={fill ? "none" : "currentColor"} strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ---------------- Status bar ---------------- */
function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="sb-icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="8" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M8.5 2.5c2.3 0 4.4.9 6 2.4l1.4-1.5A11 11 0 0 0 8.5.5 11 11 0 0 0 1 3.4l1.4 1.5a8.6 8.6 0 0 1 6.1-2.4zM8.5 6c1.2 0 2.3.5 3.1 1.3l1.4-1.4A6.6 6.6 0 0 0 8.5 4 6.6 6.6 0 0 0 4 5.9l1.4 1.4A4.4 4.4 0 0 1 8.5 6zm0 3.4 2-2a2.8 2.8 0 0 0-4 0z"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.4"/><rect x="2" y="2.5" width="17" height="8" rx="1.5" fill="currentColor"/><rect x="23" y="4.5" width="2" height="4" rx="1" fill="currentColor" fillOpacity="0.5"/></svg>
      </span>
    </div>
  );
}

/* ---------------- Cover (designed typographic) ---------------- */
function Cover({ book, className = "", style, showTop = true }) {
  const c = book.cover;
  return (
    <div className={`cover ${className}`} data-cover-style={c.style}
         style={{ ...style, "--cv-bg": c.bg, "--cv-fg": c.fg, "--cv-accent": c.accent, containerType: "inline-size" }}>
      {showTop && c.style !== "type" && <div className="cv-top">{book.genre}</div>}
      <div className="cv-title">{book.title}</div>
      {c.style === "type" && <div className="cv-rule" />}
      <div className="cv-author">{book.author}</div>
    </div>
  );
}
function Spine({ book }) {
  const c = book.cover;
  return (
    <div className="spine" title={book.title}
         style={{ "--cv-bg": c.bg, "--cv-fg": c.fg, height: 110 + (book.pages % 40) }}>
      {book.title}
    </div>
  );
}

/* ---------------- Ring (streak / goal) ---------------- */
function Ring({ value, max = 1, size = 92, stroke = 9, color = "var(--c-accent)", track = "var(--c-surface-2)", children, num, label, numSize = 30 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const [draw, setDraw] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setTimeout(() => setDraw(pct), 60));
    return () => cancelAnimationFrame(id);
  }, [pct]);
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={circ}
                strokeDashoffset={circ * (1 - draw)}
                transform={`rotate(-90 ${size/2} ${size/2})`}
                style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div className="ring-center">
        {children || (<>
          <div className="ring-num" style={{ fontSize: numSize }}>{num}</div>
          {label && <div className="ring-label">{label}</div>}
        </>)}
      </div>
    </div>
  );
}

/* ---------------- Progress ---------------- */
function Progress({ value, max, showMeta = true, unit = "стор." }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="stack gap-2">
      <div className="progress"><i style={{ width: pct + "%" }} /></div>
      {showMeta && (
        <div className="progress-meta">
          <span>{value} / {max} {unit}</span>
          <b>{pct}%</b>
        </div>
      )}
    </div>
  );
}

/* ---------------- Tab bar ---------------- */
const TABS = [
  { id: "home", icon: "home", label: "Головна" },
  { id: "library", icon: "library", label: "Бібліотека" },
  { id: "analytics", icon: "chart", label: "Статистика" },
  { id: "notes", icon: "note", label: "Нотатки" },
  { id: "insights", icon: "spark", label: "Інсайти" },
];
function TabBar({ active, onNav }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button key={t.id} className="tab-item" data-on={active === t.id} onClick={() => onNav(t.id)}>
          <Icon name={t.icon} size={21} sw={active === t.id ? 2.2 : 1.8} fill={t.id === "spark" && active === t.id} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ---------------- helpers ---------------- */
function statusMeta(s) {
  return {
    reading: { label: "Читаю", color: "var(--c-accent)" },
    completed: { label: "Прочитано", color: "var(--c-good)" },
    abandoned: { label: "Покинуто", color: "var(--c-bad)" },
    toread: { label: "У планах", color: "var(--c-ink-3)" },
  }[s];
}
function fmtDate(iso) {
  if (!iso) return "—";
  const m = ["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"];
  const d = new Date(iso);
  return `${d.getDate()} ${m[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

Object.assign(window, {
  Icon, StatusBar, Cover, Spine, Ring, Progress, TabBar, TABS,
  statusMeta, fmtDate,
});
