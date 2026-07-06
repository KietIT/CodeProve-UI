import { apiFetch } from "@/lib/api";

export type DailyResult = {
  correct: boolean;
  tier: "green" | "yellow" | "red";
  buggy_line: number;
  explanation: string;
  hints_used: number;
  time_taken_seconds: number;
};

export type DailyChallenge = {
  challenge_number: number;
  prompt_title: string;
  buggy_code: string;
  hint_1: string;
  hint_2: string;
  already_played: boolean;
  result: DailyResult | null;
};

export type DailyAttemptResult = {
  correct: boolean;
  tier: "green" | "yellow" | "red";
  buggy_line: number;
  explanation: string;
  streak: number | null;
};

export type ClaimHistoryItem = {
  date: string;
  selected_line: number;
  hints_used: number;
  time_taken_seconds: number;
};

export async function fetchToday(): Promise<DailyChallenge> {
  return apiFetch<DailyChallenge>("/daily/today");
}

export async function submitAttempt(input: {
  selected_line: number;
  hints_used: number;
  time_taken_seconds: number;
}): Promise<DailyAttemptResult> {
  return apiFetch<DailyAttemptResult>("/daily/attempt", { method: "POST", body: input });
}

export async function claimStreak(history: ClaimHistoryItem[]): Promise<{ streak: number }> {
  return apiFetch<{ streak: number }>("/daily/claim-streak", { method: "POST", body: { history } });
}
