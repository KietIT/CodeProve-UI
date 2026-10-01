// Pure view-model helpers for the Progress page. Ratings are only ever turned
// into a bar width and a word here; the raw number never reaches the UI.
import type { LearnerSkill, RecurringIssue } from "@/lib/types/learner";

export type SkillBand = "good" | "average" | "practice";

const RATING_MIN = 800;
const RATING_MAX = 1200;
/** Below this many scored attempts a skill is not rated (same rule as the backend brief). */
export const MIN_RATED_ATTEMPTS = 2;

/** Bar width in percent: 800..1200 maps to 0..100, clamped. */
export function ratingPercent(rating: number): number {
  const pct = ((rating - RATING_MIN) / (RATING_MAX - RATING_MIN)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function ratingBand(rating: number): SkillBand {
  if (rating >= 1050) return "good";
  if (rating < 950) return "practice";
  return "average";
}

/** Splits skills into rated (bar) and not-enough-data lists, keeping the backend order. */
export function splitSkills(skills: LearnerSkill[]): { rated: LearnerSkill[]; unrated: LearnerSkill[] } {
  return {
    rated: skills.filter((s) => s.attempts >= MIN_RATED_ATTEMPTS),
    unrated: skills.filter((s) => s.attempts < MIN_RATED_ATTEMPTS),
  };
}

export const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * "<Practice> (count/window bài)". Items without a practice phrase (backends
 * before P3.5) are dropped. An empty `unit` gives "(count/window)".
 */
export function recurringLines(items: RecurringIssue[], window: number, unit: string): { code: string; text: string }[] {
  const suffix = unit ? ` ${unit}` : "";
  return items.flatMap((item) => {
    const practice = item.practice?.trim();
    if (!practice) return [];
    return [{ code: item.code, text: `${capitalise(practice)} (${item.count}/${window}${suffix})` }];
  });
}

export type ChartPoint = { index: number; x: number; y: number; value: number };

/**
 * Lays out a series on an SVG box. `null` values are gaps: the line breaks
 * there instead of dropping to zero. Returns one path with a fresh "M" per run
 * of present values, plus the points for dots. Single points get only a dot.
 */
export function seriesPath(
  values: (number | null)[],
  box: { width: number; height: number; padX: number; padY: number; max: number },
): { d: string; points: ChartPoint[] } {
  const { width, height, padX, padY, max } = box;
  const innerW = width - 2 * padX;
  const innerH = height - 2 * padY;
  const xAt = (i: number) => (values.length < 2 ? width / 2 : padX + (i / (values.length - 1)) * innerW);
  const yAt = (v: number) => height - padY - (Math.min(Math.max(v, 0), max) / max) * innerH;

  const points: ChartPoint[] = [];
  let d = "";
  let prevPresent = false;
  values.forEach((value, index) => {
    if (value === null || !Number.isFinite(value)) {
      prevPresent = false;
      return;
    }
    const x = xAt(index);
    const y = yAt(value);
    points.push({ index, x, y, value });
    d += `${d ? " " : ""}${prevPresent ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    prevPresent = true;
  });
  return { d, points };
}
