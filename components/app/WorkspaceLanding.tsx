"use client";

import Link from "next/link";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

// Technical domain tags + business verticals stay in English (they double as
// filter keys / product names); everything else follows the locale.
const tags = ["Algorithms", "Debugging", "API security", "Concurrency"];
const business = ["FinTech", "HealthTech", "Logistics", "Classified"];

const levels = [
  { name: "Fresher", slug: "fresher", level: "Easy", filled: 1, count: 12 },
  { name: "Junior", slug: "junior", level: "Medium", filled: 2, count: 10 },
  { name: "Senior", slug: "senior", level: "Hard", filled: 3, count: 8 },
] as const;

export function WorkspaceLanding() {
  const { locale } = useI18n();
  const c = appContent[locale];
  const w = c.workspace;

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        <header className="mb-8">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{w.eyebrow}</span>
          <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">{w.title}</h1>
          <p className="mt-3 max-w-lg text-on-surface-variant">{w.sub}</p>
        </header>

        {/* Search + filters */}
        <div className="ice-card mb-10 flex flex-wrap items-center gap-4 p-4">
          <div className="flex min-w-[260px] flex-1 items-center gap-2 border-b border-outline-variant/70 bg-transparent px-2 py-2 focus-within:border-primary">
            <Sym name="search" className="text-[20px] text-on-surface-variant" />
            <input
              className="w-full bg-transparent font-label-mono text-label-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-0"
              placeholder={w.searchPlaceholder}
              type="text"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">{w.tags}</span>
            {tags.map((t, i) => (
              <button
                key={t}
                className={`cursor-pointer border px-3 py-1 font-label-mono text-label-mono transition-colors ${
                  i === 0
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-outline-variant/70 text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Training levels */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-4">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{w.trainingLevels}</h2>
            <div className="h-px flex-1 bg-outline-variant/60" />
            <span className="font-label-mono text-label-mono text-on-surface-variant/60">{w.tracks}</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {levels.map((lv) => (
              <Link
                key={lv.name}
                href={`/workspace/${lv.slug}`}
                className="ice-card group flex flex-col p-6 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-label-mono uppercase text-primary">
                    {c.difficulty[lv.level] ?? lv.level}
                  </span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`h-1.5 w-5 ${i < lv.filled ? "bg-primary" : "bg-outline-variant/50"}`} />
                    ))}
                  </div>
                </div>
                <h3 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile">{lv.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">{c.levelInfo[lv.slug]}</p>
                <div className="mt-5 flex items-center justify-between border-t border-outline-variant/40 pt-4">
                  <span className="font-label-mono text-label-mono text-on-surface-variant/60">{lv.count} {w.exercises}</span>
                  <span className="flex items-center gap-1 font-label-mono text-label-mono text-primary transition-transform group-hover:translate-x-1">
                    {w.browse} <Sym name="arrow_forward" className="text-[16px]" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Business problems */}
        <section>
          <div className="mb-5 flex items-center gap-4">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{w.businessProblems}</h2>
            <span className="border border-primary/30 bg-primary/5 px-2 py-0.5 font-label-mono text-label-mono uppercase text-primary">{w.comingSoon}</span>
            <div className="h-px flex-1 bg-outline-variant/60" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {business.map((b) => (
              <div key={b} className="ice-card flex cursor-not-allowed flex-col p-5 opacity-70">
                <div className="mb-4 flex h-24 items-center justify-center border border-dashed border-outline-variant/60 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant/50">
                  <Sym name="lock" className="text-[28px]" />
                </div>
                <div className="font-label-mono text-label-mono uppercase text-on-surface-variant">{b}</div>
                <div className="mt-1 text-sm text-on-surface-variant/70">{w.realWorld}</div>
                <div className="mt-4 border-t border-outline-variant/40 pt-3 font-label-mono text-label-mono uppercase text-on-surface-variant/50">{w.locked}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}
