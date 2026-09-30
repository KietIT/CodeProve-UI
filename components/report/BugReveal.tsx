"use client";

import { Sym } from "@/components/app/AppChrome";
import { CodeBlock, MARK_CLASS, MARK_SYMBOL, type LineMark } from "@/components/daily/CodeBlock";
import { fill } from "@/components/report/diagnosis";
import { regionsHit, revealFitsStarter, revealMarks, type RevealMark } from "@/components/debug/locate";
import type { DebugReveal } from "@/lib/types/report";

export type BugRevealCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  skipped: string;
  hintsUsed: string;
  tags: Readonly<Record<RevealMark, string>>;
  legend: Readonly<Record<RevealMark, string>>;
  explanationLabel: string;
  codeUnavailable: string;
  none: string;
};

const LEGEND_TEXT: Record<RevealMark, string> = {
  hit: "text-success",
  missed: "text-error",
  extra: "text-warning",
};

const LEGEND_ORDER: RevealMark[] = ["hit", "missed", "extra"];

/**
 * "Bug location" on the Feedback page of a debug exercise: the starter with the
 * student's lines and the real bug marked differently, hints used or skip, and
 * the explanation. `code` is the served starter, `null` when it could not be loaded.
 */
export function BugReveal({
  reveal,
  code,
  loading,
  copy,
}: {
  reveal: DebugReveal;
  code: string | null;
  loading: boolean;
  copy: BugRevealCopy;
}) {
  const marks: Map<number, LineMark> = revealMarks(reveal);
  const shownMarks = new Set(marks.values());
  const fits = code !== null && revealFitsStarter(reveal, code.split("\n").length);
  const lineList = (lines: number[]) => (lines.length > 0 ? lines.join(", ") : copy.none);

  return (
    <section className="ice-card mb-10 p-6 sm:p-8" aria-labelledby="bug-reveal-title">
      <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">{copy.eyebrow}</span>
      <h3 id="bug-reveal-title" className="mb-4 mt-1 font-headline-lg-mobile text-headline-lg-mobile">
        {copy.title}
      </h3>

      <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 font-label-mono text-label-mono text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <Sym name={reveal.skipped ? "skip_next" : "my_location"} className="text-[16px] text-primary" />
          {reveal.skipped
            ? copy.skipped
            : fill(copy.summary, { hit: regionsHit(reveal), total: reveal.regions.length })}
        </span>
        <span className="flex items-center gap-1.5">
          <Sym name="lightbulb" className="text-[16px] text-primary" />
          {fill(copy.hintsUsed, { n: reveal.hints_used })}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant" role="status">
          <Sym name="progress_activity" className="animate-spin text-[18px] text-primary" />
        </div>
      ) : fits && code !== null ? (
        <>
          <CodeBlock code={code} marks={marks} markLabels={copy.tags} />
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-on-surface-variant">
            {LEGEND_ORDER.filter((m) => shownMarks.has(m)).map((m) => (
              <li key={m} className="flex items-center gap-1.5">
                <span
                  className={`inline-flex h-4 w-5 items-center justify-center rounded-sm text-[11px] font-bold ${MARK_CLASS[m]} ${LEGEND_TEXT[m]}`}
                  aria-hidden="true"
                >
                  {MARK_SYMBOL[m]}
                </span>
                {copy.legend[m]}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-on-surface-variant">
          {fill(copy.codeUnavailable, {
            regions: lineList(reveal.regions.flat()),
            selected: lineList(reveal.skipped ? [] : reveal.selected),
          })}
        </p>
      )}

      <div className="mt-5 border-l-2 border-primary bg-primary/5 p-4">
        <p className="mb-1 font-label-caps text-label-caps uppercase tracking-widest text-primary">
          {copy.explanationLabel}
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface">{reveal.explanation}</p>
      </div>
    </section>
  );
}
