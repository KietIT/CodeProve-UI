/** The six report axes, in the order the dashboard radar uses. */
export const AXIS_KEYS = ["understanding", "hypothesis", "prompting", "verification", "testing", "debugging"] as const;
export type AxisKey = (typeof AXIS_KEYS)[number];

/** Elo rating of one skill. `rating` must never be shown to the student. */
export type LearnerSkill = { key: string; vi: string; en: string; rating: number; attempts: number };

export type RecurringIssue = {
  code: string;
  count: number;
  /** Practice phrase in the requested locale, lower case. Missing on backends before P3.5: hide the item. */
  practice?: string;
};

export type HistoryItem = {
  date: string;
  code: string;
  title: string;
  /** Overall score, 0..100. */
  overall: number;
  /** Axis levels 0..3 (null = not applicable); null for old v1 reports. */
  levels: Partial<Record<AxisKey, number | null>> | null;
};

/** `GET /api/learner/me` (P3.3/P3.5). See backend docs/api/learner.md. */
export type LearnerOut = {
  scored_attempts: number;
  /** Highest rating first. */
  skills: LearnerSkill[];
  /** Mean level 0..3 over the last `window` v2 reports; null = never applied. */
  axes: Record<AxisKey, number | null>;
  recurring: RecurringIssue[];
  /** Number of v2 reports used for `axes` and `recurring` (0..5). */
  window: number;
  /** Last 10 scored reports, oldest first. Missing on backends before P3.5 (treat as []). */
  history?: HistoryItem[];
  /** Written for the AI mentor only. Never render it. */
  brief: string;
};
