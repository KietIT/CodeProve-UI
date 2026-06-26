"use client";

import { ArrowRight, Check } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { HeroPoster } from "@/components/three/HeroPoster";
import { useI18n } from "@/lib/i18n";

type PersonaKey = "students" | "universities" | "employers";

export function PersonaPage({ personaKey }: { personaKey: PersonaKey }) {
  const { t } = useI18n();
  const page = t.pages[personaKey];
  const tab = t.personas.tabs.find((p) => p.key === personaKey)!;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">{page.eyebrow}</span>
            <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              {page.sub}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={personaKey === "students" ? "/signup" : "/signup"} size="lg">
                {tab.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/#rubric" variant="secondary" size="lg">
                {t.common.learnMore}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px]">
              <div className="hero-glow absolute inset-0 scale-110" aria-hidden="true" />
              <HeroPoster />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Value sections */}
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <Stagger className="grid gap-5 md:grid-cols-3">
            {page.sections.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="glass-card h-full p-7 transition-colors duration-200 hover:border-teal/40">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-pill bg-teal/12 font-mono text-sm font-semibold text-teal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-content">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          {/* benefit recap */}
          <Reveal className="mt-12">
            <div className="glass-card grid gap-6 p-8 sm:grid-cols-2 sm:p-10">
              <h2 className="text-2xl font-semibold leading-snug tracking-tight">
                {tab.headline}
              </h2>
              <ul className="space-y-4">
                {tab.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15">
                      <Check className="h-4 w-4 text-teal" />
                    </span>
                    <span className="text-sm leading-relaxed text-content">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
