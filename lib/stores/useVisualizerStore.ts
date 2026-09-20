import { create } from "zustand";
import type { TraceFrame } from "@/lib/types/trace";

export type VisualizerStatus = "idle" | "loading" | "ready" | "error";

type VisualizerState = {
  frames: TraceFrame[];
  step: number;
  status: VisualizerStatus;
  error: string | null;
  playing: boolean;
  /** Playback multiplier; StepPlayer turns this into an interval. */
  speed: number;

  setLoading: () => void;
  setError: (message: string) => void;
  /** Load a fresh trace: reset to the first frame and stop playback. */
  setFrames: (frames: TraceFrame[]) => void;
  next: () => void;
  prev: () => void;
  goto: (step: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
};

const clamp = (n: number, max: number) => Math.min(Math.max(n, 0), Math.max(max, 0));

const initial = {
  frames: [] as TraceFrame[],
  step: 0,
  status: "idle" as VisualizerStatus,
  error: null as string | null,
  playing: false,
  speed: 1,
};

export const useVisualizerStore = create<VisualizerState>((set) => ({
  ...initial,

  setLoading: () => set({ status: "loading", error: null, playing: false }),
  setError: (message) => set({ status: "error", error: message, playing: false }),
  setFrames: (frames) => set({ frames, step: 0, status: "ready", error: null, playing: false }),

  next: () =>
    set((s) => {
      const last = s.frames.length - 1;
      const nextStep = clamp(s.step + 1, last);
      // Auto-stop playback once the final frame is reached.
      return { step: nextStep, playing: nextStep >= last ? false : s.playing };
    }),
  prev: () => set((s) => ({ step: clamp(s.step - 1, s.frames.length - 1) })),
  goto: (step) => set((s) => ({ step: clamp(step, s.frames.length - 1) })),

  setPlaying: (playing) => set((s) => (s.frames.length > 1 ? { playing } : { playing: false })),
  setSpeed: (speed) => set({ speed }),
  reset: () => set(initial),
}));
