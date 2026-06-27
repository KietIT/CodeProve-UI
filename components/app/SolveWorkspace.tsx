"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppTopNav, Sym } from "@/components/app/AppChrome";
import {
  tokenizeLine,
  RUBRIC,
  PROMPT_SUGGESTIONS,
  type Exercise,
  type LevelConfig,
} from "@/lib/exercises";
import {
  createAttempt,
  getExerciseDetail,
  runTests,
  saveSnapshot,
  type RunResult,
} from "@/lib/api";
import { createTelemetry } from "@/lib/telemetry";

// ── Token → Tailwind class map (mirrors the original page) ───────────────────
const TOKEN_CLASS: Record<string, string> = {
  kw: "text-primary",
  fn: "text-secondary",
  com: "text-on-surface-variant/40 italic",
};

// ── Props ────────────────────────────────────────────────────────────────────

export type SolveWorkspaceProps = {
  /** Exercise code string (e.g. "CP-001") used to create an attempt. */
  code: string;
  /** Level slug used for the back-link. */
  level: string;
  /** Static exercise data loaded server-side; used as fallback while fetching. */
  initialExercise: Exercise;
  /** Level config for the back-link label. */
  initialLevel: LevelConfig;
  /** Optional callback — Task 17 will replace this with the submit/explain-back flow. */
  onSubmit?: () => void;
};

// ── Component ────────────────────────────────────────────────────────────────

