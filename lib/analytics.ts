// Google Analytics 4 helpers. gtag.js is loaded by <GoogleAnalytics> in app/layout.tsx
// only when NEXT_PUBLIC_GA_ID is set, and ad blockers can remove it, so every call here
// is best-effort and never throws. `purchase` is not sent from the browser: the backend
// reports it when the SePay webhook confirms the payment (docs/analytics/ga4.md).

type GtagParams = Record<string, string | number | boolean | undefined>;
type GtagField = "client_id" | "session_id";
type GtagValue = string | number | undefined;

type Gtag = {
  (command: "event", name: string, params?: GtagParams): void;
  (command: "get", targetId: string, field: GtagField, callback: (value: GtagValue) => void): void;
};

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export type GaIds = { ga_client_id?: string; ga_session_id?: number };

/** If gtag.js is blocked the inline `gtag` stub still exists but never calls back. */
const GA_GET_TIMEOUT_MS = 1000;

function currentGtag(): Gtag | undefined {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return undefined;
  return window.gtag;
}

/** Sends a GA4 event; a no-op when gtag is missing (no GA id, ad blocker, server render). */
export function trackEvent(name: string, params: GtagParams = {}): void {
  const gtag = currentGtag();
  if (!gtag) return;
  try {
    gtag("event", name, params);
  } catch {
    // Analytics must never break the page.
  }
}

function readField(gtag: Gtag, gaId: string, field: GtagField, timeoutMs: number): Promise<GtagValue> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), timeoutMs);
    try {
      gtag("get", gaId, field, (value) => {
        clearTimeout(timer);
        resolve(value);
      });
    } catch {
      clearTimeout(timer);
      resolve(undefined);
    }
  });
}

/**
 * The browser's GA client and session ids, sent with checkout so the server-side
 * `purchase` is credited to the visit (and UTM source) that brought the buyer.
 * Resolves to `{}` when GA is off or blocked; fields that cannot be read are left out.
 */
export async function getGaIds(
  gaId: string | undefined = process.env.NEXT_PUBLIC_GA_ID,
  timeoutMs: number = GA_GET_TIMEOUT_MS,
): Promise<GaIds> {
  const gtag = currentGtag();
  if (!gaId || !gtag) return {};
  const [clientId, sessionId] = await Promise.all([
    readField(gtag, gaId, "client_id", timeoutMs),
    readField(gtag, gaId, "session_id", timeoutMs),
  ]);
  const ids: GaIds = {};
  if (typeof clientId === "string" && clientId) ids.ga_client_id = clientId;
  const session = Number(sessionId);
  if (sessionId !== undefined && sessionId !== "" && Number.isSafeInteger(session) && session > 0) {
    ids.ga_session_id = session;
  }
  return ids;
}
