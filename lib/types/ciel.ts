/**
 * Ciel mentor request body for `POST /attempts/:id/mentor`.
 * The UI always sends the current editor code alongside the message.
 * No `history` / `sessionId` is sent - the backend owns conversation context.
 */
export type MentorRequest = {
  message: string;
  code?: string;
};

/** Ciel mentor response. `injected_error` drives the verify-your-work hint. */
export type MentorReply = {
  reply: string;
  injected_error: boolean;
};
