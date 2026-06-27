"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sym } from "@/components/app/AppChrome";
import { LEVELS, TOPICS, type Difficulty, type Status } from "@/lib/exercises";
import { getExercises, type ExerciseSummary } from "@/lib/api";

// ── Display types ─────────────────────────────────────────────────────────────

/** Unified shape consumed by the exercise list UI. */
type DisplayExercise = {
  /** String key used for React keys, row ids, and the solve link. */
  code: string;
  num: number;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  topics: string[];
  status: Status;
};

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy: "text-emerald-500",
  Medium: "text-amber-500",
  Hard: "text-rose-500",
};

const STATUS_ICON: Record<
  Status,
  { name: string; fill: boolean; className: string; label: string }
> = {
  solved: { name: "check_circle", fill: true, className: "text-emerald-500", label: "Solved" },
  attempted: { name: "pending", fill: true, className: "text-amber-500", label: "Attempted" },
  todo: {
    name: "radio_button_unchecked",
    fill: false,
    className: "text-on-surface-variant/40",
    label: "Not started",
  },
  locked: { name: "lock", fill: false, className: "text-on-surface-variant/40", label: "Locked" },
};

type SortKey = "default" | "acceptance" | "difficulty";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert an API ExerciseSummary to a DisplayExercise, defaulting display-only fields. */
function fromApi(ex: ExerciseSummary): DisplayExercise {
  return {
    code: ex.code,
    num: ex.num,
    title: ex.title,
    difficulty: (ex.difficulty as Difficulty) ?? "Easy",
    acceptance: ex.acceptance,
    topics: ex.topics,
    status: "todo", // API does not include per-user status yet
  };
}

