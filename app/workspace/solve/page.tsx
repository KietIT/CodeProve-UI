import type { Metadata } from "next";
import Link from "next/link";
import { AppTopNav, Sym } from "@/components/app/AppChrome";
import {
  getExercise,
  getLevel,
  tokenizeLine,
  RUBRIC,
  PROMPT_SUGGESTIONS,
  LEVELS,
} from "@/lib/exercises";

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

const TOKEN_CLASS: Record<string, string> = {
  kw: "text-primary",
  fn: "text-secondary",
  com: "text-on-surface-variant/40 italic",
};

export default function SolvePage({ searchParams }: { searchParams: SearchParams }) {
  const { exercise, level } = resolve(searchParams);
  const backSlug = getLevel(searchParams.level)?.slug ?? level.slug;
  const codeLines = exercise.starter.split("\n");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-body-md text-on-surface">
      <AppTopNav />

      <main className="flex flex-1 overflow-hidden">
        {/* Left — brief */}
        <aside className="hidden w-80 flex-none flex-col border-r border-outline-variant/60 bg-surface-container-low lg:flex">
          <div className="border-b border-outline-variant/60 p-5">
            <Link
              href={`/workspace/${backSlug}`}
              className="mb-3 inline-flex items-center gap-1 font-label-mono text-label-mono text-on-surface-variant/70 transition-colors hover:text-primary"
            >
              <Sym name="arrow_back" className="text-[15px]" /> {level.name} exercises
            </Link>
            <span className="inline-block bg-primary px-2 py-0.5 font-label-mono text-label-mono text-on-primary">
              {exercise.id} · {exercise.difficulty.toUpperCase()}
            </span>
            <h2 className="mt-2 font-headline-lg-mobile text-headline-lg-mobile">{exercise.title}</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {exercise.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-pill bg-surface-container-highest px-2 py-0.5 font-label-mono text-[11px] text-on-surface-variant/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="ice-scroll flex-1 space-y-6 overflow-y-auto p-5">
            <section>
              <h3 className="mb-2 flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                <Sym name="description" className="text-[16px]" /> Problem
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{exercise.summary}</p>
            </section>
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                <Sym name="analytics" className="text-[16px]" /> Scoring rubric
              </h3>
              <div className="space-y-2 font-label-mono text-label-mono">
                {RUBRIC.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-outline-variant/40 pb-1.5">
                    <span className="text-on-surface-variant">{k}</span>
                    <span className="text-primary">{v}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="ice-card p-4">
              <h3 className="mb-2 font-label-caps text-label-caps uppercase tracking-widest">Initial hypothesis</h3>
              <textarea
                className="h-28 w-full resize-none border border-outline-variant/60 bg-surface-container-lowest/50 p-2.5 font-label-mono text-label-mono text-on-surface outline-none focus:border-primary"
                placeholder="Describe your approach before coding…"
              />
              <button className="mt-2 w-full cursor-pointer bg-primary py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90">
                Log hypothesis
              </button>
            </section>
          </div>
        </aside>

        {/* Center — editor + terminal */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-none items-center justify-between border-b border-outline-variant/60 bg-surface-container-low pr-4">
            <div className="flex">
              <div className="flex items-center gap-2 border-r border-outline-variant/60 bg-background px-5 py-2.5">
                <Sym name="code" className="text-[16px] text-primary" />
                <span className="font-label-mono text-label-mono">{exercise.filename}</span>
              </div>
            </div>
            <Link
              href="/feedback"
              className="flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
            >
              Submit <Sym name="send" className="text-[16px]" />
            </Link>
          </div>

          <div className="relative flex-1 overflow-auto bg-surface-container-lowest/60 p-6 font-label-mono text-label-mono ice-scroll">
            <div className="scanline" />
            <div className="flex gap-5">
              <div className="select-none space-y-1 text-right text-on-surface-variant/40">
                {codeLines.map((_, i) => (
                  <div key={i}>{String(i + 1).padStart(2, "0")}</div>
                ))}
              </div>
              <div className="space-y-1 whitespace-pre">
                {codeLines.map((line, i) => {
                  const tokens = tokenizeLine(line, exercise.language);
                  return (
                    <div key={i}>
                      {tokens.length === 0 ? (
                        " "
                      ) : (
                        tokens.map((p, j) => (
                          <span key={j} className={p.c ? TOKEN_CLASS[p.c] : "text-on-surface"}>
                            {p.t}
                          </span>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex h-56 flex-none flex-col border-t border-outline-variant/60 bg-surface-container-lowest">
            <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-container-low px-4 py-2">
              <div className="flex items-center gap-2">
                <Sym name="terminal" className="text-[16px]" />
                <span className="font-label-mono text-label-mono uppercase">Test runner</span>
              </div>
              <div className="flex gap-2">
                <button className="cursor-pointer bg-primary px-3 py-1 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90">Run tests</button>
                <button className="cursor-pointer border border-outline-variant/60 px-3 py-1 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary">Clear</button>
              </div>
            </div>
            <div className="ice-scroll flex-1 space-y-1.5 overflow-y-auto p-4 font-label-mono text-label-mono">
              <div className="text-on-surface-variant/70">CodeProve runner v1.0 · python 3.12</div>
              <div className="text-on-surface-variant/70">Collecting tests… {exercise.tests.length} found</div>
              {exercise.tests.map((t, i) =>
                i < 2 ? (
                  <div key={t} className="text-primary">[PASS] {t}</div>
                ) : (
                  <div key={t} className="text-on-surface-variant/50">· {t} (pending)</div>
                ),
              )}
              <div className="text-on-surface-variant/70">&gt; _</div>
            </div>
          </div>
        </div>

        {/* Right — AI mentor */}
        <aside className="hidden w-80 flex-none flex-col border-l border-outline-variant/60 bg-surface-container-low xl:flex">
          <div className="flex flex-1 flex-col overflow-hidden border-b border-outline-variant/60">
            <div className="flex items-center justify-between border-b border-outline-variant/60 p-4">
              <div className="flex items-center gap-2">
                <Sym name="smart_toy" className="text-primary" />
                <span className="font-label-mono text-label-mono uppercase">Ciel</span>
              </div>
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            </div>
            <div className="ice-scroll flex-1 space-y-4 overflow-y-auto p-4">
              <div className="border-l-2 border-primary bg-primary/5 p-3">
                <p className="text-sm leading-relaxed text-on-surface">{exercise.hint}</p>
              </div>
              <div className="border-l-2 border-outline-variant/60 bg-surface-container-high/50 p-3">
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Ciel guides your reasoning; it never writes the solution for you.
                </p>
              </div>
            </div>
            <div className="border-t border-outline-variant/60 p-4">
              <div className="relative">
                <input
                  className="w-full border border-outline-variant/60 bg-surface-container-lowest/50 p-2.5 pr-10 font-label-mono text-label-mono outline-none focus:border-primary"
                  placeholder="Ask Ciel…"
                  type="text"
                />
                <button aria-label="Send" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-primary">
                  <Sym name="send" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex h-1/3 flex-col">
            <div className="border-b border-outline-variant/60 p-4">
              <h3 className="font-label-mono text-label-mono uppercase">Prompt suggestions</h3>
            </div>
            <div className="ice-scroll flex-1 space-y-2 overflow-y-auto p-3">
              {PROMPT_SUGGESTIONS.map((p) => (
                <button key={p} className="w-full cursor-pointer border border-outline-variant/50 p-2 text-left font-label-mono text-label-mono text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
                  {p}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
