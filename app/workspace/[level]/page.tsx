"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopNav, AppFooter, Sym } from "@/components/app/AppChrome";
import { LEVELS, TOPICS, type Difficulty, type Status } from "@/lib/exercises";

const DIFF_STYLE: Record<Difficulty, string> = {
  Easy: "text-emerald-500",
  Medium: "text-amber-500",
  Hard: "text-rose-500",
};

const STATUS_ICON: Record<Status, { name: string; fill: boolean; className: string; label: string }> = {
  solved: { name: "check_circle", fill: true, className: "text-emerald-500", label: "Solved" },
  attempted: { name: "pending", fill: true, className: "text-amber-500", label: "Attempted" },
  todo: { name: "radio_button_unchecked", fill: false, className: "text-on-surface-variant/40", label: "Not started" },
  locked: { name: "lock", fill: false, className: "text-on-surface-variant/40", label: "Locked" },
};

type SortKey = "default" | "acceptance" | "difficulty";

export default function LevelPicker({ params }: { params: { level: string } }) {
  const config = LEVELS[params.level?.toLowerCase() ?? ""];

  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All Topics");
  const [sort, setSort] = useState<SortKey>("default");

  const filtered = useMemo(() => {
    if (!config) return [];
    const diffRank: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };
    let list = config.exercises.filter((ex) => {
      const matchesQuery =
        ex.title.toLowerCase().includes(query.toLowerCase()) ||
        ex.id.toLowerCase().includes(query.toLowerCase());
      const matchesTopic = topic === "All Topics" || ex.topics.includes(topic);
      return matchesQuery && matchesTopic;
    });
    if (sort === "acceptance") list = [...list].sort((a, b) => b.acceptance - a.acceptance);
    if (sort === "difficulty") list = [...list].sort((a, b) => diffRank[a.difficulty] - diffRank[b.difficulty]);
    return list;
  }, [config, query, topic, sort]);

  if (!config) return notFound();

  const solvedCount = config.exercises.filter((e) => e.status === "solved").length;
  const total = config.exercises.length;
  const progress = Math.round((solvedCount / total) * 100);

  const pickRandom = () => {
    const pool = filtered.filter((e) => e.status !== "locked");
    if (pool.length === 0) return;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    const el = document.getElementById(`row-${choice.id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.animate(
      [{ backgroundColor: "rgb(var(--primary) / 0.18)" }, { backgroundColor: "rgb(var(--primary) / 0)" }],
      { duration: 1200, easing: "ease-out" },
    );
  };

  const cycleSort = () =>
    setSort((s) => (s === "default" ? "acceptance" : s === "acceptance" ? "difficulty" : "default"));

  return (
    <div className="flex min-h-screen flex-col bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="mx-auto w-full max-w-container-max flex-1 px-5 py-8 md:px-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 font-label-mono text-label-mono text-on-surface-variant/70">
          <Link href="/workspace" className="flex items-center gap-1 transition-colors hover:text-primary">
            <Sym name="arrow_back" className="text-[16px]" /> Training levels
          </Link>
          <span className="text-on-surface-variant/40">/</span>
          <span className="text-on-surface">{config.name}</span>
        </nav>

        {/* Level header */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
                {config.level} track
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-1.5 w-5 ${i < config.filled ? "bg-primary" : "bg-outline-variant/50"}`} />
                ))}
              </div>
            </div>
            <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">
              {config.name} exercises
            </h1>
            <p className="mt-3 max-w-xl text-on-surface-variant">{config.blurb}</p>
          </div>

          {/* Progress card */}
          <div className="ice-card flex min-w-[220px] flex-col gap-3 p-5">
            <div className="flex items-baseline justify-between">
              <span className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">Progress</span>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
                {solvedCount}
                <span className="text-on-surface-variant/50">/{total}</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-pill bg-surface-container-highest">
              <div
                className="animate-progress h-full rounded-pill bg-primary"
                style={{ ["--final-width" as string]: `${progress}%`, width: `${progress}%` }}
              />
            </div>
            <span className="font-label-mono text-label-mono text-on-surface-variant/60">{progress}% solved</span>
          </div>
        </header>

        {/* Topic chips */}
        <div className="ice-scroll -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
          {TOPICS.map((t) => {
            const active = topic === t;
            const count =
              t === "All Topics"
                ? config.exercises.length
                : config.exercises.filter((e) => e.topics.includes(t)).length;
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
                    active ? "bg-primary/20 text-primary" : "bg-surface-container-highest text-on-surface-variant/70"
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
                    <span className={`hidden text-right font-label-mono text-label-mono md:block ${DIFF_STYLE[ex.difficulty]}`}>
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
                    key={ex.id}
                    id={`row-${ex.id}`}
                    className="border-b border-outline-variant/40 last:border-b-0"
                  >
                    {locked ? (
                      <div className="group cursor-not-allowed" title="Unlock by completing earlier exercises">
                        {Row}
                      </div>
                    ) : (
                      <Link
                        href={{ pathname: "/workspace/solve", query: { id: ex.id, level: config.slug } }}
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
      </main>

      <AppFooter />
    </div>
  );
}
