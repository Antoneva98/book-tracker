/* ============================================================
   Book Tracker — screens (Home, Library, Detail, Analytics, Notes, Insights)
   + BookApp shell with live state. Skin-agnostic; styling via tokens.
   ============================================================ */

/* ---------------- small shared bits ---------------- */
function ScreenScroll({ children }) {
  return <div className="screen-scroll fade-up" key={Math.random()}>{children}</div>;
}
function StatusPill({ status }) {
  const m = statusMeta(status);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-display)",
      fontWeight: 700, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: m.color }}>
      <span className="status-dot" style={{ background: m.color }} />{m.label}
    </span>
  );
}
function Stars({ n }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, color: "var(--c-warn)" }}>
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24"
             fill={i <= n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
          <path d="M12 3l2.6 5.6L21 9.3l-4.5 4.3L17.6 21 12 17.6 6.4 21l1.1-7.4L3 9.3l6.4-.7z"/>
        </svg>
      ))}
    </span>
  );
}

/* ===================================================================
   HOME
   =================================================================== */
function HomeScreen({ ctx }) {
  const { books, current, streak, doneToday, logReading, openBook, nav } = ctx;
  const [logging, setLogging] = useState(false);
  const [pages, setPages] = useState(20);
  const hour = 19;
  const greet = hour < 12 ? "Доброго ранку" : hour < 18 ? "Доброго дня" : "Доброго вечора";
  const insight = BookData.INSIGHTS[0];

  return (
    <ScreenScroll>
      <div className="greet-head stack gap-2">
        <span className="eyebrow muted">Неділя · 8 червня</span>
        <h1 className="h-title">{greet}.</h1>
      </div>

      {/* currently reading hero */}
      <div className="card mt-5" style={{ padding: 16 }}>
        <button className="brow" style={{ padding: 0, background: "none", boxShadow: "none", border: "none" }}
                onClick={() => openBook(current.id)}>
          <Cover book={current} style={{ width: 78 }} showTop={false} />
          <div className="b-info" style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start" }}>
            <span className="eyebrow">Зараз читаю</span>
            <div className="b-title" style={{ fontSize: 17, whiteSpace: "normal" }}>{current.title}</div>
            <div className="b-author">{current.author}</div>
          </div>
        </button>
        <div className="mt-4"><Progress value={current.read} max={current.pages} /></div>

        {!logging ? (
          <button className="btn btn-primary mt-4" onClick={() => { setLogging(true); }}>
            <Icon name="check" size={18} sw={2.4} /> Я читав сьогодні
          </button>
        ) : (
          <div className="card mt-4" style={{ background: "var(--c-surface-2)", boxShadow: "none", padding: 14 }}>
            <div className="row-between">
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--c-ink-2)" }}>Скільки сторінок?</span>
              <span style={{ fontFamily: "var(--font-num)", fontWeight: 700, fontSize: 18, color: "var(--c-accent)" }}>{pages}</span>
            </div>
            <div className="stepper mt-3" style={{ background: "var(--c-surface)" }}>
              <button onClick={() => setPages((p) => Math.max(0, p - 5))}>–</button>
              <span className="sv">{pages} стор.</span>
              <button onClick={() => setPages((p) => p + 5)}>+</button>
            </div>
            <button className="btn btn-done mt-3" onClick={() => { logReading(pages); setLogging(false); }}>
              <Icon name="check" size={18} sw={2.6} /> Зберегти
            </button>
          </div>
        )}
        {doneToday && !logging && (
          <div className="row-between mt-3" style={{ color: "var(--c-good)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13 }}>
            <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name="check" size={16} sw={2.6} /> Прочитано сьогодні</span>
          </div>
        )}
      </div>

      {/* streak + goal rings */}
      <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 16 }}>
          <Ring value={streak} max={Math.max(7, streak)} size={88} stroke={9} color="var(--c-warn)"
                num={streak} label="днів" numSize={28} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--c-ink)" }}>Серія читання</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>день за днем</div>
          </div>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 16 }}>
          <Ring value={ctx.finishedThisYear} max={12} size={88} stroke={9}
                num={`${ctx.finishedThisYear}`} label="з 12" numSize={28} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--c-ink)" }}>Ціль 2026</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>{12 - ctx.finishedThisYear} попереду</div>
          </div>
        </div>
      </div>

      {/* soft insight teaser */}
      <button className="insight mt-4" style={{ width: "100%", textAlign: "left", cursor: "pointer" }} onClick={() => nav("insights")}>
        <span className="ic"><Icon name="spark" size={20} fill /></span>
        <div style={{ flex: 1 }}>
          <div className="it" style={{ fontSize: 14 }}>{insight.title}</div>
          <div className="ix" style={{ fontSize: 13, marginTop: 3 }}>{insight.text}</div>
        </div>
      </button>
    </ScreenScroll>
  );
}

