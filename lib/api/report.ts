import { apiFetch } from "./client";
import type { ReportOut, SubmitSummary } from "@/lib/types/report";

export type SubmitOut = {
  questions: string[];
  /** Submit-suite counts; `null` when the exercise has no suite. */
  tests?: SubmitSummary | null;
};

export const submitAttempt = (id: number, locale: string = "en") =>
  apiFetch<SubmitOut>(`/attempts/${id}/submit?locale=${locale}`, { method: "POST" });

export const explainBack = (
  id: number,
  answers: { question: string; answer: string }[],
) =>
  apiFetch<ReportOut>(`/attempts/${id}/explain-back`, {
    method: "POST",
    body: { answers },
  });

export const getReport = (id: number) =>
  apiFetch<ReportOut>(`/attempts/${id}/report`);
