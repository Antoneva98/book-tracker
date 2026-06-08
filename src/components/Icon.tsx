// Inline SVG icon set (stroke-based, 24×24, currentColor).
// Ported from ICON_PATHS in reference/components.jsx.

import type { CSSProperties } from "react";

export const ICON_PATHS = {
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
  flame:
    "M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 .5-1.5.5-1.5C16 12 16 14 16 15a4 4 0 1 1-8 0c0-4 4-6 4-12z",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  arrowL: "M19 12H5M12 19l-7-7 7-7",
  pen: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  quote: "M7 7h4v4c0 2-1.5 3.5-4 4M14 7h4v4c0 2-1.5 3.5-4 4",
  target:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z",
  trend: "M3 17l6-6 4 4 8-8M21 7v5h-5",
  moon: "M21 12.8A8.5 8.5 0 1 1 11.2 3 6.6 6.6 0 0 0 21 12.8z",
  sun: "M12 4V2M12 22v-2M5 5 3.5 3.5M20.5 20.5 19 19M4 12H2M22 12h-2M5 19l-1.5 1.5M20.5 3.5 19 5M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  share: "M4 12v8h16v-8M12 16V4M8 8l4-4 4 4",
  x: "M18 6 6 18M6 6l12 12",
  trash: "M4 7h16M10 7V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2M6 7l1 13h10l1-13M10 11v6M14 11v6",
} as const;

export type IconName = keyof typeof ICON_PATHS;

interface IconProps {
  name: IconName;
  size?: number;
  sw?: number;
  fill?: boolean;
  style?: CSSProperties;
}

export function Icon({ name, size = 22, sw = 1.9, fill = false, style }: IconProps) {
  const d = ICON_PATHS[name] || "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke={fill ? "none" : "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
