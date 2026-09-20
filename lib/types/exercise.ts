export type ExerciseSummary = {
  id: number;
  num: number;
  code: string;
  title: string;
  difficulty: string;
  acceptance: number;
  topics: string[];
  level: string;
  /** Per-user progress from the backend: "solved" | "attempted" | "todo". */
  status?: string;
};

export type LevelGroup = {
  level: string;
  name: string;
  exercises: ExerciseSummary[];
};

export type ExerciseDetail = ExerciseSummary & {
  /** "debug" = buggy starter shown verbatim; "implement" = starter is a stub. */
  kind?: "implement" | "debug";
  summary: string;
  language: string;
  starter: string;
  hint: string;
  tests: string[];
  rubric: [string, string][];
};
