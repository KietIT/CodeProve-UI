export type Payment = {
  id: number;
  received_at: string;
  amount: number | null;
  bank: string | null;
  transfer_content: string | null;
  provider_txn_id: number | null;
  order_id: number;
  order_status: string;
  plan_code: string;
  user_id: number;
  user_name: string;
  user_email: string;
};

export type PaymentPage = { items: Payment[]; total: number; limit: number; offset: number };

export type PaymentSummary = {
  days: number;
  revenue: number;
  paid_orders: number;
  average_order: number;
  transfers_received: number;
  by_day: { date: string; revenue: number; orders: number }[];
  by_plan: { plan_code: string; revenue: number; orders: number }[];
  by_status: { status: string; orders: number }[];
};

export function formatDateTime(value: string, locale: "vi" | "en") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

/** 1 500 000 -> "1.5M", 99 000 -> "99K": short labels for chart axes. */
export function compactVnd(amount: number) {
  if (amount >= 1_000_000) return `${+(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return String(amount);
}
