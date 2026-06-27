const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Exercise API types ────────────────────────────────────────────────────────

export type ExerciseSummary = {
  id: number;
  num: number;
  code: string;
  title: string;
  difficulty: string;
  acceptance: number;
  topics: string[];
  level: string;
};

export type LevelGroup = {
  level: string;
  name: string;
  exercises: ExerciseSummary[];
};

export type ExerciseDetail = ExerciseSummary & {
  summary: string;
  language: string;
  starter: string;
  hint: string;
  tests: string[];
  rubric: [string, string][];
};

const TOKEN_KEY = "codeprove_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

type Opts = { method?: string; body?: unknown; auth?: boolean };

export async function apiFetch<T>(path: string, opts: Opts = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(detail.detail ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Exercise helpers ──────────────────────────────────────────────────────────

export const getExercises = (level?: string): Promise<LevelGroup[]> =>
  apiFetch<LevelGroup[]>(`/exercises${level ? `?level=${level}` : ""}`);

export const getExerciseDetail = (code: string): Promise<ExerciseDetail> =>
  apiFetch<ExerciseDetail>(`/exercises/${code}`);

// ── Attempt API types ─────────────────────────────────────────────────────────

export type RunCase = {
  name: string;
  passed: boolean;
  stdout: string;
  error: string | null;
};

export type RunResult = {
  passed: number;
  total: number;
  coverage: number;
  cases: RunCase[];
  runtime_error: string | null;
};

export type AttemptState = {
  id: number;
  exercise_code: string;
  status: string;
  score: number | null;
  latest_code: string | null;
};

// ── Attempt API helpers ───────────────────────────────────────────────────────

export const createAttempt = (exercise_code: string) =>
  apiFetch<{ attempt_id: number; started_at: string }>("/attempts", {
    method: "POST",
    body: { exercise_code },
  });

export const getAttempt = (id: number) =>
  apiFetch<AttemptState>(`/attempts/${id}`);

export const sendEvents = (id: number, events: unknown[]) =>
  apiFetch<{ ingested: number }>(`/attempts/${id}/events`, {
    method: "POST",
    body: { events },
  });

export const saveSnapshot = (id: number, version: number, source_code: string) =>
  apiFetch<{ ok: boolean }>(`/attempts/${id}/snapshots`, {
    method: "POST",
    body: { version, source_code },
  });

export const runTests = (id: number, source_code: string) =>
  apiFetch<RunResult>(`/attempts/${id}/run`, {
    method: "POST",
    body: { source_code, run_tests: true },
  });

export const sendMentor = (id: number, message: string) =>
  apiFetch<{ reply: string; injected_error: boolean }>(`/attempts/${id}/mentor`, {
    method: "POST",
    body: { message },
  });

export const logHypothesis = (id: number, text: string) =>
  apiFetch<{ correct: boolean; note: string }>(`/attempts/${id}/hypothesis`, {
    method: "POST",
    body: { text },
  });

// ── Report API types ──────────────────────────────────────────────────────────

export type ReportOut = {
  overall: number;
  tier: string;
  axes: Record<string, number | null>;
  axes_pct: Record<string, number | null>;
  feedback: {
    strengths: { axis: string; note: string }[];
    risks: { axis: string; note: string }[];
    per_axis: Record<string, { score: number; notes: string[] }>;
    timeline?: { step: string; title: string; desc: string; active: boolean }[];
  };
  integrity_status: "green" | "yellow" | "red";
  timeline: { step: string; title: string; desc: string; active: boolean }[];
};

// ── Report API helpers ────────────────────────────────────────────────────────

export const submitAttempt = (id: number) =>
  apiFetch<{ questions: string[] }>(`/attempts/${id}/submit`, { method: "POST" });

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
