// Pure helpers for the locate step of debug exercises (P2.2). No React and only
// type imports, so node:test can load this file.
import type { AttemptState, DebugState } from "@/lib/types/attempt";
import type { DebugReveal } from "@/lib/types/report";

/**
 * The server accepts between 1 and (bug regions + 1) lines, a number the UI
 * must not know; 3 covers every exercise and the server's 422 covers the rest.
 */
export const MAX_LOCATE_LINES = 3;
export const MAX_REASON_CHARS = 500;
export const MAX_DEBUG_HINTS = 2;

/** "none": no locate step (other exercises, or a backend without P2.2). */
export type DebugStep = "none" | "locate" | "fix";

export function debugStep(debug: DebugState | null | undefined): DebugStep {
  if (!debug) return "none";
  return debug.located ? "fix" : "locate";
}

/** Adds or removes a line; adding past `max` is a no-op. Result is sorted. */
export function toggleLine(
  selected: readonly number[],
  line: number,
  max: number = MAX_LOCATE_LINES,
): number[] {
  if (selected.includes(line)) return selected.filter((l) => l !== line);
  if (selected.length >= max) return [...selected];
  return [...selected, line].sort((a, b) => a - b);
}

/** A location needs 1..max lines and a reason (only a skip may have none). */
export function canSubmitLocation(selected: readonly number[], reason: string): boolean {
  const text = reason.trim();
  return (
    selected.length >= 1 &&
    selected.length <= MAX_LOCATE_LINES &&
    text.length > 0 &&
    reason.length <= MAX_REASON_CHARS
  );
}

/** The hint the next click buys, or `null` when both are used. */
export function nextHintStep(hintsUsed: number): 1 | 2 | null {
  if (hintsUsed <= 0) return 1;
  if (hintsUsed === 1) return 2;
  return null;
}

/** A debug attempt can be resumed after a reload only while it is still open. */
export function canResumeAttempt(state: AttemptState, exerciseCode: string): boolean {
  return (
    state.status === "in_progress" &&
    state.exercise_code.toUpperCase() === exerciseCode.toUpperCase()
  );
}

/**
 * Reveal marks per line: "hit" = a bug line the student selected, "missed" = a
 * bug line not selected, "extra" = a selected line outside every region.
 */
export type RevealMark = "hit" | "missed" | "extra";

export function revealMarks(reveal: DebugReveal): Map<number, RevealMark> {
  const bugLines = new Set(reveal.regions.flat());
  const selected = new Set(reveal.skipped ? [] : reveal.selected);
  const marks = new Map<number, RevealMark>();
  bugLines.forEach((line) => marks.set(line, selected.has(line) ? "hit" : "missed"));
  selected.forEach((line) => {
    if (!bugLines.has(line)) marks.set(line, "extra");
  });
  return marks;
}

/** How many regions the selection touched, for the summary line. */
export function regionsHit(reveal: DebugReveal): number {
  return reveal.skipped ? 0 : reveal.hit.filter(Boolean).length;
}

/** False when a revealed line falls outside the starter (the code shown would not match). */
export function revealFitsStarter(reveal: DebugReveal, lineCount: number): boolean {
  return [...reveal.regions.flat(), ...reveal.selected].every((l) => l >= 1 && l <= lineCount);
}

// ── Resume after a reload ───────────────────────────────────────────────────
// The workspace creates a new attempt on every mount. On debug exercises that
// would drop the located step and the bought hints, so the open attempt id is
// kept per tab and reused while the backend still reports it in progress.

export type ResumeStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type ResumeEntry = {
  attemptId: number;
  /** Last snapshot version saved, so a resumed session keeps counting up. */
  snapshotVersion: number;
};

const resumeKey = (exerciseCode: string) => `codeprove_debug_attempt_${exerciseCode.toUpperCase()}`;

function isResumeEntry(value: unknown): value is ResumeEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Number.isInteger(v.attemptId) &&
    (v.attemptId as number) > 0 &&
    Number.isInteger(v.snapshotVersion) &&
    (v.snapshotVersion as number) >= 0
  );
}

export function readResume(store: ResumeStore | null, exerciseCode: string): ResumeEntry | null {
  if (!store) return null;
  try {
    const raw = store.getItem(resumeKey(exerciseCode));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isResumeEntry(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeResume(store: ResumeStore | null, exerciseCode: string, entry: ResumeEntry): void {
  if (!store) return;
  try {
    store.setItem(resumeKey(exerciseCode), JSON.stringify(entry));
  } catch {
    // Storage full or blocked: the step still works, only a reload loses it.
  }
}

export function clearResume(store: ResumeStore | null, exerciseCode: string): void {
  if (!store) return;
  try {
    store.removeItem(resumeKey(exerciseCode));
  } catch {
    // Blocked storage: nothing was kept either.
  }
}
