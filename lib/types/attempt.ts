export type RunCase = {
  name: string;
  passed: boolean;
  stdout: string;
  error: string | null;
};

export type RunResult = {
  passed: number;
  total: number;
  coverage: number;
  cases: RunCase[];
  runtime_error: string | null;
};

/** Locate step of a debug exercise (P2.2); `null` on other exercises. */
export type DebugState = {
  located: boolean;
  /** 0-2 */
  hints_used: number;
  /** Hints already bought, in the requested locale, so a reload can show them. */
  hints: string[];
};

export type AttemptState = {
  id: number;
  exercise_code: string;
  status: string;
  score: number | null;
  latest_code: string | null;
  /** Absent on backends without P2.2; treat a missing value as `null`. */
  debug?: DebugState | null;
};

export type DebugHintOut = { step: 1 | 2; text: string };

/** Lines are 1-based lines of the starter as served (the code the editor shows). */
export type LocateIn = { lines: number[]; reason: string; skipped: boolean };
