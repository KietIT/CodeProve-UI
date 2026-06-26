"use client";

import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

export function Problem() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="section-aura -top-24 right-[-6%] h-[440px] w-[560px]" aria-hidden="true" />
      <div className="container-site">
        <Reveal>
          <h2 className="mt-5 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.7rem]">
            {t.problem.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {t.problem.body}
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-3">
          {t.problem.stats.map((s) => (
            <StaggerItem key={s.label}>
              <div className="glass-card h-full p-6 transition-colors duration-200 hover:border-teal/40">
                <div className="text-gradient font-mono text-4xl font-bold sm:text-5xl">
                  {s.value}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
