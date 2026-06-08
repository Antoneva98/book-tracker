// Faux iOS status bar — 9:41 + signal/wifi/battery glyphs.

export function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="sb-icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="7" width="3" height="5" rx="1" />
          <rect x="5" y="4" width="3" height="8" rx="1" />
          <rect x="10" y="2" width="3" height="10" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 2.5c2.3 0 4.4.9 6 2.4l1.4-1.5A11 11 0 0 0 8.5.5 11 11 0 0 0 1 3.4l1.4 1.5a8.6 8.6 0 0 1 6.1-2.4zM8.5 6c1.2 0 2.3.5 3.1 1.3l1.4-1.4A6.6 6.6 0 0 0 8.5 4 6.6 6.6 0 0 0 4 5.9l1.4 1.4A4.4 4.4 0 0 1 8.5 6zm0 3.4 2-2a2.8 2.8 0 0 0-4 0z" />
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect
            x="0.5"
            y="1"
            width="21"
            height="11"
            rx="3"
            stroke="currentColor"
            strokeOpacity="0.4"
          />
          <rect x="2" y="2.5" width="17" height="8" rx="1.5" fill="currentColor" />
          <rect
            x="23"
            y="4.5"
            width="2"
            height="4"
            rx="1"
            fill="currentColor"
            fillOpacity="0.5"
          />
        </svg>
      </span>
    </div>
  );
}
