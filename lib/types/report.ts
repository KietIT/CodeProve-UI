// `code` / `key` are stable identifiers the frontend localises from; the
// `note` / `step` / `title` / `desc` strings are English fallbacks (and the
// only data present on reports stored before localisation was added).
export type FeedbackItem = { axis: string; code?: string; note: string };

export type NotApplicableReason = "no_failure" | "no_ai_use" | "no_ai_code";

export type TimelineItem = {
  key?: "hypothesis" | "implementation" | "explain_back";
  coverage_pct?: number | null;
  explain_score?: number;
  step: string;
  title: string;
  desc: string;
  active: boolean;
};

export type ScoreAxis =
  | "understanding"
  | "hypothesis"
  | "prompting"
  | "verification"
  | "testing"
  | "debugging";

/** Rating-guide level of an axis (0 Not yet … 3 Strong); `null` = not applicable. */
export type AxisLevel = 0 | 1 | 2 | 3 | null;

/** Machine-readable evidence behind a level, for debugging; not student-facing. */
export type AxisEvidence = { evidence?: string | null; reason?: string | null };

export type TestCategory = "happy" | "boundary" | "edge" | "error" | "uncategorized";

export type FindingText = {
  what_happened: string;
  why_it_matters: string;
  how_to_improve: string;
  try_next: string;
};

export type Finding = {
  code: string;
  axis: ScoreAxis | "overall";
  kind: "strength" | "risk";
  /** Set on risks, `null` on strengths. */
  severity: "high" | "medium" | "low" | null;
  params: Record<string, unknown>;
  evidence: string;
  /** Plain text in `Diagnosis.locale`; render as text, never as HTML. */
  text: FindingText;
  next_exercise: string | null;
  source?: "llm" | "template";
  fallback_reason?: string;
};

export type Diagnosis = {
  version: number;
  locale: "vi" | "en";
  model?: string | null;
  /** Suggested next exercises; absent on reports rescored after the fact. */
  candidates?: string[];
  /** Already ranked: at most 3 risks (worst first), then at most 2 strengths. */
  findings: Finding[];
};

/** One failing test of the submit suite; strings are clipped to 300 chars by the backend. */
export type TestFailure = {
  description: string | null;
  category: TestCategory | null;
  hidden: boolean;
  input: string | null;
  expected: string | null;
  actual: string | null;
  error: string | null;
};

/** Counts returned right after Submit: categories only, never test inputs. */
export type SubmitSummary = {
  passed: number;
  total: number;
  hidden_passed: number;
  hidden_total: number;
  failed_categories: TestCategory[];
};

/** Full submit-suite result stored on the report. */
export type SubmitTests = SubmitSummary & { failures?: TestFailure[] };

/**
 * The locate step revealed after submit (P2.2). Line numbers are 1-based lines of
 * the starter as served (comments stripped).
 */
export type DebugReveal = {
  /** The real bug as groups of lines; several groups = several issues. */
  regions: number[][];
  selected: number[];
  /** `hit[i]`: whether the selection touched `regions[i]`. */
  hit: boolean[];
  hints_used: number;
  skipped: boolean;
  /** In the report's locale. */
  explanation: string;
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
    /** Axes the student had no opportunity to show, with the reason. Absent on older reports. */
    not_applicable?: Record<string, NotApplicableReason>;
    timeline?: TimelineItem[];
    // Engine v2 fields (P1.4 / P1.5); absent on reports scored by engine v1.
    engine?: string;
    levels?: Partial<Record<ScoreAxis, AxisLevel>>;
    evidence?: Partial<Record<ScoreAxis, AxisEvidence>>;
    diagnosis?: Diagnosis;
    /** Present when the exercise has a submit suite. */
    submit_tests?: SubmitTests;
    /** Debug exercises whose attempt has a location (P2.2); absent otherwise. */
    debug?: DebugReveal;
  };
  integrity_status: "green" | "yellow" | "red";
  timeline: TimelineItem[];
};
