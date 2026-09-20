import { apiFetch } from "./client";
import type { MentorReply } from "@/lib/types/ciel";

/**
 * Ciel mentor call - moved verbatim from the previous flat lib/api.ts.
 * Request stays `{ message, code? }`, response stays `{ reply, injected_error }`.
 * The UI always passes the current editor code; no history/sessionId is sent.
 */
export const sendMentor = (id: number, message: string, code?: string): Promise<MentorReply> =>
  apiFetch<MentorReply>(`/attempts/${id}/mentor`, {
    method: "POST",
    body: { message, code },
  });
