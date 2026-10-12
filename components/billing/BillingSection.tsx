"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sym } from "@/components/app/AppChrome";
import { cancelOrder, getBillingMe } from "@/lib/api";
import { formatDate, formatVnd } from "@/lib/billing";
import { billingContent } from "@/lib/billingContent";
import { useI18n } from "@/lib/i18n";

/** Profile panel: the student's plan, what it allows, and their orders. */
export function BillingSection() {
  const { locale } = useI18n();
  const t = billingContent[locale].profile;
  const queryClient = useQueryClient();
  const { data: me, isLoading, isError } = useQuery({ queryKey: ["billing", "me"], queryFn: getBillingMe });
  const cancel = useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["billing", "me"] }),
  });

  return (
    <div className="ice-card space-y-6 p-6">
      <h2 className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
        <Sym name="workspace_premium" className="text-[18px]" /> {t.title}
      </h2>

      {isLoading && (
        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Sym name="progress_activity" className="animate-spin text-[18px] text-primary" /> {t.loading}
        </p>
      )}
      {isError && <p className="text-sm text-error">{t.failed}</p>}

      {me && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-on-surface-variant">{t.plan}</p>
              <p className="mt-1 text-2xl font-bold">{t.tiers[me.tier]}</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {me.expires_at
                  ? `${t.expires}: ${formatDate(me.expires_at, locale)} · ${t.daysLeft(me.days_left)}`
                  : t.noExpiry}
              </p>
            </div>
            <Link
              href="/pricing"
              className="rounded-xl border border-primary px-5 py-2.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
            >
              {me.tier === "free" ? t.upgrade : t.renew}
            </Link>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">{t.benefits}</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Sym name="check" className="text-[16px] text-primary" /> {t.cielPerDay(me.entitlements.ciel_per_day)}
              </li>
              <li className="flex items-center gap-2">
                <Sym name="check" className="text-[16px] text-primary" />
                {me.entitlements.monthly_submits === null
                  ? t.submitsUnlimited
                  : t.submitsLimited(me.entitlements.monthly_submits)}
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-variant">{t.orders}</p>
            {cancel.isError && <p className="mt-2 text-sm text-error">{t.cancelFailed}</p>}
            {me.orders.length === 0 ? (
              <p className="mt-2 text-sm text-on-surface-variant">{t.noOrders}</p>
            ) : (
              <ul className="mt-2 divide-y divide-outline-variant/40 text-sm">
                {me.orders.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span className="font-medium">{o.plan_code.replace("_", " · ")}</span>
                    <span className="text-on-surface-variant">{formatVnd(o.amount)}</span>
                    <span className="text-on-surface-variant">{formatDate(o.created_at, locale)}</span>
                    <span className="rounded-pill border border-outline-variant/60 px-2.5 py-0.5 text-xs">
                      {t.status[o.status] ?? o.status}
                    </span>
                    {o.status === "pending" && (
                      <button
                        type="button"
                        disabled={cancel.isPending}
                        onClick={() => cancel.mutate(o.id)}
                        className="text-xs text-error underline disabled:opacity-50"
                      >
                        {t.cancelOrder}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
