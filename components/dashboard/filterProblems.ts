import type { ExerciseSummary } from "@/lib/types/exercise";

/** Sentinel for an inactive dropdown/pill filter ("all"). */
export const ALL = "__all__";

export type ProblemFilters = {
  search: string;
  difficulty: string;
  topic: string;
  level: string;
};

/**
 * Pure problem-list filter. All active criteria combine with AND:
 * difficulty, level, topic (membership) and a case-insensitive search over
 * title + code. Any criterion set to ALL is ignored. Kept separate from the
 * component so it can be unit-tested without React or the network.
 */
export function filterProblems(
  problems: ExerciseSummary[],
  { search, difficulty, topic, level }: ProblemFilters,
): ExerciseSummary[] {
  const q = search.trim().toLowerCase();
  return problems.filter((p) => {
    if (difficulty !== ALL && p.difficulty !== difficulty) return false;
    if (level !== ALL && p.level !== level) return false;
    if (topic !== ALL && !p.topics.includes(topic)) return false;
    if (q && !`${p.title} ${p.code}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
