import { apiFetch } from "./client";
import type { ReportOut } from "@/lib/types/report";

export const submitAttempt = (id: number, locale: string = "en") =>
  apiFetch<{ questions: string[] }>(`/attempts/${id}/submit?locale=${locale}`, { method: "POST" });

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
