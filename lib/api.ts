const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const API_BASE = BASE.replace(/\/$/, "");

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
  /** Per-user progress from the backend: "solved" | "attempted" | "todo". */
  status?: string;
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
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(formatApiError(detail, res.status));
  }
  return res.json() as Promise<T>;
}

function formatApiError(payload: unknown, status: number): string {
  if (!payload || typeof payload !== "object") return `Request failed: ${status}`;
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const msg = (item as { msg?: unknown }).msg;
        const loc = (item as { loc?: unknown }).loc;
        const field = Array.isArray(loc) ? loc[loc.length - 1] : null;
        if (typeof msg !== "string") return null;
        return typeof field === "string" ? `${field}: ${msg}` : msg;
      })
      .filter(Boolean);
    if (messages.length > 0) return messages.join(". ");
  }
  return `Request failed: ${status}`;
}

// ── Account helpers ───────────────────────────────────────────────────────────

export type Me = { id: number; full_name: string; email: string; avatar?: string | null };

export const getMe = (): Promise<Me> => apiFetch<Me>("/auth/me");

export const updateMe = (data: { full_name?: string; avatar?: string | null }): Promise<Me> =>
  apiFetch<Me>("/auth/me", { method: "PATCH", body: data });

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

export const sendMentor = (id: number, message: string, code?: string) =>
  apiFetch<{ reply: string; injected_error: boolean }>(`/attempts/${id}/mentor`, {
    method: "POST",
    body: { message, code },
  });

export const logHypothesis = (id: number, text: string) =>
  apiFetch<{ correct: boolean; note: string }>(`/attempts/${id}/hypothesis`, {
    method: "POST",
    body: { text },
  });

// ── Report API types ──────────────────────────────────────────────────────────

// `code` / `key` are stable identifiers the frontend localises from; the
// `note` / `step` / `title` / `desc` strings are English fallbacks (and the
// only data present on reports stored before localisation was added).
export type FeedbackItem = { axis: string; code?: string; note: string };
export type TimelineItem = {
  key?: "hypothesis" | "implementation" | "explain_back";
  coverage_pct?: number | null;
  explain_score?: number;
  step: string;
  title: string;
  desc: string;
  active: boolean;
};

export type ReportOut = {
  overall: number;
  tier: string;
  axes: Record<string, number | null>;
  axes_pct: Record<string, number | null>;
  feedback: {
    strengths: FeedbackItem[];
    risks: FeedbackItem[];
    per_axis: Record<string, { score: number; notes: string[] }>;
    timeline?: TimelineItem[];
  };
  integrity_status: "green" | "yellow" | "red";
  timeline: TimelineItem[];
};

// ── Report API helpers ────────────────────────────────────────────────────────

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

// ── Dashboard API types ───────────────────────────────────────────────────────

export type DashboardOut = {
  kpis: { completed: number; streak: number; avg_score: number };
  radar: { name: string; value: number }[];
  trend: number[];
  recent: { title: string; meta: string; status: string; score: number | null; ok: boolean }[];
};

// ── Dashboard API helpers ─────────────────────────────────────────────────────

export const getDashboard = () => apiFetch<DashboardOut>("/dashboard");
