import { create } from "zustand";

/** Which secondary panel is expanded in the Workspace right column. */
export type WorkspacePanel = "ciel" | "tests" | "terminal" | "leaderboard" | null;

type EditorState = {
  /** Current editor buffer. Pure UI/client state - never in TanStack Query. */
  code: string;
  language: string;
  openPanel: WorkspacePanel;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setOpenPanel: (panel: WorkspacePanel) => void;
  reset: () => void;
};

const initial = { code: "", language: "python", openPanel: "ciel" as WorkspacePanel };

export const useEditorStore = create<EditorState>((set) => ({
  ...initial,
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setOpenPanel: (openPanel) => set({ openPanel }),
  reset: () => set(initial),
}));
