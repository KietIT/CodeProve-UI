export type AskCielInput = { message: string; code?: string };

/** Reason a Ciel ask was blocked client-side before any network call. */
export type CielGuardReason = "empty" | "no-attempt";

export class CielGuardError extends Error {
  readonly reason: CielGuardReason;
  constructor(reason: CielGuardReason) {
    super(reason === "empty" ? "Message is empty" : "No active attempt");
    this.name = "CielGuardError";
    this.reason = reason;
    // Keep instanceof reliable even when down-levelled below ES2015.
    Object.setPrototypeOf(this, CielGuardError.prototype);
  }
}

/**
 * Pure guard mirroring the existing Workspace behaviour: trim the message,
 * block empty prompts, and require an attempt id - all BEFORE hitting the
 * network. No React or service imports, so it is unit-testable in isolation.
 */
export function prepareMentorRequest(
  attemptId: number | null,
  input: AskCielInput,
): { id: number; message: string; code?: string } {
  const message = input.message.trim();
  if (!message) throw new CielGuardError("empty");
  if (attemptId == null) throw new CielGuardError("no-attempt");
  return { id: attemptId, message, code: input.code };
}
