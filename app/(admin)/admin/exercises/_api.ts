export type WorkflowStatus = "draft" | "review" | "approved" | "published";

export type DraftTest = {
  description: string; input: string; expected: string;
  category: "happy" | "boundary" | "edge" | "error"; hidden: boolean;
};

export type DraftMutant = {
  code: string; bug_line: number; bug_type: string; note_vi: string; note_en: string;
};

export type DebugBlock = {
  regions?: number[][] | null; explanation_vi: string; explanation_en: string;
  hint_vi: string; hint_en: string;
};

export type DraftPayload = {
  code: string; title: string; difficulty: "Easy" | "Medium" | "Hard";
  category: string; level: "fresher" | "junior" | "senior";
  kind: "implement" | "debug"; language: string;
  description: string; learning_objective: string; domain_keywords: string[];
  summary: string; starter_code: string; hint: string; reference_solution: string;
  tests: DraftTest[]; mutants: DraftMutant[]; skills: string[];
  debug: DebugBlock | null; limits: { min_hidden: number; reason: string } | null;
};

export type ExerciseRecord = {
  code: string; payload: DraftPayload; status: WorkflowStatus; revision: number | null;
  author_user_id: number | null; reviewer_user_id: number | null; updated_at: string;
};

export type ExerciseSummary = {
  code: string; title: string; difficulty: string; level: string; kind: string;
  status: WorkflowStatus; revision: number | null; updated_at: string;
};

export type ExercisePage = { total: number; items: ExerciseSummary[] };

export const blankPayload = (code: string, title: string): DraftPayload => ({
  code, title, difficulty: "Easy", category: "Algorithms", level: "fresher",
  kind: "implement", language: "python", description: "", learning_objective: "",
  domain_keywords: [], summary: "", starter_code: "", hint: "", reference_solution: "",
  tests: [], mutants: [], skills: [], debug: null, limits: null,
});
