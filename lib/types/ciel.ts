/**
 * Ciel mentor request body for `POST /attempts/:id/mentor`.
 * The UI always sends the current editor code alongside the message.
 * No `history` / `sessionId` is sent - the backend owns conversation context.
 */
export type MentorRequest = {
  /** 1-4000 chars; a longer message gets a 422 before any LLM call. */
  message: string;
  code?: string;
};

/** Ciel messages left on this attempt and today (P3.6). Never the configured caps. */
export type CielQuota = {
  attempt_left: number;
  day_left: number;
};

/** Ciel mentor response. The verify-your-work hint is shown on every reply that contains code. */
export type MentorReply = {
  reply: string;
  /** Absent on backends without P3.6. */
  ciel?: CielQuota;
};
