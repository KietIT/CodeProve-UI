export type RunCase = {
  name: string;
  passed: boolean;
  stdout: string;
  error: string | null;
};

export type RunResult = {
  passed: number;
  total: number;
  coverage: number;
  cases: RunCase[];
  runtime_error: string | null;
};

export type AttemptState = {
  id: number;
  exercise_code: string;
  status: string;
  score: number | null;
  latest_code: string | null;
};
