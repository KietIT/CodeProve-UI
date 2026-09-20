import { create } from "zustand";
import type { PromptLogEntry } from "@/lib/types/session";

type SessionState = {
  /** The attempt currently open in the Workspace, if any. */
  attemptId: number | null;
  exerciseCode: string | null;
  /** Ciel prompt log for this session; client-side only for now. */
  promptLog: PromptLogEntry[];
  startSession: (attemptId: number, exerciseCode: string) => void;
  addPromptEntry: (entry: Omit<PromptLogEntry, "ts"> & { ts?: number }) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  attemptId: null,
  exerciseCode: null,
  promptLog: [],
  startSession: (attemptId, exerciseCode) =>
    set({ attemptId, exerciseCode, promptLog: [] }),
  addPromptEntry: (entry) =>
    set((s) => ({
      promptLog: [...s.promptLog, { ...entry, ts: entry.ts ?? Date.now() }],
    })),
  clear: () => set({ attemptId: null, exerciseCode: null, promptLog: [] }),
}));
