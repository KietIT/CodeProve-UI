import { apiFetch } from "./client";
import type { ExerciseDetail, LevelGroup } from "@/lib/types/exercise";

export const getExercises = (level?: string): Promise<LevelGroup[]> =>
  apiFetch<LevelGroup[]>(`/exercises${level ? `?level=${level}` : ""}`);

export const getExerciseDetail = (code: string): Promise<ExerciseDetail> =>
  apiFetch<ExerciseDetail>(`/exercises/${code}`);
