"use client";

import { useState } from "react";
import { Sym } from "@/components/app/AppChrome";
import { CodeBlock, type LineMark } from "@/components/daily/CodeBlock";
import { fill } from "@/components/report/diagnosis";
import {
  MAX_LOCATE_LINES,
  MAX_REASON_CHARS,
  canSubmitLocation,
  nextHintStep,
} from "@/components/debug/locate";
import type { AppContent } from "@/lib/appContent";

export type LocateCopy = Readonly<Record<keyof AppContent["solve"]["debug"], string>>;

type LocatePanelProps = {
  /** The starter exactly as served (the line numbers the server expects). */
  code: string;
  selected: readonly number[];
  onToggleLine: (line: number) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  /** Hints already bought, in order. */
  hints: readonly string[];
  hintLoading: boolean;
  onTakeHint: () => void;
  submitting: boolean;
  onSubmit: () => void;
  /** Called after the student confirms the skip dialog. */
  onSkip: () => void;
  error: string | null;
  /** Anti-cheat handlers shared with the rest of the workspace. */
  onBlockedPaste: (e: React.ClipboardEvent<HTMLElement>) => void;
  onBlockedDrop: (e: React.DragEvent<HTMLElement>) => void;
  copy: LocateCopy;
};

/**
 * Step 1 of a debug exercise: the read-only starter with clickable lines, a
 * reason box, the paid hint ladder and skip. Presentational: every request is
 * made by the workspace through the callbacks.
 */
export function LocatePanel({
  code,
  selected,
  onToggleLine,
  reason,
  onReasonChange,
  hints,
  hintLoading,
  onTakeHint,
  submitting,
  onSubmit,
  onSkip,
  error,
  onBlockedPaste,
  onBlockedDrop,
  copy,
}: LocatePanelProps) {
  const [confirmSkip, setConfirmSkip] = useState(false);
  const busy = submitting || hintLoading;
  const nextHint = nextHintStep(hints.length);
  const marks = new Map<number, LineMark>(selected.map((l) => [l, "selected"]));
  const full = selected.length >= MAX_LOCATE_LINES;

  return (
    <div className="ice-scroll absolute inset-0 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4 sm:p-6">
        <header>
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
            {copy.stepEyebrow}
          </span>
          <h2 className="mt-1 font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{copy.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            {fill(copy.intro, { max: MAX_LOCATE_LINES })}
          </p>
        </header>

        <div
          role="status"
          className="flex items-start gap-2 border border-outline-variant/60 bg-surface-container-low px-3 py-2 font-label-mono text-label-mono text-on-surface-variant"
        >
          <Sym name="lock" className="mt-px text-[16px] text-primary" />
          <span>{copy.editorLocked}</span>
        </div>

        <div>
          <CodeBlock
            code={code}
            marks={marks}
            onSelectLine={onToggleLine}
            markLabels={{ selected: copy.selectedTag }}
            disabled={busy}
            ariaLabel={copy.codeAria}
          />
          <p
            className={`mt-2 font-label-mono text-label-mono ${full ? "text-warning" : "text-on-surface-variant/80"}`}
            aria-live="polite"
          >
            {full
              ? fill(copy.maxReached, { max: MAX_LOCATE_LINES })
              : fill(copy.selectedCount, { n: selected.length, max: MAX_LOCATE_LINES })}
          </p>
        </div>

        <label className="block">
          <span className="mb-1.5 block font-label-caps text-label-caps uppercase tracking-widest text-on-surface">
            {copy.reasonLabel}
          </span>
          <textarea
            value={reason}
            maxLength={MAX_REASON_CHARS}
            onChange={(e) => onReasonChange(e.target.value)}
            onPaste={onBlockedPaste}
            onDrop={onBlockedDrop}
            disabled={submitting}
            placeholder={copy.reasonPlaceholder}
            className="h-24 w-full resize-none border border-outline-variant/60 bg-surface-container-lowest/50 p-2.5 text-sm text-on-surface outline-none focus:border-primary disabled:opacity-60"
          />
          <span className="mt-1 block text-right font-label-mono text-[11px] text-on-surface-variant/70">
            {reason.length}/{MAX_REASON_CHARS}
          </span>
        </label>

        <section className="border border-outline-variant/50 p-4">
          <h3 className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
            <Sym name="lightbulb" className="text-[16px]" /> {copy.hintsTitle}
          </h3>
          {hints.length > 0 && (
            <ol className="mt-3 space-y-2">
              {hints.map((text, i) => (
                <li key={i} className="border-l-2 border-primary bg-primary/5 px-3 py-2 text-sm text-on-surface">
                  <span className="mr-2 font-label-mono text-[11px] uppercase text-primary">
                    {fill(copy.hintLabel, { step: i + 1 })}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onTakeHint}
              disabled={nextHint === null || busy}
              aria-describedby="locate-hint-cost"
              className="inline-flex cursor-pointer items-center gap-1.5 border border-primary/60 px-3 py-1.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sym name={hintLoading ? "progress_activity" : "lightbulb"} className={`text-[15px] ${hintLoading ? "animate-spin" : ""}`} />
              {hintLoading
                ? copy.hintLoading
                : nextHint === null
                  ? copy.noHintsLeft
                  : fill(copy.hintButton, { step: nextHint })}
            </button>
            <span id="locate-hint-cost" className="text-xs text-warning">
              {copy.hintCost}
            </span>
          </div>
        </section>

        {error && (
          <div role="alert" className="border border-error/40 bg-error/10 p-3 font-label-mono text-label-mono text-error">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pb-2">
          <button
            type="button"
            onClick={() => setConfirmSkip(true)}
            disabled={busy}
            className="cursor-pointer border border-outline-variant/60 px-4 py-2 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {copy.skip}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy || !canSubmitLocation(selected, reason)}
            className="inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? copy.submittingLocation : copy.submitLocation}
            {!submitting && <Sym name="my_location" className="text-[16px]" />}
          </button>
        </div>
      </div>

      {confirmSkip && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 px-5 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="skip-locate-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirmSkip(false);
            }}
            className="w-full max-w-sm border border-outline-variant/70 bg-surface-container-low p-6 shadow-card"
          >
            <h2 id="skip-locate-title" className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              {copy.skipTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{copy.skipBody}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmSkip(false)}
                className="cursor-pointer border border-outline-variant/60 px-4 py-2 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                {copy.skipCancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmSkip(false);
                  onSkip();
                }}
                className="cursor-pointer bg-primary px-4 py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
              >
                {copy.skipConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
