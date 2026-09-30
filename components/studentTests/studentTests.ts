// Pure helpers for the Tests tab (P2.3): the student's own tests, their check
// against the reference and their run on the student's code. No React and only
// type imports plus static data, so node:test can load this file.
import type {
  OwnTestResult,
  StudentTest,
  StudentTestCategory,
  TestCheckOut,
  TestsState,
} from "@/lib/types/attempt";
import type { StudentTestsReport } from "@/lib/types/report";
import { EXERCISE_TEST_FACTS, type WorkedExample } from "@/lib/studentTestExamples";

export const STUDENT_TEST_CATEGORIES: readonly StudentTestCategory[] = ["happy", "boundary", "edge", "error"];
export const MAX_STUDENT_TESTS = 10;
export const MAX_TEST_INPUT = 300;
export const MAX_TEST_EXPECTED = 300;
export const MAX_TEST_WHY = 200;
/** Junior/senior: valid tests needed for full marks on "valid tests". */
export const REQUIRED_VALID_TESTS = 3;

/** A test as edited in the tab; `key` is local only (React identity), never sent. */
export type TestDraft = StudentTest & { key: string };

/** A result is kept with the input/expected it was computed for, so an edit hides it. */
export type Stamped<T> = { signature: string; result: T };

/** True when the attempt has the Tests tab. A backend without P2.3 omits `tests`. */
export function hasTestsTab(tests: TestsState | null | undefined): tests is TestsState {
  return Boolean(tests && tests.enabled);
}

export function newDraft(key: string, category: StudentTestCategory = "happy"): TestDraft {
  return { key, category, input: "", expected: "", why: "" };
}

export function draftsFrom(tests: readonly StudentTest[], makeKey: () => string): TestDraft[] {
  return tests.slice(0, MAX_STUDENT_TESTS).map((t) => ({ ...clampTest(t), key: makeKey() }));
}

function isCategory(value: unknown): value is StudentTestCategory {
  return typeof value === "string" && (STUDENT_TEST_CATEGORIES as readonly string[]).includes(value);
}

/** Cuts every field to the server's limits and repairs an unknown category. */
export function clampTest<T extends StudentTest>(test: T): T {
  return {
    ...test,
    category: isCategory(test.category) ? test.category : "happy",
    input: test.input.slice(0, MAX_TEST_INPUT),
    expected: test.expected.slice(0, MAX_TEST_EXPECTED),
    why: test.why.slice(0, MAX_TEST_WHY),
  };
}

/** Adds a draft; a no-op at the maximum. */
export function addDraft(drafts: readonly TestDraft[], draft: TestDraft): TestDraft[] {
  if (drafts.length >= MAX_STUDENT_TESTS) return [...drafts];
  return [...drafts, clampTest(draft)];
}

export function removeDraft(drafts: readonly TestDraft[], key: string): TestDraft[] {
  return drafts.filter((d) => d.key !== key);
}

export function updateDraft(
  drafts: readonly TestDraft[],
  key: string,
  patch: Partial<StudentTest>,
): TestDraft[] {
  return drafts.map((d) => (d.key === key ? clampTest({ ...d, ...patch }) : d));
}

/** The server needs an input; a row without one stays a local draft. */
export function isSavable(test: StudentTest): boolean {
  return test.input.trim().length > 0;
}

/** What the server compares: category and why do not change validity. */
export function testSignature(test: StudentTest): string {
  return `${test.input.trim()}\n${test.expected.trim()}`;
}

/** The body sent to the server (trimmed), without the local key. */
export function toStudentTest(draft: StudentTest): StudentTest {
  return {
    category: draft.category,
    input: draft.input.trim(),
    expected: draft.expected.trim(),
    why: draft.why.trim(),
  };
}

/** The savable drafts in order, with the keys the server's order maps back to. */
export function toSaved(drafts: readonly TestDraft[]): { tests: StudentTest[]; keys: string[]; signatures: string[] } {
  const savable = drafts.filter(isSavable);
  return {
    tests: savable.map(toStudentTest),
    keys: savable.map((d) => d.key),
    signatures: savable.map(testSignature),
  };
}

/** The result for a draft only while its input/expected are unchanged. */
export function currentResult<T>(
  results: Readonly<Record<string, Stamped<T>>>,
  draft: TestDraft,
): T | null {
  const stamped = results[draft.key];
  return stamped && stamped.signature === testSignature(draft) ? stamped.result : null;
}

