"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Star } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ComingSoonBadge } from "@/components/ui/ComingSoonBadge";
import { getBillingMe, getPlans, startCheckout } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { billingContent } from "@/lib/billingContent";
import { checkoutErrorMessage, ctaState, formatVnd, planCodeFor } from "@/lib/billing";
import { rememberReturn } from "@/lib/authReturn";
import { isComingSoon } from "@/lib/comingSoon";
import { useI18n } from "@/lib/i18n";
import type { PaidTier } from "@/lib/types/billing";

type Tab = "personal" | "business";
type Billing = "monthly" | "annual";

export function Pricing({ standalone = false }: { standalone?: boolean }) {
  const { t, locale } = useI18n();
  const p = t.pricing;
  const b = billingContent[locale].pricing;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("personal");
  // The toggle picks which price string is shown and which plan code a paid button buys.
  const [billing, setBilling] = useState<Billing>("monthly");

  // Real VND prices and the student's current plan come from the backend; the card texts stay in content.ts.
  const plansQuery = useQuery({ queryKey: ["billing", "plans"], queryFn: getPlans, staleTime: 5 * 60_000 });
  const meQuery = useQuery({ queryKey: ["billing", "me"], queryFn: getBillingMe, enabled: !!user });
  const [paying, setPaying] = useState<PaidTier | null>(null);
  const [payError, setPayError] = useState<{ tier: PaidTier; message: string } | null>(null);

  async function buy(tier: PaidTier) {
    // The session is still being restored: sending the student to sign up now would be wrong.
    if (authLoading) return;
    if (!user) {
      rememberReturn("/pricing");
      router.push("/signup");
      return;
    }
    if (paying) return;
    setPaying(tier);
    setPayError(null);
    try {
      const { order_id } = await startCheckout(planCodeFor(tier, billing));
      router.push(`/billing/pay?order=${order_id}`);
    } catch (err) {
      setPayError({ tier, message: checkoutErrorMessage(err, locale, b.failed) });
      setPaying(null);
    }
  }

  return (
    <section
      id="pricing"
      className={`relative overflow-hidden scroll-mt-24 ${
        standalone ? "pt-32 pb-20" : "bg-bg-soft py-20 sm:py-28"
      }`}
    >
      <div
        className="section-aura left-1/2 top-0 h-[440px] w-[720px] -translate-x-1/2"
        aria-hidden="true"
      />

      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {p.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {p.sub}
          </p>
        </Reveal>

        {/* Personal / Business toggle */}
        <Reveal className="mt-8 flex justify-center">
          <div className="inline-flex gap-1 rounded-pill border border-teal/40 bg-teal/80 p-1 dark:border-border dark:bg-surface/50">
            {(["personal", "business"] as Tab[]).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                aria-pressed={tab === key}
                className={`cursor-pointer rounded-pill px-6 py-2 text-sm font-medium transition-colors duration-200 ${
                  tab === key
                    ? "bg-teal text-white dark:text-on-primary"
                    : "text-white/80 hover:text-white dark:text-muted dark:hover:text-content"
                }`}
              >
                {p.tabs[key]}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Monthly / Annual billing toggle - only for the personal plans */}
        {tab === "personal" && (
          <Reveal className="mt-6 flex items-center justify-center gap-3">
            <div className="inline-flex gap-1 rounded-pill border border-border bg-surface/50 p-1">
              {(["monthly", "annual"] as Billing[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setBilling(key)}
                  aria-pressed={billing === key}
                  className={`cursor-pointer rounded-pill px-5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    billing === key
                      ? "bg-teal text-white dark:text-on-primary"
                      : "text-muted hover:text-content"
                  }`}
                >
                  {p.billing[key]}
                </button>
              ))}
            </div>
            <span className="inline-flex items-center rounded-pill border border-teal/40 bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
              {p.billing.save}
            </span>
          </Reveal>
        )}

        {tab === "personal" ? (
          <Stagger className="mx-auto mt-12 grid max-w-5xl items-stretch gap-5 lg:grid-cols-3">
            {p.plans.map((plan) => (
              <StaggerItem key={plan.name} className="h-full">
                <div
                  className={`relative flex h-full transform-gpu flex-col rounded-card border p-7 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:-translate-y-2 hover:shadow-glow motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                    plan.featured
                      ? "border-teal/50 bg-surface shadow-glow lg:-translate-y-3 lg:scale-[1.03] lg:hover:-translate-y-4"
                      : "border-border bg-surface/50 hover:border-teal/30"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-pill bg-teal px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white dark:text-on-primary">
                      <Star className="h-3 w-3 fill-current" /> {p.popular}
                    </span>
                  )}

                  <h3 className="text-xl font-semibold text-content">{plan.name}</h3>

                  {(() => {
                    const annual = billing === "annual";
                    const showPrice = annual ? plan.priceAnnual : plan.price;
                    const discounted = annual && plan.priceAnnual !== plan.price;
                    return (
                      <div className="mt-5">
                        <div className="flex items-baseline gap-1.5">
                          {discounted && (
                            <span className="text-lg font-medium text-muted line-through">
                              {plan.price}
                            </span>
                          )}
                          <span className="text-4xl font-bold tracking-tight text-content">
                            {showPrice}
                          </span>
                          <span className="text-sm text-muted">{plan.period}</span>
                        </div>
                        {annual && plan.annualNote && (
                          <p className="mt-1.5 text-xs text-muted">{plan.annualNote}</p>
                        )}
                      </div>
                    );
                  })()}

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-content/90"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {(() => {
                    const variant = plan.featured ? "primary" : "secondary";
                    if (plan.name !== "Plus" && plan.name !== "Pro") {
                      return (
                        <Button href={user ? "/dashboard" : "/signup"} variant={variant} className="mt-7 w-full">
                          {plan.cta}
                        </Button>
                      );
                    }
                    const tier: PaidTier = plan.name === "Plus" ? "plus" : "pro";
                    const state = ctaState(tier, user ? meQuery.data : null);
                    const code = planCodeFor(tier, billing);
                    const price = plansQuery.data?.find((x) => x.code === code);
                    const busy = paying === tier;
                    return (
                      <>
                        <Button
                          type="button"
                          onClick={() => void buy(tier)}
                          disabled={state === "locked" || paying !== null}
                          variant={variant}
                          className="mt-7 w-full"
                        >
                          {busy ? b.redirecting : state === "renew" ? b.renew : plan.cta}
                        </Button>
                        {state === "locked" && (
                          <p className="mt-2 text-center text-xs text-muted">{b.lockedNote}</p>
                        )}
                        {state === "renew" && (
                          <p className="mt-2 text-center text-xs text-teal">{b.current}</p>
                        )}
                        {price && (
                          <p className="mt-2 text-center text-xs text-muted">
                            {b.charged(formatVnd(price.amount), price.days)}
                          </p>
                        )}
                        {payError?.tier === tier && (
                          <p role="alert" className="mt-2 text-center text-xs text-red-500">
                            {payError.message}
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Reveal className="mx-auto mt-12 max-w-4xl">
            <div className="relative flex flex-col gap-8 rounded-card border border-teal/40 bg-surface p-8 shadow-glow sm:p-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-md">
                <h3 className="text-2xl font-semibold text-content">
                  {p.business.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {p.business.tagline}
                </p>
                <p className="mt-5 font-mono text-xs uppercase tracking-wider text-teal">
                  {p.business.priceNote}
                </p>
                {isComingSoon("/employers") ? (
                  <Button href="/employers" size="lg" className="mt-5" disabled>
                    {p.business.cta}
                    <ComingSoonBadge />
                  </Button>
                ) : (
                  <Button href="/employers" size="lg" className="mt-5">
                    {p.business.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <ul className="grid gap-3 lg:border-l lg:border-border lg:pl-10">
                {p.business.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2.5 text-sm text-content/90"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
