import { apiFetch } from "./client";
import { getGaIds } from "@/lib/analytics";
import type { BillingMe, BillingOrder, OrderPayment, Plan, PlanCode } from "@/lib/types/billing";

/** Public price list. */
export const getPlans = (): Promise<Plan[]> => apiFetch<Plan[]>("/billing/plans", { auth: false });

/** The signed-in student's plan, expiry, limits and orders. */
export const getBillingMe = (): Promise<BillingMe> => apiFetch<BillingMe>("/billing/me");

/**
 * Opens an order and returns how to pay it. Only the plan code is sent (the backend owns the
 * price), plus the browser's GA ids when available so the server-side `purchase` keeps its channel.
 */
export const startCheckout = async (planCode: PlanCode): Promise<OrderPayment> =>
  apiFetch<OrderPayment>("/billing/checkout", {
    method: "POST",
    body: { plan_code: planCode, ...(await getGaIds()) },
  });

/** The transfer details of one of the student's orders. */
export const getOrderPayment = (orderId: number): Promise<OrderPayment> =>
  apiFetch<OrderPayment>(`/billing/orders/${orderId}/payment`);

/** Cancels an order that is still waiting for payment. */
export const cancelOrder = (orderId: number): Promise<BillingOrder> =>
  apiFetch<BillingOrder>(`/billing/orders/${orderId}/cancel`, { method: "POST" });
