"use client";

import { useMutation } from "@tanstack/react-query";
import { traceCode, type TraceInput } from "@/lib/api";
import type { TraceResponse } from "@/lib/types/trace";
import { useVisualizerStore } from "@/lib/stores/useVisualizerStore";

/**
 * Runs the practice-mode trace and feeds the result into the visualizer store.
 * Server state (the trace) flows through TanStack Query; the frames + current
 * step live in Zustand (useVisualizerStore) as UI state.
 */
export function useTrace() {
  const setLoading = useVisualizerStore((s) => s.setLoading);
  const setFrames = useVisualizerStore((s) => s.setFrames);
  const setError = useVisualizerStore((s) => s.setError);

  return useMutation<TraceResponse, Error, TraceInput>({
    mutationFn: (input) => traceCode(input),
    onMutate: () => setLoading(),
    onSuccess: (res) => {
      if (res.error && res.frames.length === 0) {
        setError(res.error);
        return;
      }
      setFrames(res.frames);
    },
    onError: (err) => setError(err.message),
  });
}
