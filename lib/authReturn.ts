/** Where to send the student after sign-in when they were sent to log in from another page (e.g. pricing). */
const KEY = "codeprove_return_to";

/** Only same-site paths are kept, so a stored value can never send the student to another site. */
function safePath(path: string | null): string | null {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : null;
}

export function rememberReturn(path: string): void {
  try {
    if (safePath(path)) sessionStorage.setItem(KEY, path);
  } catch {
    // storage unavailable: sign-in falls back to the dashboard
  }
}

/** The remembered path (read once), or `fallback`. */
export function takeReturn(fallback = "/dashboard"): string {
  try {
    const path = safePath(sessionStorage.getItem(KEY));
    sessionStorage.removeItem(KEY);
    return path ?? fallback;
  } catch {
    return fallback;
  }
}
