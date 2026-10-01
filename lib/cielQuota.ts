import type { CielQuota } from "@/lib/types/ciel";

/** Input caps mirrored from the backend validators (P3.6). */
export const CIEL_MESSAGE_MAX = 4000;
export const HYPOTHESIS_MAX = 2000;

/** Show "N messages left" from this many down. */
export const CIEL_LOW_THRESHOLD = 10;

/** Wait used when a `rate_limited` 429 comes without `Retry-After`. */
export const DEFAULT_RETRY_AFTER_SECONDS = 30;

/** Messages the student can still send: the tighter of the two quotas, `null` when unknown. */
export function cielRemaining(quota: CielQuota | null | undefined): number | null {
  if (!quota) return null;
  const left = Math.min(quota.attempt_left, quota.day_left);
  return Number.isFinite(left) ? Math.max(0, left) : null;
}

/** True when the remaining count should be shown (known and at most the threshold). */
export function showRemaining(remaining: number | null): remaining is number {
  return remaining !== null && remaining <= CIEL_LOW_THRESHOLD;
}

/** True when the text is within 10% of its cap, so the counter is shown. */
export function nearCap(length: number, cap: number): boolean {
  return length >= cap * 0.9;
}
