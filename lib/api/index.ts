// Barrel for the data layer. `@/lib/api` resolves here, so every existing
// import keeps working while the implementation lives in focused modules.
// This folder is the single boundary with the backend - components import
// from here (or from the query hooks), never call fetch directly.

export * from "./client";
export * from "./auth";
export * from "./exercises";
export * from "./attempts";
export * from "./ciel";
export * from "./report";
export * from "./dashboard";

// Re-export the domain types so `@/lib/api` stays a one-stop import.
export type { User, Me, AuthOut } from "@/lib/types/auth";
export type { ExerciseSummary, LevelGroup, ExerciseDetail } from "@/lib/types/exercise";
export type { RunCase, RunResult, AttemptState } from "@/lib/types/attempt";
export type { MentorRequest, MentorReply } from "@/lib/types/ciel";
export type { FeedbackItem, TimelineItem, ReportOut } from "@/lib/types/report";
export type { DashboardOut } from "@/lib/types/dashboard";
export type { PromptLogEntry } from "@/lib/types/session";
