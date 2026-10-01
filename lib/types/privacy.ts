/** `GET /api/me/privacy`; consent and PATCH return the same shape (P3.7). */
export type PrivacyState = {
  /** Accepted the current policy version. */
  consented: boolean;
  /** The version they accepted, if any. */
  version: string | null;
  current_version: string;
  ai_personalization: boolean;
};
