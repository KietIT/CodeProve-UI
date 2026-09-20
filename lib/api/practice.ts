import { apiFetch } from "./client";
import type { TraceResponse } from "@/lib/types/trace";

/**
 * Trace the student's code for the practice-mode visualizer.
 * Real endpoint: POST /api/practice/trace (backend runs it with sys.settrace).
 *
 * While the backend endpoint is being built, set NEXT_PUBLIC_MOCK_TRACE=1 to
 * return a bundled sample trace instead of hitting the network, so the UI can
 * be developed and demoed. This is a temporary stand-in for the MSW handler in
 * the design doc; remove the flag once the endpoint is live.
 */
export const traceCode = async (source_code: string): Promise<TraceResponse> => {
  if (process.env.NEXT_PUBLIC_MOCK_TRACE === "1") {
    const { twoSumTrace } = await import("@/mocks/traceSample");
    return twoSumTrace;
  }
  return apiFetch<TraceResponse>("/practice/trace", {
    method: "POST",
    body: { source_code },
  });
};
