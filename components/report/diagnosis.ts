// Pure helpers over the engine v2 report fields (levels, diagnosis, submit
// tests). No React and only type imports, so node:test can load this file.
import type {
  AxisLevel,
  Diagnosis,
  Finding,
  ReportOut,
  SubmitTests,
  TestFailure,
} from "@/lib/types/report";

/** Splits findings by kind, keeping the backend ranking inside each group. */
export function splitFindings(diagnosis?: Diagnosis): { risks: Finding[]; strengths: Finding[] } {
  const findings = diagnosis?.findings ?? [];
  return {
    risks: findings.filter((f) => f.kind === "risk"),
    strengths: findings.filter((f) => f.kind === "strength"),
  };
}

/** The exercise to suggest next: the first candidate, else the first finding that names one. */
export function nextExercise(report: ReportOut): string | null {
  const diagnosis = report.feedback.diagnosis;
  if (!diagnosis) return null;
  const candidate = diagnosis.candidates?.[0];
  if (candidate) return candidate;
  return diagnosis.findings.find((f) => f.next_exercise)?.next_exercise ?? null;
}

/**
 * Level of one axis: 0-3, `null` when not applicable, `undefined` when the
 * report carries no level for it (engine v1 report or unknown axis).
 */
export function levelOf(report: ReportOut, axis: string): AxisLevel | undefined {
  const levels: Partial<Record<string, AxisLevel>> | undefined = report.feedback.levels;
  return levels?.[axis];
}

export function hiddenFailures(tests?: SubmitTests): TestFailure[] {
  return (tests?.failures ?? []).filter((f) => f.hidden);
}

export function visibleFailures(tests?: SubmitTests): TestFailure[] {
  return (tests?.failures ?? []).filter((f) => !f.hidden);
}

/** Link to the solve page of an exercise, same shape as the level list uses. */
export function exerciseHref(code: string): { pathname: "/solve"; query: { id: string } } {
  return { pathname: "/solve", query: { id: code } };
}

/** Fills `{name}` placeholders of a copy template; unknown names become empty. */
export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(params[k] ?? ""));
}
