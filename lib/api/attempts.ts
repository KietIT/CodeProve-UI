import { apiFetch } from "./client";
import type { AttemptState, RunResult } from "@/lib/types/attempt";

export const createAttempt = (exercise_code: string) =>
  apiFetch<{ attempt_id: number; started_at: string }>("/attempts", {
    method: "POST",
    body: { exercise_code },
  });

export const getAttempt = (id: number) =>
  apiFetch<AttemptState>(`/attempts/${id}`);

export const sendEvents = (id: number, events: unknown[]) =>
  apiFetch<{ ingested: number }>(`/attempts/${id}/events`, {
    method: "POST",
    body: { events },
  });

export const saveSnapshot = (id: number, version: number, source_code: string) =>
  apiFetch<{ ok: boolean }>(`/attempts/${id}/snapshots`, {
    method: "POST",
    body: { version, source_code },
  });

export const runTests = (id: number, source_code: string) =>
  apiFetch<RunResult>(`/attempts/${id}/run`, {
    method: "POST",
    body: { source_code, run_tests: true },
  });

export const logHypothesis = (id: number, text: string) =>
  apiFetch<{ correct: boolean; note: string }>(`/attempts/${id}/hypothesis`, {
    method: "POST",
    body: { text },
  });
