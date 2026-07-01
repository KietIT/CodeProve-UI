"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getReport, type ReportOut } from "@/lib/api";
import { Sym } from "@/components/app/AppChrome";

// ── Score-ring constants ──────────────────────────────────────────────────────
const R = 44;
const CIRC = 2 * Math.PI * R;

function scoreOffset(score: number): number {
  return CIRC * (1 - Math.min(100, Math.max(0, score)) / 100);
}

// ── Integrity badge ───────────────────────────────────────────────────────────
const INTEGRITY_LABEL: Record<ReportOut["integrity_status"], string> = {
  green: "Integrity: Verified",
  yellow: "Integrity: Review",
  red: "Integrity: Flagged",
};
const INTEGRITY_CLASS: Record<ReportOut["integrity_status"], string> = {
  green: "border-primary/30 bg-primary/10 text-primary",
  yellow: "border-[rgb(var(--secondary))]/30 bg-[rgb(var(--secondary))]/10 text-[rgb(var(--secondary))]",
  red: "border-error/30 bg-error/10 text-error",
};
const INTEGRITY_ICON: Record<ReportOut["integrity_status"], string> = {
  green: "verified",
  yellow: "warning",
  red: "gpp_bad",
};

// ── Axis display names (capitalise first letter; backend uses snake_case keys) ─
function axisLabel(key: string): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Main component ────────────────────────────────────────────────────────────

export function FeedbackContent() {
  const searchParams = useSearchParams();
  const attemptParam = searchParams.get("attempt");
  const attemptId = attemptParam ? Number(attemptParam) : null;

  const [report, setReport] = useState<ReportOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attemptId === null || isNaN(attemptId)) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchReport() {
      try {
        const data = await getReport(attemptId!);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load report.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchReport();
    return () => { cancelled = true; };
  }, [attemptId]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Sym name="hourglass_empty" className="animate-spin text-[22px] text-primary" />
          <span className="font-label-mono text-label-mono">Loading your report…</span>
        </div>
      </main>
    );
  }

  // ── No attempt param ──────────────────────────────────────────────────────
  if (attemptId === null || isNaN(attemptId)) {
    return (
      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        <div className="ice-card p-8 text-center">
          <Sym name="info" className="mb-3 text-[36px] text-on-surface-variant/50" />
          <h2 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile">No attempt selected</h2>
          <p className="mb-6 text-sm text-on-surface-variant">
            This page requires a valid attempt ID. Complete a challenge first.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
          >
            Back to dashboard <Sym name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </main>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !report) {
    return (
      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
        <div className="ice-card p-8 text-center">
          <Sym name="error_outline" className="mb-3 text-[36px] text-error" />
          <h2 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile">Could not load report</h2>
          <p className="mb-6 text-sm text-on-surface-variant">{error ?? "Unknown error."}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
          >
            Back to dashboard <Sym name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
      </main>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const score = Math.round(report.overall);
  const offset = scoreOffset(report.overall);
  const axisPctEntries = Object.entries(report.axes_pct);

  return (
    <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-10 md:px-12">
      <header className="mb-10">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
          Assessment report
        </span>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1 className="font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
            Feedback summary
          </h1>
          {/* Integrity badge */}
          <span
            className={`inline-flex items-center gap-1.5 border px-3 py-1 font-label-mono text-label-mono text-sm ${INTEGRITY_CLASS[report.integrity_status]}`}
          >
            <Sym name={INTEGRITY_ICON[report.integrity_status]} className="text-[15px]" />
            {INTEGRITY_LABEL[report.integrity_status]}
          </span>
        </div>
      </header>

      {/* Score ring + axis bars */}
      <div className="mb-10 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Ring */}
        <div className="ice-card relative flex flex-col items-center justify-center overflow-hidden p-10 xl:col-span-5">
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
                OUT OF 100
              </div>
            </div>
          </div>
          <p className="mt-6 font-headline-lg-mobile text-headline-lg-mobile text-primary">
            Fluency tier: {report.tier}
          </p>
          <p className="mt-2 max-w-xs text-center text-on-surface-variant">
            Your score reflects AI-fluency across six reasoning axes.
          </p>
        </div>

        {/* Axis bars */}
        <div className="ice-card flex flex-col gap-5 p-8 xl:col-span-7">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            Performance by axis
          </h3>
          {axisPctEntries.map(([key, pct]) => {
            const label = axisLabel(key);
            const isNull = pct === null;
            return (
              <div key={key}>
                <div className="mb-2 flex justify-between font-label-mono text-label-mono">
                  <span>{label}</span>
                  {isNull ? (
                    <span className="text-on-surface-variant/40">-</span>
                  ) : (
                    <span className="text-primary">{Math.round(pct)}%</span>
                  )}
                </div>
                {isNull ? (
                  <div className="h-1.5 w-full bg-surface-container-highest opacity-30" />
                ) : (
                  <div className="h-1.5 w-full overflow-hidden bg-surface-container-highest">
                    <div
                      className="animate-progress h-full bg-primary"
                      style={{ ["--final-width" as string]: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <section className="mb-10">
        <h3 className="mb-8 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          Process timeline &amp; evidence
        </h3>
        <div className="relative">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-primary/20" />
          <div className="space-y-8">
            {report.timeline.map((t) => (
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
                    {t.step}
                  </span>
                  <h4 className="mt-1 font-headline-lg-mobile text-headline-lg-mobile">
                    {t.title}
                  </h4>
                  <p className="mt-1 text-sm text-on-surface-variant">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strengths + risks */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Strengths */}
        <div className="border border-primary/20 bg-primary/5 p-7">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
            What went well
          </span>
          <h3 className="mb-5 mt-1 font-headline-lg-mobile text-headline-lg-mobile">Strengths</h3>
          {report.feedback.strengths.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No strengths recorded for this attempt.</p>
          ) : (
            <ul className="space-y-4">
              {report.feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Sym name="verified" className="mt-0.5 text-primary" />
                  <div>
                    <p className="font-medium">{axisLabel(s.axis)}</p>
                    <p className="text-sm text-on-surface-variant">{s.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Risks / focus areas */}
        <div className="border border-error/20 bg-error/5 p-7">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-error">
            To improve
          </span>
          <h3 className="mb-5 mt-1 font-headline-lg-mobile text-headline-lg-mobile">Focus areas</h3>
          {report.feedback.risks.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No risk areas flagged for this attempt.</p>
          ) : (
            <ul className="space-y-4">
              {report.feedback.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Sym name="science" className="mt-0.5 text-error" />
                  <div>
                    <p className="font-medium">{axisLabel(r.axis)}</p>
                    <p className="text-sm text-on-surface-variant">{r.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/workspace"
          className="flex cursor-pointer items-center gap-2 bg-primary px-6 py-3 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
        >
          Next challenge <Sym name="arrow_forward" className="text-[16px]" />
        </Link>
        <Link
          href="/dashboard"
          className="flex cursor-pointer items-center gap-2 border border-outline-variant/60 px-6 py-3 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