/**
 * Maps `tests/run` results (the saved tests, in saved order) back to drafts.
 * A length mismatch keeps only the pairs both sides have.
 */
export function mapRunResults(
  saved: { keys: readonly string[]; signatures: readonly string[] },
  results: readonly OwnTestResult[],
): Record<string, Stamped<OwnTestResult>> {
  const out: Record<string, Stamped<OwnTestResult>> = {};
  const n = Math.min(saved.keys.length, results.length);
  for (let i = 0; i < n; i += 1) out[saved.keys[i]] = { signature: saved.signatures[i], result: results[i] };
  return out;
}

/** Categories with at least one written (savable) test, in the canonical order. */
export function coveredCategories(drafts: readonly StudentTest[]): StudentTestCategory[] {
  const used = new Set(drafts.filter(isSavable).map((d) => d.category));
  return STUDENT_TEST_CATEGORIES.filter((c) => used.has(c));
}

/** The exercise's categories not covered yet, in the exercise's order. */
export function missingCategories(
  exerciseCategories: readonly StudentTestCategory[],
  drafts: readonly StudentTest[],
): StudentTestCategory[] {
  const covered = new Set(coveredCategories(drafts));
  return exerciseCategories.filter((c) => !covered.has(c));
}

/** Drafts whose latest check (for their current content) said valid. */
export function checkedValidCount(
  drafts: readonly TestDraft[],
  checks: Readonly<Record<string, Stamped<TestCheckOut>>>,
): number {
  return drafts.filter((d) => currentResult(checks, d)?.status === "valid").length;
}

/** Categories coverage is measured against; all four when the exercise is unknown here. */
export function exerciseCategoriesFor(exerciseCode: string): StudentTestCategory[] {
  const facts = EXERCISE_TEST_FACTS[exerciseCode.toUpperCase()];
  return facts ? [...facts.categories] : [...STUDENT_TEST_CATEGORIES];
}

/** Fresher learning mode only (tests optional): the worked example, if this exercise has one. */
export function workedExample(exerciseCode: string, required: boolean): WorkedExample | null {
  if (required) return null;
  return EXERCISE_TEST_FACTS[exerciseCode.toUpperCase()]?.example ?? null;
}

/**
 * An `error` reason is either an exception type ("TypeError") or the reason
 * the input is not allowed ("name '__import__' is not allowed in a test").
 */
export function isExceptionType(reason: string | null): boolean {
  if (!reason) return true;
  return /^[A-Za-z_][\w.]*$/.test(reason.trim());
}

export type CheckView =
  | { kind: "valid" }
  | { kind: "wrong_expected" }
  | { kind: "exception"; detail: string | null }
  | { kind: "refused"; detail: string };

export function checkView(check: TestCheckOut): CheckView {
  if (check.status === "valid") return { kind: "valid" };
  if (check.status === "wrong_expected") return { kind: "wrong_expected" };
  const reason = check.reason?.trim() || null;
  return isExceptionType(reason) ? { kind: "exception", detail: reason } : { kind: "refused", detail: reason ?? "" };
}

/** Why a test was judged invalid at submit: `wrong_expected`, `error` or the allow-list reason. */
export function reportReasonView(reason: string | null): CheckView {
  const text = reason?.trim() || null;
  if (text === "wrong_expected") return { kind: "wrong_expected" };
  if (text === null || text === "error") return { kind: "exception", detail: null };
  return isExceptionType(text) ? { kind: "exception", detail: text } : { kind: "refused", detail: text };
}

export type TestsErrorKind = "rate_limited" | "submitted" | "invalid" | "no_tab" | "failed";

/** Maps an HTTP status of the tests endpoints to the message to show. */
export function testsErrorKind(status: number | null): TestsErrorKind {
  if (status === 429) return "rate_limited";
  if (status === 409) return "submitted";
  if (status === 422) return "invalid";
  if (status === 400) return "no_tab";
  return "failed";
}

/** Counts for the Feedback summary line. */
export function reportCounts(report: StudentTestsReport): { written: number; valid: number } {
  return { written: report.tests.length, valid: report.tests.filter((t) => t.valid).length };
}
