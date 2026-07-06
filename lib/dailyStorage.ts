export type LocalDailyEntry = {
  date: string; // "YYYY-MM-DD", Asia/Ho_Chi_Minh calendar day - see todayVN()
  selected_line: number;
  hints_used: number;
  time_taken_seconds: number;
  tier: "green" | "yellow" | "red";
};

const HISTORY_KEY = "codeprove-daily-streak";

/** Today's date as "YYYY-MM-DD" in Asia/Ho_Chi_Minh, matching the backend's
 * today_vn() (codeprove-backend/app/features/daily/service.py) so an
 * anonymous player's local streak never disagrees with the server's once
 * claimed. en-CA gives ISO ordering (year-month-day) regardless of locale;
 * only formatToParts's labeled parts are used, so the locale choice itself
 * doesn't matter beyond that ordering guarantee. */
export function todayVN(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function loadHistory(): LocalDailyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalDailyEntry[]) : [];
  } catch {
    return [];
  }
}

/** Upserts today's entry (replacing any existing entry for the same date)
 * and caps the stored history at 60 days, matching the backend's
 * ClaimStreakIn max_length so a claim can never be rejected for being too
 * long. */
export function saveEntry(entry: LocalDailyEntry): void {
  if (typeof window === "undefined") return;
  const history = loadHistory().filter((e) => e.date !== entry.date);
  history.push(entry);
  const trimmed = history.slice(-60);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HISTORY_KEY);
}

/** Mirrors codeprove-backend/app/features/daily/streak.py::compute_streak
 * exactly: consecutive calendar days with a played entry, counting backward
 * from today if today was already played, otherwise from yesterday (a
 * streak survives an unplayed "today" and only breaks after a fully
 * skipped day). */
export function computeLocalStreak(history: LocalDailyEntry[], today: string): number {
  const dates = new Set(history.map((e) => e.date));
  const addDays = (iso: string, delta: number): string => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + delta);
    return d.toISOString().slice(0, 10);
  };
  let cursor = dates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
