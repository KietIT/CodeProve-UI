"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getAttempt, getExerciseDetail, getReport, type ReportOut } from "@/lib/api";
import { Sym } from "@/components/app/AppChrome";
import { RadarChart } from "@/components/report/RadarChart";
import { IntegrityFlags } from "@/components/report/IntegrityFlags";
import { AxisLevels } from "@/components/report/AxisLevels";
import { FindingsSection } from "@/components/report/FindingsSection";
import { TestResults } from "@/components/report/TestResults";
import { BugReveal } from "@/components/report/BugReveal";
import { StudentTestsSection } from "@/components/report/StudentTestsSection";
import { exerciseHref, levelOf, nextExercise } from "@/components/report/diagnosis";
import { noteText, timelineText } from "@/components/report/reportText";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

// ── Score-ring constants ──────────────────────────────────────────────────────
const R = 44;
const CIRC = 2 * Math.PI * R;

function scoreOffset(score: number): number {
  return CIRC * (1 - Math.min(100, Math.max(0, score)) / 100);
}

// Session-pulse labels (values come from the report timeline; no new metrics).
const PULSE_COPY = {
  vi: { title: "Nhịp phiên", radar: "Radar 6 trục", coverage: "Coverage", explain: "Giải thích lại", hypothesis: "Giả thuyết", yes: "Có", no: "Không", na: "—" },
  en: { title: "Session pulse", radar: "6-axis radar", coverage: "Coverage", explain: "Explain-back", hypothesis: "Hypothesis", yes: "Yes", no: "No", na: "—" },
} as const;

// Copy for this page in the active locale (vi/en share the same keys).
type FeedbackCopy = (typeof appContent)["vi"]["feedback"] | (typeof appContent)["en"]["feedback"];

// ── Integrity badge ───────────────────────────────────────────────────────────
// "green" means no cheating signals (blocked paste, tab-switch, fullscreen
// exit...) were detected during the session - it does NOT mean the attempt
// itself was verified as good work, so the label avoids the word "Verified".
function integrityLabel(status: ReportOut["integrity_status"], tf: FeedbackCopy): string {
  if (status === "green") return tf.integrityGreen;
  if (status === "yellow") return tf.integrityYellow;
  return tf.integrityRed;
}

// ── Localisation helpers ──────────────────────────────────────────────────────

