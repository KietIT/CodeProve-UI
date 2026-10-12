"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CreditCard } from "lucide-react";
import { formatVnd } from "@/lib/billing";
import { billingContent } from "@/lib/billingContent";
import { adminRequest } from "../_auth";
import { useAdminCopy } from "../_copy";
import { card, field, primaryButton, secondaryButton } from "../_ui";
import { formatAdminDate, type LearnerBilling } from "./_api";

function message(error: unknown): string { return error instanceof Error ? error.message : "Request failed"; }

/** A learner's plan and orders, with the form that gives or ends a plan by hand (every change is audited). */
export function LearnerBillingCard({ userId }: { userId: number }) {
  const { locale, t } = useAdminCopy();
  const b = t.billing;
  const statuses: Record<string, string> = billingContent[locale].profile.status;
  const [billing, setBilling] = useState<LearnerBilling | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tier, setTier] = useState<"plus" | "pro">("plus");
  const [days, setDays] = useState("30");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setBilling(await adminRequest<LearnerBilling>(`/admin/users/${userId}/billing`));
  }, [userId]);

  useEffect(() => {
    load().catch((cause: unknown) => setError(message(cause)));
  }, [load]);

  async function change(path: string, body: Record<string, unknown>, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setBusy(true); setError("");
    try {
      setBilling(await adminRequest<LearnerBilling>(path, { method: "POST", body }));
      setReason("");
    } catch (cause) { setError(message(cause)); }
    finally { setBusy(false); }
  }

  function grant(event: FormEvent) {
    event.preventDefault();
    void change(`/admin/users/${userId}/subscription`, { tier, days: Number(days), reason: reason.trim() },
      b.grantConfirm(b.tiers[tier], Number(days)));
  }

  const validDays = /^\d+$/.test(days) && Number(days) >= 1 && Number(days) <= 366;
  const validReason = reason.trim().length >= 3;
  const paid = billing !== null && billing.tier !== "free";

  return <section className={`${card} mt-5 p-6`}>
    <h2 className="flex items-center gap-2 text-lg font-bold"><CreditCard size={19} className="text-primary" />{b.title}</h2>
    <p className="mt-1 text-sm text-on-surface-variant">{b.description}</p>
    {error && <p role="alert" className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>}
    {billing === null && !error && <p className="mt-4 text-sm text-on-surface-variant">{t.loading}</p>}
    {billing && <>
      <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-2">
        <div><p className="text-xs text-on-surface-variant">{b.current}</p><p className="mt-1 text-2xl font-bold">{b.tiers[billing.tier]}</p></div>
        <div><p className="text-xs text-on-surface-variant">{b.expires}</p><p className="mt-1 font-medium">{paid ? `${formatAdminDate(billing.expires_at, locale)} · ${b.daysLeft(billing.days_left)}` : "—"}</p></div>
      </div>

      <form onSubmit={grant} className="mt-6 grid gap-3 rounded-xl bg-surface-container-low p-4 sm:grid-cols-[140px_120px_1fr] sm:items-end">
        <label className="text-xs font-semibold">{b.tier}<select className={`${field} mt-1`} value={tier} onChange={(event) => setTier(event.target.value as "plus" | "pro")}><option value="plus">Plus</option><option value="pro">Pro</option></select></label>
        <label className="text-xs font-semibold">{b.days}<input className={`${field} mt-1`} inputMode="numeric" value={days} maxLength={3} onChange={(event) => setDays(event.target.value)} /></label>
        <label className="text-xs font-semibold">{b.reason}<input className={`${field} mt-1`} value={reason} maxLength={200} placeholder={b.reasonPlaceholder} onChange={(event) => setReason(event.target.value)} /></label>
        <p className="text-xs text-on-surface-variant sm:col-span-3">{b.grantHelp}</p>
        <div className="flex flex-wrap gap-2 sm:col-span-3">
          <button type="submit" disabled={busy || !validDays || !validReason} className={primaryButton}>{b.grant}</button>
          <button type="button" disabled={busy || !paid || !validReason} className={secondaryButton}
            onClick={() => void change(`/admin/users/${userId}/subscription/revoke`, { reason: reason.trim() }, b.revokeConfirm)}>{b.revoke}</button>
        </div>
      </form>

      <h3 className="mt-6 text-sm font-bold">{b.orders}</h3>
      {billing.orders.length === 0 ? <p className="mt-2 text-sm text-on-surface-variant">{b.noOrders}</p>
        : <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-xs uppercase text-on-surface-variant"><tr><th className="py-2 pr-4 font-semibold">#</th><th className="py-2 pr-4 font-semibold">{b.plan}</th><th className="py-2 pr-4 font-semibold">{b.amount}</th><th className="py-2 pr-4 font-semibold">{b.created}</th><th className="py-2 font-semibold">{b.status}</th></tr></thead><tbody className="divide-y divide-outline-variant/50">{billing.orders.map((order) => <tr key={order.id}><td className="py-2.5 pr-4 tabular-nums text-on-surface-variant">{order.id}</td><td className="py-2.5 pr-4">{order.plan_code.replace("_", " · ")}</td><td className="py-2.5 pr-4 tabular-nums">{formatVnd(order.amount)}</td><td className="py-2.5 pr-4 text-on-surface-variant">{formatAdminDate(order.created_at, locale)}</td><td className="py-2.5">{statuses[order.status] ?? order.status}</td></tr>)}</tbody></table></div>}
    </>}
  </section>;
}
