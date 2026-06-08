// The context object passed to every screen: persisted store + navigation.

import type { BookStore } from "./data/store";
import type { Screen } from "./types";

export interface AppCtx extends BookStore {
  nav: (s: Screen) => void;
  openBook: (id: string) => void;
  back: () => void;
  detailId: string | null;
}
