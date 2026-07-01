"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { LEVELS } from "@/lib/exercises";
import LevelExercises from "@/components/app/LevelExercises";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

type LevelSlug = "fresher" | "junior" | "senior";

export default function LevelPicker({ params }: { params: { level: string } }) {
  const { locale } = useI18n();
  const c = appContent[locale];
  const slug = (params.level?.toLowerCase() ?? "") as LevelSlug;
  const config = LEVELS[slug];

  if (!config) return notFound();

  const diffLabel = c.difficulty[config.level] ?? config.level;
  const trackLabel = locale === "vi" ? `Lộ trình ${diffLabel}` : `${config.level} track`;
  const heading = locale === "vi" ? `Bài tập ${config.name}` : `${config.name} exercises`;
  const blurb = c.levelInfo[slug] ?? config.blurb;

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-8 md:px-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-label-mono text-label-mono text-on-surface-variant/70">
          <Link href="/workspace" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Sym name="arrow_back" className="text-[16px]" /> {c.level.trainingLevels}
          </Link>
          <span className="text-on-surface-variant/40">/</span>
          <span className="text-on-surface">{config.name}</span>
        </nav>

        {/* Level header */}
        <header className="mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
                {trackLabel}
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1.5 w-5 ${i < config.filled ? "bg-primary" : "bg-outline-variant/50"}`} />
                ))}
              </div>
            </div>
            <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
              {heading}
            </h1>
            <p className="mt-3 max-w-xl text-on-surface-variant">{blurb}</p>
          </div>
        </header>

        {/* Exercise list — fetches from API with static fallback */}
        <LevelExercises level={config.slug} />
      </main>

      <AppFooter />
    </div>
  );
}
