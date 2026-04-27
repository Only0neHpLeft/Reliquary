import { create } from "zustand";

interface UIStore {
  readonly settingsOpen: boolean;
  readonly historyOpen: boolean;
  readonly setSettingsOpen: (v: boolean) => void;
  readonly setHistoryOpen: (v: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  historyOpen: false,
  setSettingsOpen: (v) => set({ settingsOpen: v }),
  setHistoryOpen: (v) => set({ historyOpen: v }),
}));
