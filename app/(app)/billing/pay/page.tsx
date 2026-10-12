"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sym } from "@/components/app/AppChrome";
import { cancelOrder, getBillingMe, getOrderPayment } from "@/lib/api";
import { POLL_INTERVAL_MS, formatVnd, orderOutcome } from "@/lib/billing";
import { billingContent } from "@/lib/billingContent";
import { useI18n } from "@/lib/i18n";

/** One line of the transfer details with a copy button. */
function Detail({ label, value, copy, copied }: { label: string; value: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch {
      // clipboard blocked: the value is on screen to copy by hand
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0 text-left">
        <p className="text-xs uppercase tracking-wider text-on-surface-variant">{label}</p>
        <p className="mt-0.5 break-all font-semibold">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => void onCopy()}
        className="shrink-0 rounded-lg border border-outline-variant/60 px-3 py-1.5 text-xs text-on-surface-variant transition-colors hover:text-on-surface"
      >
        {done ? copied : copy}
      </button>
    </div>
  );
}

/**
 * The bank-transfer page of one order: QR, account, amount and content. Nothing here proves a payment; the page
 * keeps asking the backend about the order until the payment provider's webhook has marked it paid.
 */
function PayContent() {
  const { locale } = useI18n();
  const c = billingContent[locale].pay;
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = Number(useSearchParams().get("order"));
  const validId = Number.isInteger(orderId) && orderId > 0;
  const [cancelling, setCancelling] = useState(false);

  const payment = useQuery({
    queryKey: ["billing", "payment", orderId],
    queryFn: () => getOrderPayment(orderId),
    enabled: validId,
    retry: false,
  });
  const status = payment.data?.status;

  useEffect(() => {
    if (!validId || status !== "pending") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      try {
        const me = await getBillingMe();
        if (cancelled) return;
        const outcome = orderOutcome(me, orderId);
        if (outcome === "paid" || outcome === "unapplied") {
          queryClient.setQueryData(["billing", "me"], me);
          router.replace(`/billing/success?order=${orderId}`);
          return;
        }
        if (outcome !== "pending") {
          // expired or cancelled elsewhere: reload the order so the page shows it as closed
          void queryClient.invalidateQueries({ queryKey: ["billing", "payment", orderId] });
          return;
        }
      } catch {
        // a failed poll is retried like a pending one
      }
      if (!cancelled) timer = setTimeout(() => void tick(), POLL_INTERVAL_MS);
    }

    timer = setTimeout(() => void tick(), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, validId, status, queryClient, router]);

  async function onCancel() {
    setCancelling(true);
    try {
      await cancelOrder(orderId);
    } catch {
      // already paid or closed: the next page shows where the order stands
    }
    void queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
    router.replace("/billing/cancel");
  }

  if (!validId || payment.isError) {
    return (
      <Shell>
        <Sym name="help" className="text-[56px] text-on-surface-variant" />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">{c.notFoundTitle}</h1>
        <p className="text-on-surface-variant">{c.notFoundBody}</p>
        <PricingLink label={c.toPricing} />
      </Shell>
    );
  }
  if (!payment.data) {
    return (
      <Shell>
        <Sym name="progress_activity" className="animate-spin text-[40px] text-primary" />
        <p className="text-on-surface-variant">{c.loading}</p>
      </Shell>
    );
  }
  const p = payment.data;
  if (p.status === "paid" || p.status === "paid_unapplied" || p.status === "refunded") {
    return (
      <Shell>
        <Sym name="check_circle" className="text-[56px] text-primary" />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">{c.paidTitle}</h1>
        <Link
          href={`/billing/success?order=${orderId}`}
          className="rounded-xl border border-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
        >
          {c.toResult}
        </Link>
      </Shell>
    );
  }
  if (p.status !== "pending") {
    return (
      <Shell>
        <Sym name="cancel" className="text-[56px] text-error" />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">{c.closedTitle}</h1>
        <p className="text-on-surface-variant">{c.closedBody}</p>
        <PricingLink label={c.toPricing} />
      </Shell>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 md:px-8">
      <div className="ice-card p-6 md:p-8">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">{c.title}</h1>
        <p className="mt-2 text-on-surface-variant">{c.intro}</p>

        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,260px)_1fr]">
          <div className="flex flex-col items-center gap-3">
            {/* A VietQR image from the payment provider: account, amount and content are already filled in. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.qr_url} alt={c.qrAlt} width={260} height={260} className="rounded-xl bg-white p-2" />
            <p className="flex items-center gap-2 text-sm text-on-surface-variant" role="status">
              <Sym name="progress_activity" className="animate-spin text-[18px] text-primary" /> {c.waiting}
            </p>
          </div>

          <div className="divide-y divide-outline-variant/40">
            <Detail label={c.bank} value={p.bank_name} copy={c.copy} copied={c.copied} />
            {p.account_name && <Detail label={c.accountName} value={p.account_name} copy={c.copy} copied={c.copied} />}
            <Detail label={c.accountNumber} value={p.account_number} copy={c.copy} copied={c.copied} />
            <Detail label={c.amount} value={formatVnd(p.amount)} copy={c.copy} copied={c.copied} />
            <Detail label={c.content} value={p.payment_code} copy={c.copy} copied={c.copied} />
          </div>
        </div>

        <p className="mt-6 rounded-xl border border-outline-variant/60 p-4 text-sm text-on-surface-variant">
          {c.note(formatVnd(p.amount), p.payment_code)}
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={cancelling}
            onClick={() => void onCancel()}
            className="rounded-xl border border-outline-variant/60 px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
          >
            {c.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-16 text-center md:px-8">
      <div className="ice-card flex w-full flex-col items-center gap-5 p-10">{children}</div>
    </div>
  );
}

function PricingLink({ label }: { label: string }) {
  return (
    <Link
      href="/pricing"
      className="rounded-xl border border-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
    >
      {label}
    </Link>
  );
}

export default function BillingPayPage() {
  return (
    <Suspense fallback={null}>
      <PayContent />
    </Suspense>
  );
}