/* ===================================================================
   LIBRARY
   =================================================================== */
const LIB_FILTERS = [
  { id: "all", label: "Усі" },
  { id: "reading", label: "Читаю" },
  { id: "completed", label: "Прочитано" },
  { id: "toread", label: "Плани" },
  { id: "abandoned", label: "Покинуто" },
];
function LibraryScreen({ ctx }) {
  const { books, openBook } = ctx;
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const list = books.filter((b) =>
    (filter === "all" || b.status === filter) &&
    (q === "" || (b.title + b.author).toLowerCase().includes(q.toLowerCase())));

  return (
    <ScreenScroll>
      <div className="greet-head row-between">
        <h1 className="h-title">Бібліотека</h1>
        <button className="fab" aria-label="Додати книгу" onClick={() => ctx.toast("Додавання книги — у прототипі")}><Icon name="plus" size={22} sw={2.4} /></button>
      </div>

      <div className="card mt-4" style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
        <Icon name="search" size={18} style={{ color: "var(--c-ink-3)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Назва або автор…"
               style={{ flex: 1, border: "none", background: "transparent", outline: "none",
                        fontFamily: "var(--font-body)", fontSize: 15, color: "var(--c-ink)" }} />
      </div>

      <div className="chip-row mt-4">
        {LIB_FILTERS.map((f) => (
          <button key={f.id} className="chip" data-on={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
      </div>

      <div className="book-grid mt-5">
        {list.map((b) => (
          <button key={b.id} className="grid-cell" onClick={() => openBook(b.id)}>
            <Cover book={b} />
            <div className="row-between" style={{ marginTop: 8, gap: 6 }}>
              <span className="status-dot" style={{ background: statusMeta(b.status).color }} />
              <div className="gc-title" style={{ flex: 1 }}>{b.title}</div>
            </div>
            <div className="gc-author">{b.author.split(" ").slice(-1)[0]}</div>
          </button>
        ))}
        {list.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--c-ink-3)", padding: 40, fontSize: 14 }}>Нічого не знайдено</div>}
      </div>
    </ScreenScroll>
  );
}

/* ===================================================================
   BOOK DETAIL
   =================================================================== */
function DetailScreen({ ctx }) {
  const { books, detailId, back, updateProgress, notesFor, nav } = ctx;
  const book = books.find((b) => b.id === detailId);
  const [val, setVal] = useState(book ? book.read : 0);
  useEffect(() => { if (book) setVal(book.read); }, [detailId]);
  if (!book) return null;
  const notes = notesFor(book.id);
  const m = statusMeta(book.status);

  return (
    <div className="screen-scroll fade-up" style={{ paddingTop: 2 }}>
      <div className="row-between" style={{ marginBottom: 18 }}>
        <button className="link-btn" onClick={back}><Icon name="arrowL" size={18} sw={2.2} /> Бібліотека</button>
        <button className="link-btn" onClick={() => ctx.toast("Поділитися")} style={{ color: "var(--c-ink-3)" }}><Icon name="share" size={18} /></button>
      </div>

      <div className="detail-hero">
        <Cover book={book} style={{ width: 124 }} />
        <div style={{ flex: 1, paddingBottom: 4 }}>
          <StatusPill status={book.status} />
          <div className="detail-title mt-3">{book.title}</div>
          <div className="detail-author">{book.author}</div>
          {book.rating && <div className="mt-3"><Stars n={book.rating} /></div>}
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--c-ink-2)", marginTop: 18 }}>{book.blurb}</p>

      <div className="mt-5"><Progress value={val} max={book.pages} /></div>

      {book.status === "reading" && (
        <div className="card mt-4">
          <span className="eyebrow">Оновити прогрес</span>
          <div className="stepper mt-3">
            <button onClick={() => setVal((v) => Math.max(0, v - 5))}>–</button>
            <span className="sv">{val} стор.</span>
            <button onClick={() => setVal((v) => Math.min(book.pages, v + 5))}>+</button>
          </div>
          <button className="btn btn-primary mt-3" disabled={val === book.read}
                  style={{ opacity: val === book.read ? 0.5 : 1 }}
                  onClick={() => updateProgress(book.id, val)}>
            Зберегти прогрес
          </button>
        </div>
      )}

      <div className="meta-grid mt-4">
        <div className="meta-cell"><div className="mk">Сторінок</div><div className="mv">{book.pages}</div></div>
        <div className="meta-cell"><div className="mk">Жанр</div><div className="mv" style={{ fontSize: 14 }}>{book.genre}</div></div>
        <div className="meta-cell"><div className="mk">Початок</div><div className="mv" style={{ fontSize: 14 }}>{fmtDate(book.start)}</div></div>
        <div className="meta-cell"><div className="mk">Завершено</div><div className="mv" style={{ fontSize: 14 }}>{fmtDate(book.finish)}</div></div>
      </div>

      {/* notes */}
      <div className="row-between mt-6">
        <span className="section-label">Нотатки</span>
        <button className="see-all" onClick={() => nav("notes")}>Усі <Icon name="chevR" size={13} sw={2.4} /></button>
      </div>
      <div className="stack gap-3 mt-3">
        {notes.length ? notes.map((n) => <NoteCard key={n.id} note={n} compact />) :
          <div style={{ color: "var(--c-ink-3)", fontSize: 14, padding: "8px 0" }}>Ще немає нотаток до цієї книги.</div>}
        <button className="btn btn-ghost" onClick={() => nav("notes")}><Icon name="plus" size={17} sw={2.2} /> Додати нотатку</button>
      </div>
    </div>
  );
}

/* ===================================================================
   ANALYTICS
   =================================================================== */
function AnalyticsScreen({ ctx }) {
  const [range, setRange] = useState("year");
  const data = BookData.MONTHLY;
  const maxPages = Math.max(...data.map((d) => d.pages));
  const totalPages = data.reduce((s, d) => s + d.pages, 0);
  const totalBooks = data.reduce((s, d) => s + d.books, 0);
  const show = range === "year" ? data : data.slice(-1);
  const heat = BookData.heat(10);
  const maxHeat = Math.max(...heat.map((h) => h.pages), 1);

  return (
    <ScreenScroll>
      <h1 className="h-title greet-head">Статистика</h1>

      <div className="segment mt-4">
        <button data-on={range === "month"} onClick={() => setRange("month")}>Місяць</button>
        <button data-on={range === "year"} onClick={() => setRange("year")}>Рік</button>
      </div>

      <div className="mt-5" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card stat-card">
          <span className="eyebrow muted">{range === "year" ? "Книг за рік" : "Книг за місяць"}</span>
          <div className="stat-big mt-3">{range === "year" ? totalBooks : show[0].books}</div>
          <div className="stat-cap">завершено</div>
        </div>
        <div className="card stat-card">
          <span className="eyebrow muted">{range === "year" ? "Сторінок за рік" : "За місяць"}</span>
          <div className="stat-big mt-3">{(range === "year" ? totalPages : show[0].pages).toLocaleString("uk")}</div>
          <div className="stat-cap">прочитано</div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="row-between"><span className="section-label">Сторінки за місяць</span></div>
        <div className="bars mt-5">
          {data.map((d, i) => (
            <div className="bar-col" key={d.month}>
              <div className="bar" style={{ height: `${(d.pages / maxPages) * 100}%`, animationDelay: `${i * 60}ms` }} />
              <span className="bar-x">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4">
        <span className="section-label">Книги за місяць</span>
        <div className="donut-legend mt-4">
          {data.filter((d) => d.books > 0).map((d) => (
            <div className="legend-item" key={d.month}>
              <span className="ld" style={{ background: "var(--c-accent)" }} />
              {d.month} <b>{d.books}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4">
        <span className="section-label">Активність · 10 тижнів</span>
        <div className="heat mt-4">
          {heat.map((h, i) => {
            const lv = h.pages === 0 ? 0 : Math.ceil((h.pages / maxHeat) * 3);
            const op = [0, 0.35, 0.65, 1][lv];
            return <span className="hd" key={i} style={lv ? { background: "var(--c-warn)", opacity: op } : null} title={`${h.date}: ${h.pages} стор.`} />;
          })}
        </div>
      </div>
    </ScreenScroll>
  );
}

/* ===================================================================
   NOTES
   =================================================================== */
const NOTE_TYPES = [
  { id: "idea", label: "Ідея" },
  { id: "quote", label: "Цитата" },
  { id: "application", label: "Застосування" },
];
function NoteCard({ note, compact }) {
  const book = BookData.byId(note.bookId);
  const tl = { idea: "Ідея", quote: "Цитата", application: "Застосування" }[note.type];
  return (
    <div className="note" data-t={note.type}>
      <span className="note-tag" data-t={note.type}>{tl}</span>
      <div className="note-text">{note.text}</div>
      {!compact && <div className="note-src">{book ? book.title : ""} · с. {note.page}</div>}
    </div>
  );
}
function NotesScreen({ ctx }) {
  const { notes, addNote, books } = ctx;
  const [type, setType] = useState("idea");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const list = notes.filter((n) => filter === "all" || n.type === filter);

  return (
    <ScreenScroll>
      <h1 className="h-title greet-head">Нотатки</h1>

      <div className="composer mt-4">
        <div className="type-pick">
          {NOTE_TYPES.map((t) => (
            <button key={t.id} data-t={t.id} data-on={type === t.id} onClick={() => setType(t.id)}>{t.label}</button>
          ))}
        </div>
        <textarea className="mt-3" value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Запиши думку, цитату чи як це застосувати…" />
        <button className="btn btn-primary" disabled={!text.trim()} style={{ opacity: text.trim() ? 1 : 0.5 }}
                onClick={() => { addNote(type, text.trim()); setText(""); }}>
          <Icon name="plus" size={17} sw={2.4} /> Додати нотатку
        </button>
      </div>

      <div className="chip-row mt-5">
        <button className="chip" data-on={filter === "all"} onClick={() => setFilter("all")}>Усі</button>
        {NOTE_TYPES.map((t) => (
          <button key={t.id} className="chip" data-on={filter === t.id} onClick={() => setFilter(t.id)}>{t.label}</button>
        ))}
      </div>

      <div className="stack gap-3 mt-4">
        {list.map((n) => <NoteCard key={n.id} note={n} />)}
        {list.length === 0 && <div style={{ color: "var(--c-ink-3)", fontSize: 14, textAlign: "center", padding: 30 }}>Ще немає нотаток.</div>}
      </div>
    </ScreenScroll>
  );
}

/* ===================================================================
   INSIGHTS
   =================================================================== */
const INSIGHT_ICON = { rhythm: "trend", up: "chart", time: "clock", pace: "target" };
function InsightsScreen({ ctx }) {
  const items = BookData.INSIGHTS;
  return (
    <ScreenScroll>
      <div className="greet-head stack gap-2">
        <span className="eyebrow muted">Тиждень за тижнем</span>
        <h1 className="h-title">Інсайти</h1>
        <p className="h-sub" style={{ maxWidth: 300 }}>Спокійні спостереження про твій ритм читання. Без тиску.</p>
      </div>

      <div className="stack gap-4 mt-5">
        {items.map((it) => (
          <div className="insight" key={it.id}>
            <span className="ic"><Icon name={INSIGHT_ICON[it.kind] || "spark"} size={20} /></span>
            <div style={{ flex: 1 }}>
              <div className="it">{it.title}</div>
              <div className="ix">{it.text}</div>
            </div>
          </div>
        ))}
      </div>
    </ScreenScroll>
  );
}

/* ===================================================================
   APP SHELL
   =================================================================== */
function BookApp({ skin, theme, initial = "home", initialBook = null }) {
  const [screen, setScreen] = useState(initialBook ? "detail" : initial);
  const [detailId, setDetailId] = useState(initialBook);
  const [books, setBooks] = useState(() => BookData.BOOKS.map((b) => ({ ...b })));
  const [notes, setNotes] = useState(() => BookData.NOTES.map((n) => ({ ...n })));
  const baseStreak = useMemo(() => {
    let s = 0;
    for (let i = 1; i < 90; i++) { if ((BookData.ACTIVITY[BookData.iso(BookData.daysAgo(i))] || 0) > 0) s++; else break; }
    return s;
  }, []);
  const [doneToday, setDoneToday] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const scrollRef = useRef(null);

  const currentId = books.find((b) => b.status === "reading")?.id || books[0].id;
  const current = books.find((b) => b.id === currentId);
  const finishedThisYear = BookData.MONTHLY.reduce((s, d) => s + d.books, 0);
  const streak = baseStreak + (doneToday ? 1 : 0);

  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1900);
  }
  function nav(s) { setScreen(s); if (scrollRef.current) scrollRef.current.scrollTop = 0; }
  function openBook(id) { setDetailId(id); setScreen("detail"); }
  function back() { setScreen("library"); }
  function logReading(pages) {
    setBooks((bs) => bs.map((b) => b.id === currentId ? { ...b, read: Math.min(b.pages, b.read + pages) } : b));
    setDoneToday(true);
    toast(`Записано! +${pages} стор. сьогодні`);
  }
  function updateProgress(id, val) {
    setBooks((bs) => bs.map((b) => {
      if (b.id !== id) return b;
      const done = val >= b.pages;
      return { ...b, read: val, status: done ? "completed" : b.status, finish: done ? "2026-06-08" : b.finish };
    }));
    toast("Прогрес оновлено");
  }
  function addNote(type, text) {
    setNotes((ns) => [{ id: "u" + Date.now(), bookId: currentId, type, page: current.read, text, date: "2026-06-08" }, ...ns]);
    toast("Нотатку додано");
  }
  const notesFor = (id) => notes.filter((n) => n.bookId === id);

  const ctx = { books, current, streak, doneToday, finishedThisYear, notes,
    nav, openBook, back, logReading, updateProgress, addNote, notesFor, toast, detailId };

  const navActive = screen === "detail" ? "library" : screen;

  return (
    <div className="phone" data-skin={skin} data-theme={theme}>
      <div className="screen">
        <StatusBar />
        <div className="screen-scroll-host" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }} ref={scrollRef}>
          {screen === "home" && <HomeScreen ctx={ctx} />}
          {screen === "library" && <LibraryScreen ctx={ctx} />}
          {screen === "detail" && <DetailScreen ctx={ctx} />}
          {screen === "analytics" && <AnalyticsScreen ctx={ctx} />}
          {screen === "notes" && <NotesScreen ctx={ctx} />}
          {screen === "insights" && <InsightsScreen ctx={ctx} />}
        </div>
        <div className="toast" data-show={!!toastMsg}>{toastMsg}</div>
        <TabBar active={navActive} onNav={nav} />
      </div>
    </div>
  );
}

Object.assign(window, { BookApp, NoteCard });
