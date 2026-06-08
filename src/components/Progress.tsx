// Progress bar + optional mono meta row (e.g. "142 / 224 стор."  63%).

import { t } from "../i18n/uk";

interface ProgressProps {
  value: number;
  max: number;
  showMeta?: boolean;
  unit?: string;
}

export function Progress({
  value,
  max,
  showMeta = true,
  unit = t.pagesUnit,
}: ProgressProps) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="stack gap-2">
      <div className="progress">
        <i style={{ width: pct + "%" }} />
      </div>
      {showMeta && (
        <div className="progress-meta">
          <span>
            {value} / {max} {unit}
          </span>
          <b>{pct}%</b>
        </div>
      )}
    </div>
  );
}
