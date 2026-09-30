import { apiFetch } from "./client";
import type {
  AttemptState,
  DebugHintOut,
  LocateIn,
  OwnTestResult,
  RunResult,
  StudentTest,
  TestCheckOut,
} from "@/lib/types/attempt";

export const createAttempt = (exercise_code: string) =>
  apiFetch<{ attempt_id: number; started_at: string }>("/attempts", {
    method: "POST",
    body: { exercise_code },
  });

/** `locale` picks the language of the debug hints already bought. */
export const getAttempt = (id: number, locale: string = "en") =>
  apiFetch<AttemptState>(`/attempts/${id}?locale=${locale}`);

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

/** Buys the next hint of a debug exercise's locate step (at most 2). */
export const takeDebugHint = (id: number, locale: string = "en") =>
  apiFetch<DebugHintOut>(`/attempts/${id}/debug/hint?locale=${locale}`, { method: "POST" });

/** Records the bug location (or a skip). The response never says whether it was right. */
export const locateBug = (id: number, body: LocateIn) =>
  apiFetch<{ ok: boolean }>(`/attempts/${id}/debug/locate`, { method: "POST", body });

/** Saves the student's tests (at most 10; latest save wins). 409 after submit. */
export const saveStudentTests = (id: number, tests: StudentTest[]) =>
  apiFetch<{ ok: boolean }>(`/attempts/${id}/tests`, { method: "PUT", body: { tests } });

/** Checks one test against the reference solution. Shares the Run rate limit (429). */
export const checkStudentTest = (id: number, test: StudentTest) =>
  apiFetch<TestCheckOut>(`/attempts/${id}/tests/check`, { method: "POST", body: test });

/** Runs the SAVED tests on the student's own code, in saved order. */
export const runStudentTests = (id: number, source_code: string) =>
  apiFetch<{ results: OwnTestResult[] }>(`/attempts/${id}/tests/run`, {
    method: "POST",
    body: { source_code },
  });
