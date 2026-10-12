export type Tier = "free" | "plus" | "pro";
export type PaidTier = Exclude<Tier, "free">;
export type PlanCode = "plus_monthly" | "plus_yearly" | "pro_monthly" | "pro_yearly";

/** One buyable plan from `GET /api/billing/plans` (prices are VND, owned by the backend). */
export type Plan = {
  code: PlanCode;
  tier: PaidTier;
  period: "monthly" | "yearly";
  amount: number;
  days: number;
};

/** What the signed-in student's plan allows (`monthly_submits` null = unlimited). */
export type Entitlements = {
  tier: Tier;
  ciel_per_day: number;
  monthly_submits: number | null;
  detailed_analysis: boolean;
  learning_path: boolean;
};

/** `paid_unapplied`: paid while a different plan was running; support resolves it. */
export type OrderStatus = "pending" | "paid" | "cancelled" | "expired" | "failed" | "paid_unapplied" | "refunded";

export type BillingOrder = {
  id: number;
  plan_code: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
  paid_at: string | null;
};

/** `GET /api/billing/me`. */
export type BillingMe = {
  tier: Tier;
  expires_at: string | null;
  days_left: number;
  entitlements: Entitlements;
  orders: BillingOrder[];
};

/**
 * How to pay an order by bank transfer (`POST /api/billing/checkout`, `GET /api/billing/orders/{id}/payment`).
 * The transfer must carry exactly `amount` and `payment_code` as its content; `qr_url` is a VietQR image with both.
 */
export type OrderPayment = {
  order_id: number;
  status: OrderStatus;
  plan_code: string;
  amount: number;
  payment_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  qr_url: string;
  expires_at: string;
};
