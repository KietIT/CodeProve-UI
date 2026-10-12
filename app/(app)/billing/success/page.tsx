"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Sym } from "@/components/app/AppChrome";
import { getBillingMe } from "@/lib/api";
import { POLL_INTERVAL_MS, POLL_MAX_TRIES, orderOutcome, type OrderOutcome } from "@/lib/billing";
import { billingContent } from "@/lib/billingContent";
import { useI18n } from "@/lib/i18n";

/**
 * The result of one order. Arriving here proves nothing: only the payment webhook activates a plan, so this
 * page keeps asking the backend about the order until the webhook has been processed.
 */
function SuccessContent() {
  const { locale } = useI18n();
  const c = billingContent[locale].success;
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const orderId = Number(params.get("order"));
  const validId = Number.isInteger(orderId) && orderId > 0;

  const [outcome, setOutcome] = useState<OrderOutcome>(validId ? "pending" : "unknown");
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!validId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick(attempt: number) {
      try {
        const me = await getBillingMe();
        if (cancelled) return;
        const next = orderOutcome(me, orderId);
        setOutcome(next);
        if (next !== "pending") {
          queryClient.setQueryData(["billing", "me"], me);
          return;
        }
      } catch {
        // A failed poll is retried like a pending one; the page never shows a raw error.
      }
      if (cancelled) return;
      if (attempt + 1 >= POLL_MAX_TRIES) {
        setGaveUp(true);
        return;
      }
      timer = setTimeout(() => void tick(attempt + 1), POLL_INTERVAL_MS);
    }

    void tick(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, validId, queryClient]);

  const view = (() => {
    if (outcome === "paid") return { icon: "check_circle", tone: "text-primary", title: c.paidTitle, body: c.paidBody };
    if (outcome === "unapplied")
      return { icon: "support_agent", tone: "text-amber-500", title: c.unappliedTitle, body: c.unappliedBody };
    if (outcome === "closed") return { icon: "cancel", tone: "text-error", title: c.closedTitle, body: c.closedBody };
    if (outcome === "unknown") return { icon: "help", tone: "text-on-surface-variant", title: c.closedTitle, body: c.unknownBody };
    if (gaveUp) return { icon: "schedule", tone: "text-amber-500", title: c.slowTitle, body: c.slowBody };
    return { icon: "progress_activity", tone: "text-primary", title: c.title, body: c.checking };
  })();
  const waiting = outcome === "pending" && !gaveUp;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-16 text-center md:px-8">
      <div className="ice-card flex w-full flex-col items-center gap-5 p-10">
        <Sym name={view.icon} className={`text-[56px] ${view.tone} ${waiting ? "animate-spin" : ""}`} />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile">{view.title}</h1>
        <p className="text-on-surface-variant" role="status">
          {view.body}
        </p>
        {!waiting && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/profile?tab=billing"
              className="rounded-xl border border-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
            >
              {c.toProfile}
            </Link>
            <Link
              href={outcome === "closed" || outcome === "unknown" ? "/pricing" : "/dashboard"}
              className="rounded-xl px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {outcome === "closed" || outcome === "unknown" ? c.retry : c.toDashboard}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
