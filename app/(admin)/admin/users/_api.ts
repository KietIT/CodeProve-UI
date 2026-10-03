export type Learner = {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  last_attempt_at: string | null;
  attempts: number;
  completed: number;
  average_score: number | null;
};

export type LearnerPage = {
  items: Learner[];
  total: number;
  limit: number;
  offset: number;
};

export function formatAdminDate(value: string | null, locale: "vi" | "en") {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}
