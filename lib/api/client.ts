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

/**
 * Thrown on a non-2xx response; carries the HTTP status for callers/UI, the
 * parsed `detail` (string, validation array or object) and, when the server
 * sent one, the `Retry-After` header in seconds.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail?: unknown;
  readonly retryAfter?: number;
  constructor(message: string, status: number, detail?: unknown, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.retryAfter = retryAfter;
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
    const payload: unknown = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = payload && typeof payload === "object" ? (payload as { detail?: unknown }).detail : undefined;
    // `headers` is optional chained for minimal fetch stand-ins (tests, mocks).
    const retryAfter = parseRetryAfter(res.headers?.get("Retry-After") ?? null);
    throw new ApiError(formatApiError(payload, res.status), res.status, detail, retryAfter);
  }
  return res.json() as Promise<T>;
}

/** `Retry-After` in whole seconds; our backend never sends the HTTP-date form. */
export function parseRetryAfter(header: string | null): number | undefined {
  if (header == null || header.trim() === "") return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : undefined;
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
  const limit = readLimitDetail(detail);
  if (limit) return limit.message_en;
  return `Request failed: ${status}`;
}

/** Codes the backend sends with a 429 when a cost limit (P3.6) is reached. */
export type LimitCode = "ciel_attempt_limit" | "ciel_daily_limit" | "hypothesis_limit" | "rate_limited";

/** Object `detail` of a limit response; the messages are ready to show as-is. */
export type LimitDetail = { code: LimitCode; message_vi: string; message_en: string };

const LIMIT_CODES: readonly string[] = ["ciel_attempt_limit", "ciel_daily_limit", "hypothesis_limit", "rate_limited"];

/** Reads `{code, message_vi, message_en}` from a raw `detail`, or `null` when it is not one. */
export function readLimitDetail(detail: unknown): LimitDetail | null {
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) return null;
  const { code, message_vi, message_en } = detail as Record<string, unknown>;
  if (typeof code !== "string" || !LIMIT_CODES.includes(code)) return null;
  if (typeof message_vi !== "string" || typeof message_en !== "string") return null;
  return { code: code as LimitCode, message_vi, message_en };
}

/** The limit detail carried by a thrown error, or `null` for any other error. */
export function limitErrorOf(err: unknown): LimitDetail | null {
  return err instanceof ApiError ? readLimitDetail(err.detail) : null;
}
