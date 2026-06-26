"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { HeroPoster } from "@/components/three/HeroPoster";
import { useI18n } from "@/lib/i18n";

export function FinalCTA() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-site">
        <Reveal>
          <div className="relative overflow-hidden rounded-card border border-border bg-bg-soft px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(62,212,197,0.22), rgba(108,99,255,0.10) 55%, transparent 80%)",
              }}
              aria-hidden="true"
            />

            <div className="relative mx-auto mb-8 w-40 opacity-90">
              <HeroPoster />
            </div>

            <h2 className="mx-auto mt-5 max-w-2xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.6rem]">
              {t.finalCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {t.finalCta.sub}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/signup" size="lg">
                {t.finalCta.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/universities" variant="secondary" size="lg">
                {t.finalCta.ctaSecondary}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
