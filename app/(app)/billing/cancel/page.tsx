"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Sym } from "@/components/app/AppChrome";
import { cancelOrder } from "@/lib/api";
import { billingContent } from "@/lib/billingContent";
import { useI18n } from "@/lib/i18n";

/** Shown to the student who backed out of the payment page. */
function CancelContent() {
  const { locale } = useI18n();
  const c = billingContent[locale].cancel;
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const orderId = Number(params.get("order"));

  useEffect(() => {
    if (!Number.isInteger(orderId) || orderId <= 0) return;
    // Best effort: free the order. The backend refuses (409) when it is no longer waiting for payment.
    cancelOrder(orderId)
      .catch(() => undefined)
      .finally(() => void queryClient.invalidateQueries({ queryKey: ["billing", "me"] }));
  }, [orderId, queryClient]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-16 text-center md:px-8">
      <div className="ice-card flex w-full flex-col items-center gap-5 p-10">
        <Sym name="cancel" className="text-[56px] text-on-surface-variant" />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">{c.title}</h1>
        <p className="text-on-surface-variant">{c.body}</p>
        <Link
          href="/pricing"
          className="mt-2 rounded-xl border border-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
        >
          {c.toPricing}
        </Link>
      </div>
    </div>
  );
}

export default function BillingCancelPage() {
  return (
    <Suspense fallback={null}>
      <CancelContent />
    </Suspense>
  );
}
