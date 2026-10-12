import { ApiError } from "@/lib/api/client";
import type { BillingMe, PaidTier, PlanCode, Tier } from "@/lib/types/billing";

export type BillingPeriod = "monthly" | "annual";

/** The payment pages ask the backend this often; the result page gives up after this many tries. */
export const POLL_INTERVAL_MS = 3000;
export const POLL_MAX_TRIES = 20;

/** The plan code the backend sells for a pricing-card tier and the billing toggle. */
export function planCodeFor(tier: PaidTier, period: BillingPeriod): PlanCode {
  return `${tier}_${period === "annual" ? "yearly" : "monthly"}` as PlanCode;
}

/**
 * What a paid card's button does for this student: `buy` (free or signed out), `renew` (same plan running:
 * the backend adds the days), `locked` (another plan is running: it must end first).
 */
export type CtaState = "buy" | "renew" | "locked";

export function ctaState(cardTier: PaidTier, me: Pick<BillingMe, "tier"> | null | undefined): CtaState {
  const current: Tier = me?.tier ?? "free";
  if (current === "free") return "buy";
  return current === cardTier ? "renew" : "locked";
}

/** The backend's own message (vi/en) for a checkout error, or `fallback` when there is none. */
export function checkoutErrorMessage(err: unknown, locale: "vi" | "en", fallback: string): string {
  if (err instanceof ApiError && err.detail && typeof err.detail === "object" && !Array.isArray(err.detail)) {
    const detail = err.detail as Record<string, unknown>;
    const message = locale === "vi" ? detail.message_vi : detail.message_en;
    if (typeof message === "string" && message) return message;
  }
  return fallback;
}

/**
 * Where an order stands, from `GET /billing/me`, for the payment and result pages.
 * `pending` = keep asking; `paid` = plan active; `unapplied` = paid but another plan was running;
 * `closed` = cancelled, expired or failed; `unknown` = no such order for this student.
 */
export type OrderOutcome = "paid" | "pending" | "unapplied" | "closed" | "unknown";

export function orderOutcome(me: Pick<BillingMe, "orders">, orderId: number): OrderOutcome {
  const order = me.orders.find((o) => o.id === orderId);
  if (!order) return "unknown";
  switch (order.status) {
    case "paid":
    case "refunded":
      return "paid";
    case "paid_unapplied":
      return "unapplied";
    case "pending":
      return "pending";
    default:
      return "closed";
  }
}

/** `99000` -> "99.000đ" (VND is the only currency the backend charges). */
export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}

export function formatDate(iso: string, locale: "vi" | "en"): string {
  return new Date(iso).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
