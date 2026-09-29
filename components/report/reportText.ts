// Localised text for the older report fields (strength/risk notes, timeline).
// Built from stable `code` / `key` identifiers only; the English `note` /
// `step` / `title` / `desc` strings are shown as stored, never parsed.
import type { FeedbackItem, TimelineItem } from "@/lib/types/report";
import { fill } from "./diagnosis";

export type TimelineKey = NonNullable<TimelineItem["key"]>;

export type NotesCopy = { notes: Readonly<Record<string, string>> };

export type TimelineCopy = {
  timelineSteps: Readonly<Record<TimelineKey, string>>;
  timelineTitles: Readonly<Record<TimelineKey, string>>;
  timelineDesc: {
    hypothesisYes: string;
    hypothesisNo: string;
    coverage: string;
    noTests: string;
    explain: string;
    explainLevel: string;
  };
};

export function noteText(item: FeedbackItem, axisName: string, copy: NotesCopy): string {
  const template = item.code ? copy.notes[item.code] : undefined;
  if (!template) return item.note;
  return fill(template, { axis: axisName, axisLower: axisName.toLowerCase() });
}

/** `explainLevel` is the understanding level name (engine v2); it replaces the x/20 score. */
export function timelineText(
  t: TimelineItem,
  copy: TimelineCopy,
  explainLevel?: string,
): { step: string; title: string; desc: string } {
  if (!t.key) return { step: t.step, title: t.title, desc: t.desc };
  return { step: copy.timelineSteps[t.key], title: copy.timelineTitles[t.key], desc: timelineDesc(t, copy, explainLevel) };
}

function timelineDesc(t: TimelineItem, copy: TimelineCopy, explainLevel?: string): string {
  const d = copy.timelineDesc;
  switch (t.key) {
    case "hypothesis":
      return t.active ? d.hypothesisYes : d.hypothesisNo;
    case "implementation":
      if (!t.active) return d.noTests;
      return t.coverage_pct != null ? fill(d.coverage, { pct: t.coverage_pct }) : t.desc;
    case "explain_back":
      if (explainLevel) return fill(d.explainLevel, { level: explainLevel });
      return t.explain_score != null ? fill(d.explain, { score: t.explain_score }) : t.desc;
    default:
      return t.desc;
  }
}
