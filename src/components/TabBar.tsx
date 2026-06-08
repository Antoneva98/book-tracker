// Floating bottom tab bar (5 tabs). The "Інсайти" icon fills when active.

import type { Screen } from "../types";
import { Icon, type IconName } from "./Icon";
import { t } from "../i18n/uk";

interface Tab {
  id: Screen;
  icon: IconName;
  label: string;
}

export const TABS: Tab[] = [
  { id: "home", icon: "home", label: t.tabHome },
  { id: "library", icon: "library", label: t.tabLibrary },
  { id: "analytics", icon: "chart", label: t.tabAnalytics },
  { id: "notes", icon: "note", label: t.tabNotes },
  { id: "insights", icon: "spark", label: t.tabInsights },
];

interface TabBarProps {
  active: Screen;
  onNav: (s: Screen) => void;
}

export function TabBar({ active, onNav }: TabBarProps) {
  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className="tab-item"
          data-on={active === tab.id}
          onClick={() => onNav(tab.id)}
          aria-current={active === tab.id ? "page" : undefined}
        >
          <Icon
            name={tab.icon}
            size={21}
            sw={active === tab.id ? 2.2 : 1.8}
            fill={tab.id === "insights" && active === tab.id}
          />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
