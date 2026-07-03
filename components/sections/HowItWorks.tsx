"use client";

import { Terminal, Activity, BarChart3 } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

const stepIcons = [Terminal, Activity, BarChart3];

export function HowItWorks() {
  const { t } = useI18n();
  const h = t.howItWorks;

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {h.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {h.sub}
          </p>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {h.steps.map((step, i) => {
            const Icon = stepIcons[i];
            return (
              <StaggerItem key={step.title}>
                <div className="glass-card h-full p-6 transition-colors duration-200 hover:border-teal/40">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-teal/12 text-teal">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-content">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
