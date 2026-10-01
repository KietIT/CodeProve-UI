import { apiFetch } from "./client";
import type { LearnerOut } from "@/lib/types/learner";

/** The signed-in student's learner model. `locale` picks the language of `recurring[].practice`. */
export const getLearnerMe = (locale: "vi" | "en") => apiFetch<LearnerOut>(`/learner/me?locale=${locale}`);
