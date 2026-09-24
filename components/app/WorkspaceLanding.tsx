"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sym } from "@/components/app/AppChrome";
import { getExercises, getDashboard } from "@/lib/api";
import type { ExerciseSummary } from "@/lib/types/exercise";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";

const business = ["FinTech", "HealthTech", "Logistics", "Classified"];
const LEVEL_ORDER = ["fresher", "junior", "senior"] as const;
const LEVEL_DIFFICULTY: Record<string, "Easy" | "Medium" | "Hard"> = { fresher: "Easy", junior: "Medium", senior: "Hard" };

// Coaching line per Fluency axis (the radar measures HOW you solve, so this is
// advice, not a per-problem filter - exercises aren't tagged by axis).
const AXIS_TIP: Record<"vi" | "en", Record<string, string>> = {
  vi: {
    Understanding: "Đọc kỹ đề, chốt input/output trước khi prompt.",
    Hypothesis: "Viết giả thuyết cách giải trước khi code.",
    Prompting: "Prompt cụ thể, kèm ngữ cảnh; tránh hỏi chung chung.",
    Verification: "Luôn kiểm chứng gợi ý của AI, đừng tin ngay.",
    Testing: "Viết cả test case biên, không chỉ happy path.",
    Debugging: "Đọc kỹ lỗi, khoanh vùng trước khi sửa.",
  },
  en: {
    Understanding: "Pin down input/output before you prompt.",
    Hypothesis: "Write your approach hypothesis before coding.",
    Prompting: "Prompt with context and specifics, not vaguely.",
    Verification: "Always verify the AI's suggestion; don't trust blindly.",
    Testing: "Cover edge cases, not just the happy path.",
    Debugging: "Read the error and localise before fixing.",
  },
};

const copy = {
  vi: {
    eyebrow: "Lộ trình của bạn",
    title: "Luyện tập có định hướng",
    sub: "Tiếp tục từ chỗ đang dở, theo tiến trình cấp độ và cải thiện điểm yếu.",
    resume: "Tiếp tục bài đang làm",
    start: "Bắt đầu bài đầu tiên",
    resumeCta: "Tiếp tục",
    startCta: "Vào làm",
    allDone: "Bạn đã hoàn thành hết bài hiện có 🎉",
    focus: "Nên tập trung",
    weakest: "Trục yếu nhất",
    progress: "đã giải",
    of: "/",
    solvedAll: "Hoàn thành",
  },
  en: {
    eyebrow: "Your path",
    title: "Guided practice",
    sub: "Pick up where you left off, progress by level, and close your weak spots.",
    resume: "Resume your attempt",
    start: "Start your first exercise",
    resumeCta: "Continue",
    startCta: "Open",
    allDone: "You've finished every available exercise 🎉",
    focus: "Focus area",
    weakest: "Weakest axis",
    progress: "solved",
    of: "/",
    solvedAll: "Done",
  },
} as const;

