"use client";

import { Compass, Layers, Users } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

const icons = [Compass, Layers, Users];

export function About() {
  const { t } = useI18n();
  const a = t.about;

  return (
    <section
      id="about"
      className="relative overflow-hidden scroll-mt-24 py-20 sm:py-28"
    >
      <div
        className="section-aura -top-16 right-[-6%] h-[440px] w-[560px]"
        aria-hidden="true"
      />
      <div className="container-site">
        <Reveal className="max-w-3xl">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {a.title}
          </h2>
          <p className="mt-5 text-balance text-lg leading-relaxed text-content/90 sm:text-xl">
            {a.lead}
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {a.body}
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {a.pillars.map((p, i) => {
            const Icon = icons[i];
            return (
              <StaggerItem key={i}>
                <div className="glass-card h-full p-6 transition-colors duration-200 hover:border-teal/40">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-teal/12 text-teal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-content">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
