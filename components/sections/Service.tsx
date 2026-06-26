"use client";

import {
  Bot,
  Boxes,
  Briefcase,
  Check,
  Eye,
  GitBranch,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { WorkspaceMockup } from "@/components/sections/WorkspacePreview";
import { useI18n } from "@/lib/i18n";

const offerIcons = [Boxes, Bot, GitBranch, Briefcase];
const integrityIcons = [MessagesSquare, Eye, ShieldCheck];

const toneStyles: Record<string, string> = {
  green: "bg-[#28c840]",
  yellow: "bg-[#febc2e]",
  red: "bg-[#ff5f57]",
};

export function Service() {
  const { t } = useI18n();
  const s = t.service;
  const w = t.workspace;
  const ig = t.integrity;

  return (
    <section
      id="service"
      className="relative overflow-hidden scroll-mt-24 bg-bg-soft py-20 sm:py-28"
    >
      <div className="container-site">
        {/* Header */}
        <Reveal className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {s.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {s.sub}
          </p>
        </Reveal>

        {/* What we offer */}
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {s.offerings.map((o, i) => {
            const Icon = offerIcons[i];
            return (
              <StaggerItem key={o.name}>
                <div
                  className={`glass-card h-full p-6 transition-colors duration-200 hover:border-teal/40 ${
                    o.soon ? "opacity-90" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-teal/12 text-teal">
                      <Icon className="h-5 w-5" />
                    </span>
                    {o.soon && (
                      <span className="rounded-pill border border-teal/40 bg-teal/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-teal">
                        {s.soonLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold text-content">{o.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{o.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {/* Assessment workspace */}
        <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h3 className="text-balance text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              {w.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {w.body}
            </p>
            <ul className="mt-7 space-y-3">
              {w.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-content">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/15">
                    <Check className="h-3.5 w-3.5 text-teal" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="py-6">
            <WorkspaceMockup />
          </Reveal>
        </div>

        {/* Academic integrity */}
        <div className="mt-20">
          <Reveal className="max-w-2xl">
            <h3 className="text-balance text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              {ig.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              {ig.body}
            </p>
          </Reveal>

          <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
            {ig.cards.map((c, i) => {
              const Icon = integrityIcons[i];
              return (
                <StaggerItem key={c.title}>
                  <div className="glass-card h-full p-6 transition-colors duration-200 hover:border-teal/40">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-pill bg-teal/12 text-teal">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h4 className="mt-4 font-semibold text-content">{c.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{c.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>

          <Reveal className="mt-6">
            <div className="glass-card grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
              {ig.levels.map((lvl) => (
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
            <p className="mt-4 text-sm italic leading-relaxed text-muted/80">{ig.note}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
