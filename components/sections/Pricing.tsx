"use client";

import { useState } from "react";
import { ArrowRight, Check, Star } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

type Tab = "personal" | "business";

export function Pricing({ standalone = false }: { standalone?: boolean }) {
  const { t } = useI18n();
  const p = t.pricing;
  const [tab, setTab] = useState<Tab>("personal");

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
                    ? "bg-teal text-white dark:text-[#04211e]"
                    : "text-white/80 hover:text-white dark:text-muted dark:hover:text-content"
                }`}
              >
                {p.tabs[key]}
              </button>
            ))}
          </div>
        </Reveal>

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
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-pill bg-teal px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-white dark:text-[#04211e]">
                      <Star className="h-3 w-3 fill-current" /> {p.popular}
                    </span>
                  )}

                  <h3 className="text-xl font-semibold text-content">{plan.name}</h3>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tracking-tight text-content">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted">{plan.period}</span>
                  </div>

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

                  <Button
                    href="/signup"
                    variant={plan.featured ? "primary" : "secondary"}
                    className="mt-7 w-full"
                  >
                    {plan.cta}
                  </Button>
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
                <Button href="/employers" size="lg" className="mt-5">
                  {p.business.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
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