// Axis display names: backend sends snake_case keys or English labels.
function axisLabel(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Main component ────────────────────────────────────────────────────────────

export function FeedbackContent() {
  const { locale } = useI18n();
  const tf = appContent[locale].feedback;
  const axesMap = appContent[locale].axes as Record<string, string>;
  const axisName = (key: string) => axesMap[axisLabel(key)] ?? axisLabel(key);
  const searchParams = useSearchParams();
  const attemptParam = searchParams.get("attempt");
  const attemptId = attemptParam ? Number(attemptParam) : null;

  const hasAttempt = attemptId !== null && !Number.isNaN(attemptId);
  const query = useQuery({
    queryKey: ["report", attemptId],
    queryFn: () => getReport(attemptId!),
    enabled: hasAttempt,
  });
  const report = query.data ?? null;

  // The reveal marks lines of the starter as served; the report does not carry
  // it, so it comes from the attempt's exercise (debug starters are served
  // with comments stripped, the numbering the regions use).
  const debugReveal = report?.feedback.debug;
  const starterQuery = useQuery({
    queryKey: ["debug-starter", attemptId],
    queryFn: async () => {
      const attempt = await getAttempt(attemptId!, locale);
      return (await getExerciseDetail(attempt.exercise_code)).starter;
    },
    enabled: hasAttempt && Boolean(debugReveal),
    staleTime: Infinity,
    retry: 1,
  });
  const loading = hasAttempt && query.isLoading;
  const error = query.error ? (query.error as Error).message : null;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Sym name="hourglass_empty" className="animate-spin text-[22px] text-primary" />
          <span className="font-label-mono text-label-mono">{tf.loading}</span>
        </div>
      </div>
    );
  }

  // ── No attempt param ──────────────────────────────────────────────────────
  if (attemptId === null || isNaN(attemptId)) {
    return (
      <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
        <div className="ice-card p-8 text-center">
          <Sym name="info" className="mb-3 text-[36px] text-on-surface-variant/50" />
          <h2 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile">{tf.noAttemptTitle}</h2>
          <p className="mb-6 text-sm text-on-surface-variant">{tf.noAttemptDesc}</p>
          <Link
            href="/dashboard"
            className="rounded-xl inline-flex items-center gap-2 bg-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
          >
            {tf.backToDashboard} <Sym name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !report) {
    return (
      <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
        <div className="ice-card p-8 text-center">
          <Sym name="error_outline" className="mb-3 text-[36px] text-error" />
          <h2 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile">{tf.errorTitle}</h2>
          <p className="mb-6 text-sm text-on-surface-variant">{error ?? tf.unknownError}</p>
          <Link
            href="/dashboard"
            className="rounded-xl inline-flex items-center gap-2 bg-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
          >
            {tf.backToDashboard} <Sym name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const score = Math.round(report.overall);
  const offset = scoreOffset(report.overall);
  const axisPctEntries = Object.entries(report.axes_pct);
  // Older reports predate `not_applicable`; treat a missing map as empty.
  const notApplicable = report.feedback.not_applicable ?? {};
  const tierName = (tf.tierNames as Record<string, string>)[report.tier] ?? report.tier;

  // Radar data (percentages). Renders even if the backend omits an axis.
  const radarData = axisPctEntries.map(([key, pct]) => ({ label: axisName(key), value: pct }));

  // "Session pulse" from real timeline numbers only (no fabricated metrics).
  const implItem = report.timeline.find((t) => t.key === "implementation");
  const explainItem = report.timeline.find((t) => t.key === "explain_back");
  const hypoItem = report.timeline.find((t) => t.key === "hypothesis");
  const pulse = PULSE_COPY[locale];
  const submitTests = report.feedback.submit_tests;

  // Engine v2 levels; `undefined` on older reports, which keep the 0-20 / % display.
  const understandingLevel = levelOf(report, "understanding");
  const understandingName =
    understandingLevel === undefined || understandingLevel === null
      ? undefined
      : tf.levelNames[understandingLevel];
  const explainPulse =
    understandingLevel === null
      ? pulse.na
      : understandingName ??
        (explainItem?.explain_score != null ? `${explainItem.explain_score}/20` : pulse.na);
  const diagnosis = report.feedback.diagnosis;
  const findingAxisName = (axis: string) => (axis === "overall" ? tf.overallAxis : axisName(axis));
  const nextCode = nextExercise(report);

  const axisRows = axisPctEntries.map(([key, pct]) => ({
    key,
    label: axisName(key),
    pct,
    level: levelOf(report, key),
    naReason: notApplicable[key] ? tf.naReasons[notApplicable[key]] : undefined,
  }));

  return (
    <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
      <header className="mb-10">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
          {tf.eyebrow}
        </span>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1 className="font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
            {tf.title}
          </h1>
          {/* Integrity flag (Phase 1 LevelBadge, kept above the fold) */}
          <IntegrityFlags status={report.integrity_status} label={integrityLabel(report.integrity_status, tf)} />
        </div>
      </header>

      {/* Score ring + axis bars */}
      <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Ring */}
        <div className="ice-card relative flex flex-col items-center justify-center overflow-hidden p-10 xl:col-span-4">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-[90px]" />
          <div className="relative flex h-56 w-56 items-center justify-center">
            <svg
              className="ring-glow absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50" cy="50" r={R}
                fill="transparent"
                stroke="rgb(var(--surface-container-highest))"
                strokeWidth="10"
              />
              <circle
                cx="50" cy="50" r={R}
                fill="transparent"
                stroke="rgb(var(--primary))"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRC.toFixed(2)}
                strokeDashoffset={offset.toFixed(2)}
              />
            </svg>
            <div className="text-center">
              <div className="font-headline-xl text-[60px] leading-none">{score}</div>
              <div className="font-label-mono text-label-mono text-on-surface-variant/70">
                {tf.outOf}
              </div>
            </div>
          </div>
          <p className="mt-6 font-headline-lg-mobile text-headline-lg-mobile text-primary">
            {tf.tierLabel}: {tierName}
          </p>
          <p className="mt-2 max-w-xs text-center text-on-surface-variant">
            {tf.ringDesc}
          </p>
        </div>

        {/* Radar (6 axes, self-drawn SVG) */}
        <div className="ice-card flex flex-col p-6 xl:col-span-4">
          <h3 className="mb-2 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {pulse.radar}
          </h3>
          <div className="flex flex-1 items-center justify-center">
            <RadarChart data={radarData} />
          </div>
        </div>

        {/* Session pulse (real timeline numbers) */}
        <div className="ice-card flex flex-col gap-4 p-6 xl:col-span-4">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {pulse.title}
          </h3>
          {submitTests && submitTests.total > 0 ? (
            <PulseRow label={tf.submitPulse} value={`${submitTests.passed}/${submitTests.total}`} />
          ) : (
            <PulseRow label={pulse.coverage} value={implItem?.coverage_pct != null ? `${Math.round(implItem.coverage_pct)}%` : pulse.na} />
          )}
          <PulseRow label={pulse.explain} value={explainPulse} />
          <PulseRow label={pulse.hypothesis} value={hypoItem ? (hypoItem.active ? pulse.yes : pulse.no) : pulse.na} />
        </div>

        {/* Axis bars */}
        <div className="ice-card flex flex-col gap-5 p-8 xl:col-span-12">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {tf.byAxis}
          </h3>
          <AxisLevels
            rows={axisRows}
            copy={{ naLabel: tf.naLabel, levelNames: tf.levelNames, levelAria: tf.levelAria }}
          />
        </div>
      </div>

      {/* Timeline */}
      <section className="mb-10">
        <h3 className="mb-8 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {tf.timelineHeader}
        </h3>
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-primary/20" />
          <div className="space-y-8">
            {report.timeline.map((t) => {
              const text = timelineText(t, tf, understandingName, submitTests);
              return (
                <div key={t.step} className="relative pl-12">
                  <div
                    className={`absolute left-0 top-1 flex h-8 w-8 items-center justify-center border-2 bg-background ${t.active ? "border-primary" : "border-outline-variant"}`}
                  >
                    <span
                      className={`h-2 w-2 ${t.active ? "bg-primary" : "bg-outline-variant"}`}
                    />
                  </div>
                  <div
                    className={`ice-card border-l-2 p-5 ${t.active ? "border-l-primary" : "border-l-outline-variant"}`}
                  >
                    <span className="font-label-mono text-label-mono uppercase text-primary">
                      {text.step}
                    </span>
                    <h4 className="mt-1 font-headline-lg-mobile text-headline-lg-mobile">
                      {text.title}
                    </h4>
                    <p className="mt-1 text-sm text-on-surface-variant">{text.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {debugReveal && (
        <BugReveal
          reveal={debugReveal}
          code={starterQuery.data ?? null}
          loading={starterQuery.isLoading}
          copy={tf.debugReveal}
        />
      )}

      {/* Diagnosis findings (engine v2), else the older strengths + risks lists */}
      {diagnosis ? (
        <FindingsSection
          diagnosis={diagnosis}
          axisName={findingAxisName}
          copy={{
            severityNames: tf.severityNames,
            findingFields: tf.findingFields,
            openExercise: tf.openExercise,
            risksEyebrow: tf.risksEyebrow,
            risksTitle: tf.risksTitle,
            noRisks: tf.noRisks,
            strengthsEyebrow: tf.strengthsEyebrow,
            strengthsTitle: tf.strengthsTitle,
            noStrengths: tf.noStrengths,
          }}
        />
      ) : (
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Strengths */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-7">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
              {tf.strengthsEyebrow}
            </span>
            <h3 className="mb-5 mt-1 font-headline-lg-mobile text-headline-lg-mobile">{tf.strengthsTitle}</h3>
            {report.feedback.strengths.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{tf.noStrengths}</p>
            ) : (
              <ul className="space-y-4">
                {report.feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Sym name="verified" className="mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">{axisName(s.axis)}</p>
                      <p className="text-sm text-on-surface-variant">{noteText(s, axisName(s.axis), tf)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Risks / focus areas */}
          <div className="rounded-2xl border border-error/20 bg-error/5 p-7">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-error">
              {tf.risksEyebrow}
            </span>
            <h3 className="mb-5 mt-1 font-headline-lg-mobile text-headline-lg-mobile">{tf.risksTitle}</h3>
            {report.feedback.risks.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{tf.noRisks}</p>
            ) : (
              <ul className="space-y-4">
                {report.feedback.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Sym name="science" className="mt-0.5 text-error" />
                    <div>
                      <p className="font-medium">{axisName(r.axis)}</p>
                      <p className="text-sm text-on-surface-variant">{noteText(r, axisName(r.axis), tf)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {report.feedback.tests && (
        <StudentTestsSection
          report={report.feedback.tests}
          copy={{
            ...tf.studentTests,
            inputLabel: tf.inputLabel,
            expectedLabel: tf.expectedLabel,
            categoryNames: tf.categoryNames,
          }}
        />
      )}

      {submitTests && (
        <TestResults
          tests={submitTests}
          copy={{
            testsTitle: tf.testsTitle,
            testsSummary: tf.testsSummary,
            testsSummaryNoHidden: tf.testsSummaryNoHidden,
            failedGroups: tf.failedGroups,
            categoryNames: tf.categoryNames,
            allPassed: tf.allPassed,
            showMoreFailures: tf.showMoreFailures,
            hiddenTag: tf.hiddenTag,
            visibleTag: tf.visibleTag,
            inputLabel: tf.inputLabel,
            expectedLabel: tf.expectedLabel,
            actualLabel: tf.actualLabel,
            errorLabel: tf.errorLabel,
          }}
        />
      )}

      <div className="flex flex-wrap gap-4">
        <Link
          href={nextCode ? exerciseHref(nextCode) : "/workspace"}
          className="rounded-xl flex cursor-pointer items-center gap-2 bg-primary px-6 py-3 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
        >
          {tf.nextChallenge} <Sym name="arrow_forward" className="text-[16px]" />
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl flex cursor-pointer items-center gap-2 border border-outline-variant/60 px-6 py-3 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          {tf.backToDashboard}
        </Link>
      </div>
    </div>
  );
}

function PulseRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-outline-variant/40 pb-2 last:border-0">
      <span className="font-label-mono text-label-mono text-on-surface-variant">{label}</span>
      <span className="font-label-mono text-label-mono text-primary">{value}</span>
    </div>
  );
}
