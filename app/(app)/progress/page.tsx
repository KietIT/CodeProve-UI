"use client";

import { useQuery } from "@tanstack/react-query";
import { Sym } from "@/components/app/AppChrome";
import { RecommendedCard } from "@/components/dashboard/RecommendedCard";
import { RecurringCard } from "@/components/progress/RecurringCard";
import { SkillsCard } from "@/components/progress/SkillsCard";
import { TrendsCard } from "@/components/progress/TrendsCard";
import { getDashboard, getLearnerMe } from "@/lib/api";
import { recurringLines } from "@/lib/progress";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

// Learner model view (P3.5). Never renders `brief`, Elo numbers or success
// chances - see backend docs/api/learner.md "Progress page".
export default function ProgressPage() {
  const { locale } = useI18n();
  const t = appContent[locale].progress;
  const axesL = appContent[locale].axes as Record<string, string>;
  const naLabel = appContent[locale].feedback.naLabel;

  const learner = useQuery({
    queryKey: ["learner", locale],
    queryFn: () => getLearnerMe(locale),
  });
  // Shares the dashboard's cache entry; only `recommended` is used here.
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const data = learner.data;
  const loading = learner.isLoading;
  const error = learner.error ? (learner.error as Error).message : null;
  const ready = !loading && !error && data !== undefined;
  const isEmpty = ready && data.scored_attempts === 0;
  const hasRecurring = ready && recurringLines(data.recurring, data.window, t.recurringUnit).length > 0;

  const recommended = (
    <RecommendedCard items={dashboard.data?.recommended} locale={locale} copy={appContent[locale].dashboard} />
  );

  return (
    <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
      <header className="mb-10">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
        <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">{t.title}</h1>
        <p className="mt-3 max-w-md text-on-surface-variant">{t.sub}</p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-24 text-on-surface-variant">
          <Sym name="progress_activity" className="mr-3 animate-spin text-[28px] text-primary" />
          {t.loading}
        </div>
      )}

      {error && (
        <div className="ice-card p-6 text-error">
          <p>{t.loadFailed}: {error}</p>
        </div>
      )}

      {isEmpty && (
        <>
          <div className="ice-card mb-8 flex items-center gap-4 p-6">
            <Sym name="rocket_launch" className="shrink-0 text-[32px] text-primary/70" />
            <p className="text-on-surface">{t.empty}</p>
          </div>
          {recommended}
        </>
      )}

      {ready && !isEmpty && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
            <SkillsCard
              skills={data.skills}
              locale={locale}
              copy={t}
              className={hasRecurring ? "xl:col-span-7" : "xl:col-span-12"}
            />
            <RecurringCard items={data.recurring} window={data.window} copy={t} className="xl:col-span-5 xl:self-start" />
          </div>
          <TrendsCard history={data.history ?? []} axesLabels={axesL} naLabel={naLabel} copy={t} />
          {recommended}
        </>
      )}
    </div>
  );
}