/** Build the fallback list from the static LEVELS map for a given level slug. */
function staticFallback(level: string): DisplayExercise[] {
  const config = LEVELS[level.toLowerCase()];
  if (!config) return [];
  return config.exercises.map((ex) => ({
    code: ex.id,
    num: ex.num,
    title: ex.title,
    difficulty: ex.difficulty,
    acceptance: ex.acceptance,
    topics: ex.topics,
    status: ex.status,
  }));
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LevelExercisesProps {
  level: string;
  levelSlug: string;
}

/**
 * Client component that fetches exercises from the API on mount.
 * Falls back to the static LEVELS data from lib/exercises.ts when the
 * backend is unreachable, so the page still renders offline / during dev.
 */
export default function LevelExercises({ level, levelSlug }: LevelExercisesProps) {
  const [exercises, setExercises] = useState<DisplayExercise[]>(() => staticFallback(levelSlug));

  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All Topics");
  const [sort, setSort] = useState<SortKey>("default");

  useEffect(() => {
    getExercises(level)
      .then((groups) => {
        const group = groups.find((g) => g.level.toLowerCase() === level.toLowerCase());
        if (group) {
          setExercises(group.exercises.map(fromApi));
        }
      })
      .catch(() => {
        // Network unavailable — keep the static fallback already in state.
      });
  }, [level]);

  const filtered = useMemo(() => {
    const diffRank: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };
    let list = exercises.filter((ex) => {
      const matchesQuery =
        ex.title.toLowerCase().includes(query.toLowerCase()) ||
        ex.code.toLowerCase().includes(query.toLowerCase());
      const matchesTopic = topic === "All Topics" || ex.topics.includes(topic);
      return matchesQuery && matchesTopic;
    });
    if (sort === "acceptance") list = [...list].sort((a, b) => b.acceptance - a.acceptance);
    if (sort === "difficulty")
      list = [...list].sort((a, b) => diffRank[a.difficulty] - diffRank[b.difficulty]);
    return list;
  }, [exercises, query, topic, sort]);

  const solvedCount = exercises.filter((e) => e.status === "solved").length;
  const total = exercises.length;

  const pickRandom = () => {
    const pool = filtered.filter((e) => e.status !== "locked");
    if (pool.length === 0) return;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    const el = document.getElementById(`row-${choice.code}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.animate(
      [
        { backgroundColor: "rgb(var(--primary) / 0.18)" },
        { backgroundColor: "rgb(var(--primary) / 0)" },
      ],
      { duration: 1200, easing: "ease-out" },
    );
  };

  const cycleSort = () =>
    setSort((s) =>
      s === "default" ? "acceptance" : s === "acceptance" ? "difficulty" : "default",
    );

  return (
    <>
      {/* Topic chips */}
      <div className="ice-scroll -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
        {TOPICS.map((t) => {
          const active = topic === t;
          const count =
            t === "All Topics"
              ? exercises.length
              : exercises.filter((e) => e.topics.includes(t)).length;
          return (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`flex flex-none cursor-pointer items-center gap-2 rounded-pill border px-3.5 py-1.5 font-label-mono text-label-mono transition-colors ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-outline-variant/70 text-on-surface-variant hover:border-primary/60 hover:text-on-surface"
              }`}
            >
              {t}
              <span
                className={`rounded-pill px-1.5 text-[11px] ${
                  active
                    ? "bg-primary/20 text-primary"
                    : "bg-surface-container-highest text-on-surface-variant/70"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-pill border border-outline-variant/70 bg-surface-container-low px-3 py-2 focus-within:border-primary">
          <Sym name="search" className="text-[20px] text-on-surface-variant" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent font-label-mono text-label-mono text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
            placeholder="Search exercises…"
            type="text"
            aria-label="Search exercises"
          />
        </div>
        <button
          onClick={cycleSort}
          title={`Sort: ${sort}`}
          aria-label={`Sort by ${sort}`}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-pill border border-outline-variant/70 px-3 font-label-mono text-label-mono text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <Sym name="swap_vert" className="text-[18px]" />
          <span className="hidden capitalize sm:inline">{sort === "default" ? "Sort" : sort}</span>
        </button>
        <button
          onClick={pickRandom}
          aria-label="Pick a random exercise"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-pill border border-outline-variant/70 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <Sym name="shuffle" className="text-[18px]" />
        </button>
        <span className="ml-auto flex items-center gap-2 font-label-mono text-label-mono text-on-surface-variant/70">
          <Sym name="trophy" className="text-[16px] text-primary" />
          {solvedCount}/{total} Solved
        </span>
      </div>

      {/* Exercise list */}
      <section className="ice-card overflow-hidden">
        {/* Column headers */}
        <div className="hidden grid-cols-[40px_1fr_110px_90px_44px] items-center gap-4 border-b border-outline-variant/60 px-5 py-3 font-label-mono text-label-mono uppercase tracking-wider text-on-surface-variant/60 md:grid">
          <span>#</span>
          <span>Title</span>
          <span className="text-right">Acceptance</span>
          <span className="text-right">Level</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <Sym name="search_off" className="text-[32px] text-on-surface-variant/50" />
            <p className="text-on-surface-variant">No exercises match your filters.</p>
          </div>
        ) : (
          <ul>
            {filtered.map((ex, i) => {
              const st = STATUS_ICON[ex.status];
              const locked = ex.status === "locked";
              const Row = (
                <div
                  className={`grid grid-cols-[28px_1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors md:grid-cols-[40px_1fr_110px_90px_44px] ${
                    i % 2 === 1 ? "bg-surface-container-low/40" : ""
                  } ${locked ? "opacity-60" : "hover:bg-primary/[0.06]"}`}
                >
                  {/* Status */}
                  <span className="flex items-center justify-center" title={st.label}>
                    <Sym name={st.name} fill={st.fill} className={`text-[20px] ${st.className}`} />
                  </span>
                  {/* Title */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-body-md text-body-md text-on-surface">
                        {ex.num}. {ex.title}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 md:hidden">
                      <span className={`font-label-mono text-label-mono ${DIFF_STYLE[ex.difficulty]}`}>
                        {ex.difficulty}
                      </span>
                      <span className="font-label-mono text-label-mono text-on-surface-variant/60">
                        {ex.acceptance}%
                      </span>
                    </div>
                    <div className="mt-1 hidden flex-wrap gap-1.5 md:flex">
                      {ex.topics.map((t) => (
                        <span
                          key={t}
                          className="rounded-pill bg-surface-container-highest px-2 py-0.5 font-label-mono text-[11px] text-on-surface-variant/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Acceptance */}
                  <span className="hidden text-right font-label-mono text-label-mono text-on-surface-variant md:block">
                    {ex.acceptance}%
                  </span>
                  {/* Difficulty */}
                  <span
                    className={`hidden text-right font-label-mono text-label-mono md:block ${DIFF_STYLE[ex.difficulty]}`}
                  >
                    {ex.difficulty}
                  </span>
                  {/* Trailing */}
                  <span className="flex items-center justify-end">
                    {locked ? (
                      <Sym name="lock" className="text-[16px] text-on-surface-variant/40" />
                    ) : (
                      <Sym
                        name="chevron_right"
                        className="text-[20px] text-on-surface-variant/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    )}
                  </span>
                </div>
              );

              return (
                <li
                  key={ex.code}
                  id={`row-${ex.code}`}
                  className="border-b border-outline-variant/40 last:border-b-0"
                >
                  {locked ? (
                    <div
                      className="group cursor-not-allowed"
                      title="Unlock by completing earlier exercises"
                    >
                      {Row}
                    </div>
                  ) : (
                    <Link
                      href={{ pathname: "/workspace/solve", query: { id: ex.code, level: levelSlug } }}
                      className="group block cursor-pointer"
                    >
                      {Row}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-4 text-center font-label-mono text-label-mono text-on-surface-variant/50">
        Showing {filtered.length} of {total} exercises · more sets being curated
      </p>
    </>
  );
}
