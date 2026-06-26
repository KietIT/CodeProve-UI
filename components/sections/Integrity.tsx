"use client";

import { Eye, MessagesSquare, ShieldCheck } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useI18n } from "@/lib/i18n";

const cardIcons = [MessagesSquare, Eye, ShieldCheck];

const toneStyles: Record<string, string> = {
  green: "bg-[#28c840]",
  yellow: "bg-[#febc2e]",
  red: "bg-[#ff5f57]",
};

export function Integrity() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {t.integrity.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {t.integrity.body}
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 md:grid-cols-3">
          {t.integrity.cards.map((c, i) => {
            const Icon = cardIcons[i];
            return (
              <StaggerItem key={c.title}>
                <div className="glass-card h-full p-6 transition-colors duration-200 hover:border-teal/40">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-teal/12 text-teal">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold text-content">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Integrity Score levels */}
        <Reveal className="mt-6">
          <div className="glass-card grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            {t.integrity.levels.map((lvl) => (
              <div key={lvl.tone} className="flex items-start gap-3">
                <span
                  className={`mt-1 inline-block h-3 w-3 shrink-0 rounded-full ${toneStyles[lvl.tone]}`}
                />
                <div>
                  <div className="text-sm font-semibold text-content">{lvl.label}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{lvl.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm italic leading-relaxed text-muted/80">{t.integrity.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