export function SolveWorkspace({
  code,
  level,
  initialExercise,
  initialLevel,
  onSubmit,
}: SolveWorkspaceProps) {
  const router = useRouter();

  // ── Exercise state (starts with static data; hydrates from API) ───────────
  const [exercise, setExercise] = useState<Exercise>(initialExercise);
  const [levelConfig, setLevelConfig] = useState<LevelConfig>(initialLevel);

  // ── Editor state ──────────────────────────────────────────────────────────
  const [editorCode, setEditorCode] = useState<string>(initialExercise.starter);

  // ── Telemetry + attempt ───────────────────────────────────────────────────
  const attemptIdRef = useRef<number | null>(null);
  const telemetryRef = useRef<ReturnType<typeof createTelemetry> | null>(null);
  const snapshotVersionRef = useRef<number>(0);

  // ── Test runner state ─────────────────────────────────────────────────────
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // ── Debounce ref for CODE_EDIT telemetry ──────────────────────────────────
  const editDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCodeLenRef = useRef<number>(initialExercise.starter.length);

  // ── Mount: fetch detail from API (fallback to initialExercise) + create attempt ──
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Try to enrich exercise data from the API (best-effort).
      try {
        const detail = await getExerciseDetail(code);
        if (!cancelled) {
          // Merge API detail into the local Exercise shape.
          setExercise((prev) => ({
            ...prev,
            summary: detail.summary ?? prev.summary,
            hint: detail.hint ?? prev.hint,
            tests: detail.tests ?? prev.tests,
            starter: detail.starter ?? prev.starter,
            language: (detail.language as Exercise["language"]) ?? prev.language,
          }));
          if (!cancelled && detail.starter) {
            setEditorCode((current) =>
              // Only override starter if the user has not typed anything yet.
              current === initialExercise.starter ? detail.starter : current,
            );
          }
        }
      } catch {
        // Static fallback — continue without live detail.
      }

      // Create attempt on backend.
      try {
        const resp = await createAttempt(code);
        if (cancelled) return;
        const id = resp.attempt_id;
        attemptIdRef.current = id;

        const telem = createTelemetry(id);
        telemetryRef.current = telem;
        telem.log("OPEN");
      } catch {
        // Backend not reachable — telemetry will be a no-op via null check below.
      }
    }

    void init();

    return () => {
      cancelled = true;
      // Flush + stop telemetry on unmount.
      void telemetryRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ── visibilitychange / blur → FOCUS_LOST ─────────────────────────────────
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        telemetryRef.current?.log("FOCUS_LOST", {}, ["TAB_SWITCH"]);
      }
    }
    function handleBlur() {
      telemetryRef.current?.log("FOCUS_LOST", {}, ["TAB_SWITCH"]);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // ── Editor onChange ───────────────────────────────────────────────────────
  const handleEditorChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCode = e.target.value;
      const delta = newCode.length - prevCodeLenRef.current;
      prevCodeLenRef.current = newCode.length;
      setEditorCode(newCode);

      // Debounced telemetry log.
      if (editDebounceRef.current) clearTimeout(editDebounceRef.current);
      editDebounceRef.current = setTimeout(() => {
        telemetryRef.current?.log("CODE_EDIT", { charsAdded: delta });
      }, 500);
    },
    [],
  );

  // ── Editor onPaste ────────────────────────────────────────────────────────
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.length > 80) {
      telemetryRef.current?.log("PASTE", { length: pasted.length }, ["BURST_PASTE"]);
    }
  }, []);

  // ── Run tests ─────────────────────────────────────────────────────────────
  const handleRunTests = useCallback(async () => {
    const id = attemptIdRef.current;
    if (!id) {
      setRunError("No active attempt. Please reload the page.");
      return;
    }
    setRunning(true);
    setRunError(null);
    setRunResult(null);

    try {
      snapshotVersionRef.current += 1;
      await saveSnapshot(id, snapshotVersionRef.current, editorCode);
      const result = await runTests(id, editorCode);
      setRunResult(result);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }, [editorCode]);

  // ── Clear results ─────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setRunResult(null);
    setRunError(null);
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    // Task 17 will replace this with the explain-back modal flow.
    if (onSubmit) {
      onSubmit();
    } else {
      router.push("/feedback");
    }
  }, [onSubmit, router]);

  // ── Derived display values ────────────────────────────────────────────────
  const codeLines = editorCode.split("\n");
  const backSlug = level ?? levelConfig.slug;

  // ── Render ────────────────────────────────────────────────────────────────
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
              <Sym name="arrow_back" className="text-[15px]" /> {levelConfig.name} exercises
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
            {/* Hypothesis box — wired in Task 12 */}
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
            <button
              onClick={handleSubmit}
              className="flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
            >
              Submit <Sym name="send" className="text-[16px]" />
            </button>
          </div>

          {/* Editor — controlled textarea with syntax overlay */}
          <div className="relative flex-1 overflow-auto bg-surface-container-lowest/60 p-6 font-label-mono text-label-mono ice-scroll">
            <div className="scanline" />
            <div className="relative flex gap-5">
              {/* Line numbers */}
              <div className="select-none space-y-1 text-right text-on-surface-variant/40 flex-none">
                {codeLines.map((_, i) => (
                  <div key={i}>{String(i + 1).padStart(2, "0")}</div>
                ))}
              </div>

              {/* Syntax-highlighted overlay + transparent textarea stacked */}
              <div className="relative flex-1">
                {/* Overlay (pointer-events:none so textarea receives clicks) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 space-y-1 whitespace-pre"
                >
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

                {/* Editable textarea — transparent text so overlay shows through */}
                <textarea
                  value={editorCode}
                  onChange={handleEditorChange}
                  onPaste={handlePaste}
                  spellCheck={false}
                  className="relative w-full resize-none bg-transparent font-label-mono text-label-mono text-transparent caret-on-surface outline-none"
                  style={{
                    // Match overlay line height exactly so gutter stays aligned.
                    lineHeight: "inherit",
                    minHeight: `${codeLines.length * 1.5}em`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Terminal / Test runner panel */}
          <div className="flex h-56 flex-none flex-col border-t border-outline-variant/60 bg-surface-container-lowest">
            <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-container-low px-4 py-2">
              <div className="flex items-center gap-2">
                <Sym name="terminal" className="text-[16px]" />
                <span className="font-label-mono text-label-mono uppercase">Test runner</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void handleRunTests()}
                  disabled={running}
                  className="cursor-pointer bg-primary px-3 py-1 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {running ? "Running…" : "Run tests"}
                </button>
                <button
                  onClick={handleClear}
                  className="cursor-pointer border border-outline-variant/60 px-3 py-1 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="ice-scroll flex-1 space-y-1.5 overflow-y-auto p-4 font-label-mono text-label-mono">
              <div className="text-on-surface-variant/70">CodeProve runner v1.0 · python 3.12</div>

              {/* Idle / no results yet */}
              {!runResult && !runError && !running && (
                <>
                  <div className="text-on-surface-variant/70">
                    Collecting tests… {exercise.tests.length} found
                  </div>
                  {exercise.tests.map((t) => (
                    <div key={t} className="text-on-surface-variant/50">
                      · {t} (pending)
                    </div>
                  ))}
                  <div className="text-on-surface-variant/70">&gt; _</div>
                </>
              )}

              {/* Running spinner text */}
              {running && (
                <div className="text-primary animate-pulse">Running tests…</div>
              )}

              {/* Error */}
              {runError && (
                <div className="text-error">[ERROR] {runError}</div>
              )}

              {/* Real results */}
              {runResult && (
                <>
                  {runResult.runtime_error && (
                    <div className="text-error">[RUNTIME ERROR] {runResult.runtime_error}</div>
                  )}
                  {runResult.cases.map((c) => (
                    <div key={c.name} className={c.passed ? "text-primary" : "text-error"}>
                      [{c.passed ? "PASS" : "FAIL"}] {c.name}
                      {c.stdout && (
                        <span className="ml-2 text-on-surface-variant/60">{c.stdout}</span>
                      )}
                      {c.error && (
                        <div className="ml-4 text-error/80">{c.error}</div>
                      )}
                    </div>
                  ))}
                  <div className="mt-1 text-on-surface-variant/70">
                    {runResult.passed}/{runResult.total} passed · coverage {runResult.coverage}%
                  </div>
                  <div className="text-on-surface-variant/70">&gt; _</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right — AI mentor (static UI; wired in Task 12) */}
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
                <button
                  key={p}
                  className="w-full cursor-pointer border border-outline-variant/50 p-2 text-left font-label-mono text-label-mono text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
                >
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
