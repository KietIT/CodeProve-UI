import { apiFetch } from "./client";
import type { TraceResponse } from "@/lib/types/trace";

export type TraceInput = {
  source_code: string;
  /** Trace the code against this exercise's first visible test-case input. */
  exercise_code?: string;
  /** Explicit invocation expression; overrides exercise_code lookup. */
  call?: string;
};

/**
 * Trace the student's code for the algorithm visualizer.
 * Real endpoint: POST /api/practice/trace (backend runs it with sys.settrace and
 * derives the sample input from the exercise's first visible test case).
 *
 * Set NEXT_PUBLIC_MOCK_TRACE=1 to return a bundled sample trace instead (only
 * useful before the endpoint exists - it ignores the actual code/exercise).
 */
export const traceCode = async (input: TraceInput): Promise<TraceResponse> => {
  if (process.env.NEXT_PUBLIC_MOCK_TRACE === "1") {
    const { twoSumTrace } = await import("@/mocks/traceSample");
    return twoSumTrace;
  }
  return apiFetch<TraceResponse>("/practice/trace", { method: "POST", body: input });
};
