// Progress ring (streak / goal). Animates the stroke sweep on mount.

import { useEffect, useState, type ReactNode } from "react";

interface RingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  children?: ReactNode;
  num?: ReactNode;
  label?: string;
  numSize?: number;
}

export function Ring({
  value,
  max = 1,
  size = 92,
  stroke = 9,
  color = "var(--c-accent)",
  track = "var(--c-surface-2)",
  children,
  num,
  label,
  numSize = 30,
}: RingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  const [draw, setDraw] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setTimeout(() => setDraw(pct), 60));
    return () => cancelAnimationFrame(id);
  }, [pct]);

  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - draw)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="ring-center">
        {children || (
          <>
            <div className="ring-num" style={{ fontSize: numSize }}>
              {num}
            </div>
            {label && <div className="ring-label">{label}</div>}
          </>
        )}
      </div>
    </div>
  );
}
