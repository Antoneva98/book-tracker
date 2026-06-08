/* Світло-only preview — renders all 6 screens in one column, light/dark toggle. */
const { useState: useStateP } = React;

const SCREENS_P = [
  { initial: "home", label: "Головна / Home" },
  { initial: "library", label: "Бібліотека / Library" },
  { initial: "detail", label: "Книга / Book detail", book: "tini" },
  { initial: "analytics", label: "Статистика / Analytics" },
  { initial: "notes", label: "Нотатки / Notes" },
  { initial: "insights", label: "Інсайти / Insights" },
];

function PreviewPhone({ theme, scr }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 13, color: "#1a1c22" }}>{scr.label}</span>
      <BookApp skin="svitlo" theme={theme} initial={scr.initial} initialBook={scr.book || null} />
    </div>
  );
}

function Preview() {
  const [theme, setTheme] = useStateP("light");
  return (
    <div className="board" style={{ padding: 0 }}>
      <header style={{ maxWidth: 1180, margin: "0 auto", padding: "40px 32px 8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7c8088" }}>Тема «Світло» · довідковий прев'ю</div>
          <h1 style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 34, letterSpacing: "-0.03em", margin: "10px 0 0", color: "#13151b" }}>Трекер читання — Світло</h1>
        </div>
        <div style={{ display: "flex", gap: 6, background: "#fff", padding: 5, borderRadius: 999, boxShadow: "0 2px 10px rgba(0,0,0,0.08)" }}>
          {["light", "dark"].map((th) => (
            <button key={th} onClick={() => setTheme(th)}
              style={{ border: "none", cursor: "pointer", borderRadius: 999, padding: "9px 18px", fontFamily: "Manrope, sans-serif", fontWeight: 700, fontSize: 13,
                background: theme === th ? "#2f5bff" : "transparent", color: theme === th ? "#fff" : "#5a6478" }}>
              {th === "light" ? "Світла" : "Темна"}
            </button>
          ))}
        </div>
      </header>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 32px 80px",
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(384px, 1fr))", gap: "40px 26px", justifyItems: "start" }}>
        {SCREENS_P.map((scr) => <PreviewPhone key={scr.label} theme={theme} scr={scr} />)}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Preview />);
