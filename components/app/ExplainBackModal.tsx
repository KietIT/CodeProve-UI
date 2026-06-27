"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { explainBack } from "@/lib/api";
import { Sym } from "@/components/app/AppChrome";

type Props = {
  attemptId: number;
  questions: string[];
  onClose: () => void;
};

export function ExplainBackModal({ attemptId, questions, onClose }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<string[]>(() => questions.map(() => ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAnswerChange(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await explainBack(
        attemptId,
        questions.map((question, i) => ({ question, answer: answers[i] ?? "" })),
      );
      router.push(`/feedback?attempt=${attemptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answers. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="ice-card relative flex w-full max-w-2xl flex-col gap-6 overflow-y-auto p-8 shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
              Explain-back
            </span>
            <h2 className="mt-1 font-headline-lg-mobile text-headline-lg-mobile">
              Verify your understanding
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Answer each question in your own words. Your explanations are used to assess
              genuine understanding.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex-none cursor-pointer text-on-surface-variant/60 transition-colors hover:text-on-surface"
          >
            <Sym name="close" className="text-[22px]" />
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={i}>
              <label className="mb-2 block font-label-mono text-label-mono text-on-surface">
                <span className="mr-2 text-primary">Q{i + 1}.</span>
                {q}
              </label>
              <textarea
                value={answers[i]}
                onChange={(e) => handleAnswerChange(i, e.target.value)}
                disabled={submitting}
                rows={4}
                className="w-full resize-none border border-outline-variant/60 bg-surface-container-lowest/50 p-3 font-label-mono text-label-mono text-on-surface outline-none transition-colors focus:border-primary disabled:opacity-50"
                placeholder="Type your explanation here…"
              />
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="border border-error/30 bg-error/5 p-3 font-label-mono text-label-mono text-error">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting || answers.some((a) => !a.trim())}
            className="flex cursor-pointer items-center gap-2 bg-primary px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit answers"}
            {!submitting && <Sym name="send" className="text-[16px]" />}
          </button>
          <button
            onClick={onClose}
            disabled={submitting}
            className="cursor-pointer border border-outline-variant/60 px-6 py-2.5 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
