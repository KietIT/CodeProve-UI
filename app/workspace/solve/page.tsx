import type { Metadata } from "next";
import { getExercise, getLevel, LEVELS } from "@/lib/exercises";
import { SolveWorkspace } from "@/components/app/SolveWorkspace";

type SearchParams = { id?: string; level?: string };

/** Resolve the chosen exercise, falling back to the first Fresher problem. */
function resolve(searchParams: SearchParams) {
  const found = getExercise(searchParams.id);
  if (found) return found;
  const fresher = LEVELS.fresher;
  return { exercise: fresher.exercises[0], level: fresher };
}

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const { exercise } = resolve(searchParams);
  return { title: `${exercise.title} · Solve` };
}

export default function SolvePage({ searchParams }: { searchParams: SearchParams }) {
  const { exercise, level } = resolve(searchParams);
  const backSlug = getLevel(searchParams.level)?.slug ?? level.slug;

  return (
    <SolveWorkspace
      code={exercise.id}
      level={backSlug}
      initialExercise={exercise}
      initialLevel={level}
    />
  );
}
