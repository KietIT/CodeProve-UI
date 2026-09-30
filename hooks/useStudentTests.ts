"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, checkStudentTest, runStudentTests, saveStudentTests } from "@/lib/api";
import type { OwnTestResult, StudentTest, TestCheckOut, TestsState } from "@/lib/types/attempt";
import {
  addDraft,
  draftsFrom,
  isSavable,
  mapRunResults,
  newDraft,
  removeDraft,
  testSignature,
  testsErrorKind,
  toSaved,
  toStudentTest,
  updateDraft,
  type Stamped,
  type TestDraft,
  type TestsErrorKind,
} from "@/components/studentTests/studentTests";

/** Debounce between the last edit and the save (the server keeps the latest save). */
const SAVE_DELAY_MS = 800;

export type TestsSaveState = "idle" | "pending" | "saving" | "saved" | "error";

type SavedSet = { keys: string[]; signatures: string[] };

function errorKindOf(err: unknown): TestsErrorKind {
  return testsErrorKind(err instanceof ApiError ? err.status : null);
}

/**
 * State of the Tests tab (P2.3) for one attempt: the drafts, a debounced save
 * on every edit, the per-test check against the reference and the run of the
 * saved tests on the student's code. `initial` is the attempt's `tests` state;
 * a new value (new attempt) resets everything.
 */
export function useStudentTests({
  attemptId,
  initial,
  getCode,
}: {
  attemptId: number | null;
  initial: TestsState | null;
  /** The editor code at the moment of a run. */
  getCode: () => string;
}) {
  const [drafts, setDrafts] = useState<TestDraft[]>([]);
  const [saveState, setSaveState] = useState<TestsSaveState>("idle");
  const [checks, setChecks] = useState<Record<string, Stamped<TestCheckOut>>>({});
  const [checking, setChecking] = useState<string[]>([]);
  const [runResults, setRunResults] = useState<Record<string, Stamped<OwnTestResult>>>({});
  const [runSummary, setRunSummary] = useState<{ passed: number; total: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<TestsErrorKind | null>(null);

  const draftsRef = useRef<TestDraft[]>([]);
  const attemptIdRef = useRef<number | null>(attemptId);
  attemptIdRef.current = attemptId;
  const getCodeRef = useRef(getCode);
  getCodeRef.current = getCode;
  const keyRef = useRef(0);
  const savedRef = useRef<SavedSet>({ keys: [], signatures: [] });
  const dirtyRef = useRef(false);
  // After a 409 (submitted) or 400 (no tab) nothing more can be saved.
  const closedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainRef = useRef<Promise<boolean>>(Promise.resolve(true));

  const makeKey = useCallback(() => `t${++keyRef.current}`, []);

  const apply = useCallback((next: TestDraft[]) => {
    draftsRef.current = next;
    setDrafts(next);
  }, []);

  const saveNow = useCallback(async (): Promise<boolean> => {
    const id = attemptIdRef.current;
    if (!id || !dirtyRef.current) return true;
    if (closedRef.current) return false;
    const snapshot = toSaved(draftsRef.current);
    dirtyRef.current = false;
    setSaveState("saving");
    try {
      await saveStudentTests(id, snapshot.tests);
      savedRef.current = { keys: snapshot.keys, signatures: snapshot.signatures };
      setSaveState(dirtyRef.current ? "pending" : "saved");
      setError((prev) => (prev === "failed" || prev === "invalid" ? null : prev));
      return true;
    } catch (err) {
      const kind = errorKindOf(err);
      if (kind === "submitted" || kind === "no_tab") closedRef.current = true;
      else dirtyRef.current = true; // retried on the next edit, run or submit
      setError(kind);
      setSaveState("error");
      return false;
    }
  }, []);

  /** Saves pending edits now; resolves true when the server has the latest tests. */
  const flush = useCallback((): Promise<boolean> => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    chainRef.current = chainRef.current.then(saveNow, saveNow);
    return chainRef.current;
  }, [saveNow]);

  const edit = useCallback(
    (next: TestDraft[]) => {
      apply(next);
      dirtyRef.current = true;
      setSaveState("pending");
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    },
    [apply, flush],
  );

  // New attempt: start from its saved tests.
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const list = initial ? draftsFrom(initial.tests, makeKey) : [];
    apply(list);
    const saved = toSaved(list);
    savedRef.current = { keys: saved.keys, signatures: saved.signatures };
    dirtyRef.current = false;
    closedRef.current = false;
    setSaveState("idle");
    setChecks({});
    setChecking([]);
    setRunResults({});
    setRunSummary(null);
    setError(null);
  }, [attemptId, initial, apply, makeKey]);

  // Leaving the page: send what is pending (best effort).
  useEffect(
    () => () => {
      if (dirtyRef.current) void flush();
    },
    [flush],
  );

  const add = useCallback(
    (test?: StudentTest) => {
      const draft = { ...(test ?? newDraft("")), key: makeKey() };
      edit(addDraft(draftsRef.current, draft));
    },
    [edit, makeKey],
  );

  const remove = useCallback((key: string) => edit(removeDraft(draftsRef.current, key)), [edit]);

  const update = useCallback(
    (key: string, patch: Partial<StudentTest>) => edit(updateDraft(draftsRef.current, key, patch)),
    [edit],
  );

  const check = useCallback(async (key: string) => {
    const id = attemptIdRef.current;
    const draft = draftsRef.current.find((d) => d.key === key);
    if (!id || !draft || !isSavable(draft)) return;
    setChecking((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setError(null);
    try {
      const result = await checkStudentTest(id, toStudentTest(draft));
      setChecks((prev) => ({ ...prev, [key]: { signature: testSignature(draft), result } }));
    } catch (err) {
      setError(errorKindOf(err));
    } finally {
      setChecking((prev) => prev.filter((k) => k !== key));
    }
  }, []);

  /** Saves, then runs the saved tests on the editor code. */
  const run = useCallback(async () => {
    const id = attemptIdRef.current;
    if (!id) return;
    setRunning(true);
    setError(null);
    try {
      if (!(await flush())) return;
      const saved = savedRef.current;
      if (saved.keys.length === 0) {
        setRunResults({});
        setRunSummary({ passed: 0, total: 0 });
        return;
      }
      const { results } = await runStudentTests(id, getCodeRef.current());
      setRunResults(mapRunResults(saved, results));
      setRunSummary({ passed: results.filter((r) => r.passed).length, total: results.length });
    } catch (err) {
      setError(errorKindOf(err));
    } finally {
      setRunning(false);
    }
  }, [flush]);

  return {
    drafts,
    saveState,
    checks,
    checking,
    runResults,
    runSummary,
    running,
    error,
    add,
    remove,
    update,
    check,
    run,
    flush,
  };
}

export type StudentTestsController = ReturnType<typeof useStudentTests>;
