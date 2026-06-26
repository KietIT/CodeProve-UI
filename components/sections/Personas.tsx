"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Briefcase, Check, GraduationCap, Users } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n";

const icons = [GraduationCap, Users, Briefcase];

export function Personas() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const tab = t.personas.tabs[active];

  return (
    <section id="personas" className="relative overflow-hidden scroll-mt-24 py-20 sm:py-28">
      <div className="section-aura -top-16 left-[-8%] h-[460px] w-[600px]" aria-hidden="true" />
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t.personas.title}
          </h2>
        </Reveal>

        {/* Tab bar */}
        <Reveal className="mt-10">
          <div className="inline-flex flex-wrap gap-1 rounded-pill border border-border bg-surface/50 p-1">
            {t.personas.tabs.map((p, i) => {
              const Icon = icons[i];
              return (
                <button
                  key={p.key}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    active === i
                      ? "bg-teal text-[#04211e]"
                      : "text-muted hover:text-content"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Panel */}
        <div className="mt-8 min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card grid gap-8 p-8 lg:grid-cols-2 lg:p-10"
            >
              <div>
                <h3 className="text-balance text-2xl font-semibold leading-snug tracking-tight sm:text-[1.7rem]">
                  {tab.headline}
                </h3>
                <Button href={tab.href} className="mt-7">
                  {tab.cta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              <ul className="space-y-4 lg:border-l lg:border-border lg:pl-8">
                {tab.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/15">
                      <Check className="h-4 w-4 text-teal" />
                    </span>
                    <span className="text-sm leading-relaxed text-content">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
