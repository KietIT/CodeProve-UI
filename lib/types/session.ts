/**
 * One turn in the Ciel prompt log, mirroring the conversation entries the
 * Workspace already renders. Kept client-side only (no dedicated persist
 * endpoint yet); `verifyHint` comes from the mentor reply's `injected_error`.
 */
export type PromptLogEntry = {
  role: "user" | "assistant";
  text: string;
  verifyHint?: boolean;
  /** epoch ms; used to keep the log in chronological order. */
  ts: number;
};
