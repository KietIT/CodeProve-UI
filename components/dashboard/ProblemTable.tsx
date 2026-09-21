"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Sym } from "@/components/app/AppChrome";
import { LevelBadge, type Level } from "@/components/ui/LevelBadge";
import { getExercises } from "@/lib/api";
import type { ExerciseSummary } from "@/lib/types/exercise";
import { ALL, filterProblems } from "@/components/dashboard/filterProblems";
import { useI18n } from "@/lib/i18n";

const copy = {
  vi: {
    searchPlaceholder: "Tìm theo tên hoặc mã bài…",
    all: "Tất cả",
    topic: "Chủ đề",
    level: "Cấp độ",
    colProblem: "Bài tập",
    colTopics: "Chủ đề",
    colLevel: "Cấp độ",
    colAcceptance: "Tỷ lệ đạt",
    colStatus: "Trạng thái",
    empty: "Không tìm thấy bài phù hợp.",
    loadFailed: "Không tải được danh sách bài tập.",
    retry: "Thử lại",
    count: (n: number) => `${n} bài tập`,
  },
  en: {
    searchPlaceholder: "Search by title or code…",
    all: "All",
    topic: "Topic",
    level: "Level",
    colProblem: "Problem",
    colTopics: "Topics",
    colLevel: "Level",
    colAcceptance: "Acceptance",
    colStatus: "Status",
    empty: "No problems match your filters.",
    loadFailed: "Could not load the problem list.",
    retry: "Retry",
    count: (n: number) => `${n} problems`,
  },
} as const;

/** Debounce a fast-changing value (search box) to avoid filtering on each key. */
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Map a free-form difficulty string onto a LevelBadge colour, defaulting safely. */
function difficultyLevel(difficulty: string): Level {
  const d = difficulty.toLowerCase();
  if (d.includes("eas") || d.includes("dễ")) return "Easy";
  if (d.includes("hard") || d.includes("khó")) return "Hard";
  return "Medium";
}

const statusTone: Record<string, string> = {
  solved: "text-primary",
  attempted: "text-warning",
  todo: "text-on-surface-variant",
};

export function ProblemTable() {
  const { locale } = useI18n();
  const c = copy[locale];

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => getExercises(),
  });

  // Flatten the level-grouped API response into a single problem list.
  const problems = useMemo<ExerciseSummary[]>(
    () => (data ?? []).flatMap((g) => g.exercises),
    [data],
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 300);
  const [difficulty, setDifficulty] = useState<string>(ALL);
  const [topic, setTopic] = useState<string>(ALL);
  const [level, setLevel] = useState<string>(ALL);

  // Distinct filter options, derived from the real data (no invented values).
  const difficulties = useMemo(
    () => Array.from(new Set(problems.map((p) => p.difficulty))).filter(Boolean),
    [problems],
  );
  const topics = useMemo(
    () => Array.from(new Set(problems.flatMap((p) => p.topics))).filter(Boolean).sort(),
    [problems],
  );
  const levels = useMemo(
    () => Array.from(new Set(problems.map((p) => p.level))).filter(Boolean).sort(),
    [problems],
  );

  // All filters combine with AND (see filterProblems).
  const filtered = useMemo(
    () => filterProblems(problems, { search: debouncedSearch, difficulty, topic, level }),
    [problems, debouncedSearch, difficulty, level, topic],
  );

  const selectCls =
    "rounded-xl border border-outline-variant/60 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary";

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Sym name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="w-full rounded-xl border border-outline-variant/60 bg-surface-container-low py-2 pl-10 pr-3 text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select aria-label={c.topic} value={topic} onChange={(e) => setTopic(e.target.value)} className={selectCls}>
            <option value={ALL}>{c.topic}: {c.all}</option>
            {topics.map((tp) => (
              <option key={tp} value={tp}>{tp}</option>
            ))}
          </select>
          <select aria-label={c.level} value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls}>
            <option value={ALL}>{c.level}: {c.all}</option>
            {levels.map((lv) => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty filter pills */}
      {difficulties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <FilterPill active={difficulty === ALL} onClick={() => setDifficulty(ALL)}>{c.all}</FilterPill>
          {difficulties.map((d) => (
            <FilterPill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>{d}</FilterPill>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="ice-card flex flex-col items-center gap-4 p-8 text-center">
          <Sym name="cloud_off" className="text-[40px] text-error" />
          <p className="text-error">{c.loadFailed}</p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 border border-primary px-5 py-2 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10"
          >
            <Sym name="refresh" className={`text-[18px] ${isFetching ? "animate-spin" : ""}`} />
            {c.retry}
          </button>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div className="ice-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-outline-variant/50 font-label-mono text-label-mono uppercase text-on-surface-variant/70">
                <tr>
                  <th className="px-5 py-3 font-medium">{c.colProblem}</th>
                  <th className="px-5 py-3 font-medium">{c.colTopics}</th>
                  <th className="px-5 py-3 font-medium">{c.colLevel}</th>
                  <th className="px-5 py-3 text-right font-medium">{c.colAcceptance}</th>
                  <th className="px-5 py-3 text-right font-medium">{c.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((p) => (
                      <tr key={p.code} className="group transition-colors hover:bg-surface-container/50">
                        <td className="px-5 py-3.5">
                          <Link
                            href={{ pathname: "/solve", query: { id: p.code, level: p.level } }}
                            className="flex flex-col"
                          >
                            <span className="font-medium text-on-surface group-hover:text-primary">
                              {p.num}. {p.title}
                            </span>
                            <span className="font-label-mono text-label-mono text-on-surface-variant/60">{p.code}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1.5">
                            {p.topics.slice(0, 3).map((tp) => (
                              <span key={tp} className="rounded-pill bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
                                {tp}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <LevelBadge level={difficultyLevel(p.difficulty)} label={p.difficulty} />
                        </td>
                        <td className="px-5 py-3.5 text-right font-label-mono text-label-mono text-on-surface-variant">
                          {Math.round(p.acceptance)}%
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {p.status ? (
                            <span className={`font-label-mono text-label-mono capitalize ${statusTone[p.status] ?? "text-on-surface-variant"}`}>
                              {p.status}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant/40">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Empty state (data loaded, nothing matches) */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-on-surface-variant">
              <Sym name="search_off" className="text-[40px] text-on-surface-variant/50" />
              <p>{c.empty}</p>
            </div>
          )}

          {/* Count footer */}
          {!isLoading && filtered.length > 0 && (
            <div className="border-t border-outline-variant/50 px-5 py-3 font-label-mono text-label-mono text-on-surface-variant/70">
              {c.count(filtered.length)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-pill px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-on-primary"
          : "border border-outline-variant/60 text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-3.5">
        <div className="h-4 w-40 rounded bg-surface-container-highest" />
        <div className="mt-2 h-3 w-16 rounded bg-surface-container-high" />
      </td>
      <td className="px-5 py-3.5"><div className="h-4 w-24 rounded bg-surface-container-highest" /></td>
      <td className="px-5 py-3.5"><div className="h-5 w-16 rounded-pill bg-surface-container-highest" /></td>
      <td className="px-5 py-3.5"><div className="ml-auto h-4 w-10 rounded bg-surface-container-highest" /></td>
      <td className="px-5 py-3.5"><div className="ml-auto h-4 w-14 rounded bg-surface-container-highest" /></td>
    </tr>
  );
}
