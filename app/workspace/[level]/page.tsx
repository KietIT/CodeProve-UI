import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { LEVELS } from "@/lib/exercises";
import LevelExercises from "@/components/app/LevelExercises";

export default function LevelPicker({ params }: { params: { level: string } }) {
  const config = LEVELS[params.level?.toLowerCase() ?? ""];

  if (!config) return notFound();

  const solvedCount = config.exercises.filter((e) => e.status === "solved").length;
  const total = config.exercises.length;
  const progress = Math.round((solvedCount / total) * 100);

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-8 md:px-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-label-mono text-label-mono text-on-surface-variant/70">
          <Link href="/workspace" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Sym name="arrow_back" className="text-[16px]" /> Training levels
          </Link>
          <span className="text-on-surface-variant/40">/</span>
          <span className="text-on-surface">{config.name}</span>
        </nav>

        {/* Level header */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
                {config.level} track
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1.5 w-5 ${i < config.filled ? "bg-primary" : "bg-outline-variant/50"}`} />
                ))}
              </div>
            </div>
            <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
              {config.name} exercises
            </h1>
            <p className="mt-3 max-w-xl text-on-surface-variant">{config.blurb}</p>
          </div>

          {/* Progress card (from static data; updates when API data loads via LevelExercises) */}
          <div className="ice-card flex min-w-[220px] flex-col gap-3 p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">Progress</span>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
                {solvedCount}
                <span className="text-on-surface-variant/50">/{total}</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-container-highest">
              <div
                className="animate-progress h-full rounded-pill bg-primary"
                style={{ ["--final-width" as string]: `${progress}%`, width: `${progress}%` }}
              />
            </div>
            <span className="font-label-mono text-label-mono text-on-surface-variant/60">{progress}% solved</span>
          </div>
        </header>

        {/* Exercise list — fetches from API with static fallback */}
        <LevelExercises level={config.slug} />
      </main>

      <AppFooter />
    </div>
  );
}
