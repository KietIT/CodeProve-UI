const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
export const API_BASE = BASE.replace(/\/$/, "");

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

/** Thrown on a non-2xx response; carries the HTTP status for callers/UI. */
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // Keep instanceof reliable even when down-levelled below ES2015.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export type ApiFetchOptions = { method?: string; body?: unknown; auth?: boolean };

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
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
    throw new ApiError(formatApiError(detail, res.status), res.status);
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
