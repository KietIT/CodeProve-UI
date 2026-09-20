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
