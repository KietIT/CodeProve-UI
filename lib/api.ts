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
