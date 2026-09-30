// Pure helpers for the in-workspace visualizer. No React and only type
// imports, so node:test can load this file.
import type { TraceInput } from "@/lib/api";

/**
 * The code the visualizer traces. While the editor is locked (the locate step
 * of a debug exercise) that is the starter as served, whose line numbers are
 * the ones the student is selecting; afterwards it is the editor's code.
 */
export function visualizerSource(locked: boolean, servedStarter: string, editorCode: string): string {
  return locked ? servedStarter : editorCode;
}

/**
 * The trace request. A non-blank `call` (e.g. `two_sum([3, 3], 6)`) is sent as
 * is; otherwise the backend uses the exercise's first visible test input.
 */
export function buildTraceInput(sourceCode: string, exerciseCode: string, call: string): TraceInput {
  const expression = call.trim();
  return expression
    ? { source_code: sourceCode, call: expression }
    : { source_code: sourceCode, exercise_code: exerciseCode };
}

/** A call template from the first top-level function, e.g. `two_sum(…)`; "" if none. */
export function callPlaceholder(sourceCode: string): string {
  const match = /^def\s+([A-Za-z_]\w*)\s*\(/m.exec(sourceCode);
  return match ? `${match[1]}(…)` : "";
}