export function WorkspaceLanding() {
  const { locale } = useI18n();
  const c = appContent[locale];
  const w = c.workspace;
  const t = copy[locale];
  const axesL = c.axes as Record<string, string>;

  const exQuery = useQuery({ queryKey: ["exercises"], queryFn: () => getExercises() });
  const dashQuery = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });

  const groups = useMemo(() => exQuery.data ?? [], [exQuery.data]);
  const all = useMemo<ExerciseSummary[]>(() => groups.flatMap((g) => g.exercises), [groups]);

  // Continue = first attempted; else first not-solved; else first exercise.
  const resume = all.find((e) => e.status === "attempted");
  const nextTodo = all.find((e) => e.status !== "solved" && e.status !== "attempted");
  const continueEx = resume ?? nextTodo ?? all[0];
  const isResume = !!resume;
  const allSolved = all.length > 0 && all.every((e) => e.status === "solved");

  // Weakest observed radar axis → a coaching tip (not-applicable axes are not weaknesses).
  const radar = (dashQuery.data?.radar ?? []).filter((r): r is { name: string; value: number } => r.value !== null);
  const weakest = radar.length ? radar.reduce((a, b) => (b.value < a.value ? b : a)) : null;
  const tip = weakest ? AXIS_TIP[locale][weakest.name] : null;

  return (
    <div className="mx-auto w-full max-w-container-max px-5 py-10 md:px-12">
      <header className="mb-8">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">{t.eyebrow}</span>
        <h1 className="mt-2 font-headline-xl text-[40px] leading-none tracking-tight sm:text-headline-xl">{t.title}</h1>
        <p className="mt-3 max-w-lg text-on-surface-variant">{t.sub}</p>
      </header>

      {/* Continue + coaching */}
      <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Continue / start */}
        <div className="ice-card flex flex-col justify-between gap-4 p-6 lg:col-span-2">
          {allSolved || !continueEx ? (
            <div className="flex flex-1 items-center gap-3 text-on-surface">
              <Sym name="celebration" className="text-[28px] text-primary" />
              <p className="font-medium">{t.allDone}</p>
            </div>
          ) : (
            <>
              <div>
                <span className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">
                  {isResume ? t.resume : t.start}
                </span>
                <h3 className="mt-2 font-headline-lg-mobile text-headline-lg-mobile">
                  {continueEx.num}. {continueEx.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {continueEx.topics.slice(0, 3).map((tp) => (
                    <span key={tp} className="rounded-pill bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">{tp}</span>
                  ))}
                </div>
              </div>
              <Link
                href={{ pathname: "/solve", query: { id: continueEx.code, level: continueEx.level } }}
                className="inline-flex w-fit items-center gap-2 bg-primary px-5 py-2.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
              >
                {isResume ? t.resumeCta : t.startCta} <Sym name="arrow_forward" className="text-[16px]" />
              </Link>
            </>
          )}
        </div>

        {/* Coaching from the radar */}
        <div className="ice-card flex flex-col gap-3 p-6">
          <div className="flex items-center gap-2 font-label-mono text-label-mono uppercase text-on-surface-variant/70">
            <Sym name="target" className="text-[18px] text-primary" /> {t.focus}
          </div>
          {weakest ? (
            <>
              <p className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
                {axesL[weakest.name] ?? weakest.name}
              </p>
              <p className="font-label-mono text-label-mono text-on-surface-variant/60">
                {t.weakest} · {weakest.value.toFixed(0)}%
              </p>
              <p className="text-sm leading-relaxed text-on-surface-variant">{tip}</p>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant/60">—</p>
          )}
        </div>
      </div>

      {/* Level progression */}
      <section className="mb-12">
        <div className="mb-5 flex items-center gap-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{w.trainingLevels}</h2>
          <div className="h-px flex-1 bg-outline-variant/60" />
          <span className="font-label-mono text-label-mono text-on-surface-variant/60">{w.tracks}</span>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {LEVEL_ORDER.map((slug) => {
            const g = groups.find((gr) => gr.level === slug);
            const total = g?.exercises.length ?? 0;
            const solved = g?.exercises.filter((e) => e.status === "solved").length ?? 0;
            const pct = total ? Math.round((solved / total) * 100) : 0;
            const diff = LEVEL_DIFFICULTY[slug];
            const name = g?.name ?? slug;
            return (
              <Link
                key={slug}
                href={`/workspace/${slug}`}
                className="ice-card group flex flex-col p-6 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-mono text-label-mono uppercase text-primary">{c.difficulty[diff] ?? diff}</span>
                  <span className="font-label-mono text-label-mono text-on-surface-variant/60">
                    {solved}{t.of}{total} {t.progress}
                  </span>
                </div>
                <h3 className="mt-3 font-headline-lg-mobile text-headline-lg-mobile">{name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-on-surface-variant">{c.levelInfo[slug]}</p>
                {/* Progress bar */}
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-outline-variant/40 pt-4">
                  <span className="font-label-mono text-label-mono text-on-surface-variant/60">
                    {pct === 100 ? t.solvedAll : `${pct}%`}
                  </span>
                  <span className="flex items-center gap-1 font-label-mono text-label-mono text-primary transition-transform group-hover:translate-x-1">
                    {w.browse} <Sym name="arrow_forward" className="text-[16px]" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Business problems (coming soon) */}
      <section>
        <div className="mb-5 flex items-center gap-4">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{w.businessProblems}</h2>
          <span className="border border-primary/30 bg-primary/5 px-2 py-0.5 font-label-mono text-label-mono uppercase text-primary">{w.comingSoon}</span>
          <div className="h-px flex-1 bg-outline-variant/60" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {business.map((b) => (
            <div key={b} className="ice-card flex cursor-not-allowed flex-col p-5 opacity-70">
              <div className="mb-4 flex h-24 items-center justify-center border border-dashed border-outline-variant/60 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant/50">
                <Sym name="lock" className="text-[28px]" />
              </div>
              <div className="font-label-mono text-label-mono uppercase text-on-surface-variant">{b}</div>
              <div className="mt-1 text-sm text-on-surface-variant/70">{w.realWorld}</div>
              <div className="mt-4 border-t border-outline-variant/40 pt-3 font-label-mono text-label-mono uppercase text-on-surface-variant/50">{w.locked}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
