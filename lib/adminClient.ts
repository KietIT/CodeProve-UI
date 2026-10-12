export type AdminAccount = {
  id: number;
  full_name: string;
  email: string;
  role: "admin" | "super_admin";
  is_active: boolean;
  must_change_password: boolean;
  last_login_at: string | null;
};

export function isAdminLoginId(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@codeprove.production");
}

/** The text of a failed admin request: a plain `detail`, validation issues, or a coded error's own message. */
export function adminErrorMessage(payload: unknown, status: number): string {
  const detail = payload && typeof payload === "object" && "detail" in payload ? (payload as { detail: unknown }).detail : null;
  const issues = detail && typeof detail === "object" && "errors" in detail
    ? (detail as { errors: unknown }).errors : null;
  const coded = detail && typeof detail === "object" && !Array.isArray(detail)
    ? (detail as { message_vi?: unknown; message_en?: unknown }) : null;
  const vietnamese = typeof document !== "undefined" && document.documentElement.lang === "vi";
  const codedText = coded ? (vietnamese ? coded.message_vi : coded.message_en) ?? coded.message_en ?? coded.message_vi : null;
  return typeof detail === "string" ? detail
    : Array.isArray(issues) ? issues.map(String).join("; ")
    : Array.isArray(detail) ? detail.map((issue) => issue && typeof issue === "object" && "msg" in issue ? String(issue.msg) : String(issue)).join("; ")
    : typeof codedText === "string" && codedText ? codedText
    : `Request failed (${status})`;
}

export async function adminRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api/admin-gateway${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    throw new Error(adminErrorMessage(payload, response.status));
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
