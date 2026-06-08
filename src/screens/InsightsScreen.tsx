// INSIGHTS / Інсайти — 1–2 gentle behavioral observations. No pressure.

import type { AppCtx } from "../ctx";
import type { InsightKind } from "../types";
import { Icon, type IconName } from "../components/Icon";
import { SEED_INSIGHTS } from "../data/seed";
import { t } from "../i18n/uk";

const INSIGHT_ICON: Record<InsightKind, IconName> = {
  rhythm: "trend",
  up: "chart",
  time: "clock",
  pace: "target",
};

export function InsightsScreen(_props: { ctx: AppCtx }) {
  const items = SEED_INSIGHTS;
  return (
    <div className="screen-scroll fade-up">
      <div className="greet-head stack gap-2">
        <span className="eyebrow muted">{t.insightsEyebrow}</span>
        <h1 className="h-title">{t.insights}</h1>
        <p className="h-sub" style={{ maxWidth: 300 }}>
          {t.insightsSub}
        </p>
      </div>

      <div className="stack gap-4 mt-5">
        {items.map((it) => (
          <div className="insight" key={it.id}>
            <span className="ic">
              <Icon name={INSIGHT_ICON[it.kind] || "spark"} size={20} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="it">{it.title}</div>
              <div className="ix">{it.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
