/** An exercise skill tag with labels in both languages. */
export type SkillTag = { key: string; vi: string; en: string };

/** One next-exercise suggestion from the learner model (P3.4). No success chance is sent. */
export type RecommendedExercise = {
  code: string;
  title: string;
  /** "fresher" | "junior" | "senior" */
  level: string;
  /** "implement" | "debug" */
  kind: string;
  skills: SkillTag[];
  /** Keys of `skills` that are among the student's weak skills; may be empty. */
  reason_skills: string[];
};

export type DashboardOut = {
  kpis: { completed: number; streak: number; avg_score: number };
  /** `value` is null when the axis was never observed across the user's reports. */
  radar: { name: string; value: number | null }[];
  trend: number[];
  recent: { title: string; meta: string; status: string; score: number | null; ok: boolean }[];
  /** 0..3 items, best first. Optional: older backends do not send it (treat as []). */
  recommended?: RecommendedExercise[];
};
