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

/** Category a student gives their own test (P2.3). */
export type StudentTestCategory = "happy" | "boundary" | "edge" | "error";

/**
 * One student-written test. `input` is one Python expression calling the
 * exercise's own functions/classes; `expected` is the value as Python prints it.
 */
export type StudentTest = {
  category: StudentTestCategory;
  /** 1-300 chars. */
  input: string;
  /** At most 300 chars. */
  expected: string;
  /** At most 200 chars. */
  why: string;
};

/** The Tests tab of an attempt (P2.3); `null` on exercises without the tab. */
export type TestsState = {
  enabled: boolean;
  /** Junior/senior: fewer than 3 valid tests lowers Testing. Fresher: optional. */
  required: boolean;
  /** The latest saved tests. */
  tests: StudentTest[];
};

/** A check against the reference solution; never carries the reference's output. */
export type TestCheckOut = {
  status: "valid" | "wrong_expected" | "error";
  /** For `error`: the allow-list reason or the exception type; otherwise `null`. */
  reason: string | null;
};

/** One saved test run on the student's own code (actual values are theirs to see). */
export type OwnTestResult = { passed: boolean; actual: string | null; error: string | null };

export type AttemptState = {
  id: number;
  exercise_code: string;
  status: string;
  score: number | null;
  latest_code: string | null;
  /** Absent on backends without P2.2; treat a missing value as `null`. */
  debug?: DebugState | null;
  /** Absent on backends without P2.3; treat a missing value as `null`. */
  tests?: TestsState | null;
};

export type DebugHintOut = { step: 1 | 2; text: string };

/** Lines are 1-based lines of the starter as served (the code the editor shows). */
export type LocateIn = { lines: number[]; reason: string; skipped: boolean };
