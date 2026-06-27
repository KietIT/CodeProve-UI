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
  logHypothesis,
  runTests,
  saveSnapshot,
  sendMentor,
  type RunResult,
} from "@/lib/api";
import { createTelemetry } from "@/lib/telemetry";

// ── Token -> Tailwind class map (mirrors the original page) ──────────────────
const TOKEN_CLASS: Record<string, string> = {
  kw: "text-primary",
  fn: "text-secondary",
  com: "text-on-surface-variant/40 italic",
};

// ── Shared editor metrics ───────────────────────────────────────────────────
// The textarea, the highlight overlay, and the line-number gutter MUST share
// identical font metrics + box padding so glyphs line up 1:1 — including when
// scrolled. We pin them with inline styles rather than utility classes so the
// numbers can't drift between the three layered elements.
const EDITOR_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
const EDITOR_FONT_SIZE = 13; // px
const EDITOR_LINE_HEIGHT = 21; // px
const EDITOR_PAD_Y = 24; // px (top + bottom padding)
const EDITOR_PAD_X = 16; // px

const EDITOR_TEXT_STYLE: React.CSSProperties = {
  fontFamily: EDITOR_FONT_FAMILY,
  fontSize: EDITOR_FONT_SIZE,
  lineHeight: `${EDITOR_LINE_HEIGHT}px`,
  padding: `${EDITOR_PAD_Y}px ${EDITOR_PAD_X}px`,
  tabSize: 4,
  margin: 0,
  border: 0,
};

const EDITOR_GUTTER_STYLE: React.CSSProperties = {
  fontFamily: EDITOR_FONT_FAMILY,
  fontSize: EDITOR_FONT_SIZE,
  lineHeight: `${EDITOR_LINE_HEIGHT}px`,
  padding: `${EDITOR_PAD_Y}px 12px`,
  margin: 0,
};

const EDITOR_LINE_STYLE: React.CSSProperties = {
  height: `${EDITOR_LINE_HEIGHT}px`,
  lineHeight: `${EDITOR_LINE_HEIGHT}px`,
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
  /** Optional callback. Task 17 will replace this with the submit/explain-back flow. */
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
  const [levelConfig] = useState<LevelConfig>(initialLevel);

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

  // ── Chat state ────────────────────────────────────────────────────────────
  type ChatMessage = { role: "user" | "assistant"; text: string; verifyHint?: boolean };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Hypothesis state ──────────────────────────────────────────────────────
  const [hypothesis, setHypothesis] = useState<string>("");
  const [hypothesisSending, setHypothesisSending] = useState(false);
  const [hypothesisResult, setHypothesisResult] = useState<{ correct: boolean; note: string } | null>(null);

  // ── Debounce + delta accumulator for CODE_EDIT telemetry ──────────────────
  const editDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCodeLenRef = useRef<number>(initialExercise.starter.length);
  // Sum of per-keystroke deltas within the current debounce window. Flushing the
  // debounced log sends this total and resets it, so fast typing isn't lost.
  const editDeltaAccRef = useRef<number>(0);

  // ── Editor scroll-sync refs (overlay + gutter follow the textarea) ────────
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // ── Mount: fetch detail from API (fallback to initialExercise) + attempt ──
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
            prevCodeLenRef.current = detail.starter.length;
          }
        }
      } catch {
        // Static fallback: continue without live detail.
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
        // Backend not reachable: telemetry stays a no-op via the null checks below.
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

  // ── visibilitychange / blur -> FOCUS_LOST (deduped) ───────────────────────
  // A tab switch fires BOTH visibilitychange (hidden) and window blur. Gate each
  // so exactly one FOCUS_LOST is emitted:
  //   - tab switch -> visibilitychange (document becomes hidden)
  //   - app switch -> blur while the tab is still visible
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        telemetryRef.current?.log("FOCUS_LOST", {}, ["TAB_SWITCH"]);
      }
    }
    function handleBlur() {
      // Window lost focus but the tab is still active = switched to another app.
      if (document.visibilityState === "visible") {
        telemetryRef.current?.log("FOCUS_LOST", {}, ["TAB_SWITCH"]);
      }
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

      // Accumulate per-keystroke deltas so fast typing within the debounce
      // window isn't collapsed to a single keystroke.
      editDeltaAccRef.current += delta;

      if (editDebounceRef.current) clearTimeout(editDebounceRef.current);
      editDebounceRef.current = setTimeout(() => {
        const total = editDeltaAccRef.current;
        editDeltaAccRef.current = 0;
        telemetryRef.current?.log("CODE_EDIT", { charsAdded: total });
      }, 500);
    },
    [],
  );

  // ── Editor scroll -> sync overlay + gutter ────────────────────────────────
  const handleEditorScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = ta.scrollTop;
      overlayRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = ta.scrollTop;
    }
  }, []);

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

  // ── Auto-scroll chat to bottom ────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Chat send ─────────────────────────────────────────────────────────────
  const handleChatSend = useCallback(async (text?: string) => {
    const msg = (text ?? chatInput).trim();
    if (!msg || chatSending) return;
    const id = attemptIdRef.current;
    if (!id) return;

    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setChatSending(true);

    try {
      const res = await sendMentor(id, msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.reply, verifyHint: res.injected_error },
      ]);
    } catch (err) {
      const errText = err instanceof Error ? err.message : "Failed to reach Ciel.";
      setMessages((prev) => [...prev, { role: "assistant", text: `[Error] ${errText}` }]);
    } finally {
      setChatSending(false);
    }
  }, [chatInput, chatSending]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    void handleChatSend(suggestion);
  }, [handleChatSend]);

  // ── Hypothesis log ────────────────────────────────────────────────────────
  const handleLogHypothesis = useCallback(async () => {
    if (!hypothesis.trim() || hypothesisSending) return;
    const id = attemptIdRef.current;
    if (!id) return;

    setHypothesisSending(true);
    setHypothesisResult(null);

    try {
      const res = await logHypothesis(id, hypothesis);
      setHypothesisResult(res);
    } catch {
      // Show a neutral error without crashing.
      setHypothesisResult({ correct: false, note: "Failed to log hypothesis. Try again." });
    } finally {
      setHypothesisSending(false);
    }
  }, [hypothesis, hypothesisSending]);

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
            {/* Hypothesis box */}
            <section className="ice-card p-4">
              <h3 className="mb-2 font-label-caps text-label-caps uppercase tracking-widest">Initial hypothesis</h3>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                className="h-28 w-full resize-none border border-outline-variant/60 bg-surface-container-lowest/50 p-2.5 font-label-mono text-label-mono text-on-surface outline-none focus:border-primary"
                placeholder="Describe your approach before coding…"
              />
              {hypothesisResult && (
                <div className={`mt-2 p-2 font-label-mono text-label-mono text-sm ${hypothesisResult.correct ? "text-primary" : "text-error"}`}>
                  {hypothesisResult.correct ? "✓" : "✗"} {hypothesisResult.note}
                </div>
              )}
              <button
                onClick={() => void handleLogHypothesis()}
                disabled={hypothesisSending || !hypothesis.trim()}
                className="mt-2 w-full cursor-pointer bg-primary py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {hypothesisSending ? "Logging…" : "Log hypothesis"}
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

          {/* Editor — textarea is the scroll container; gutter + overlay mirror
              its scroll position via handleEditorScroll. All three share the
              EDITOR_* metrics so highlighted glyphs and line numbers stay aligned
              with the real text even when scrolled deep into a long starter. */}
          <div className="relative flex-1 overflow-hidden bg-surface-container-lowest/60">
            <div className="scanline" />
            <div className="absolute inset-0 flex">
              {/* Line numbers (vertical scroll mirrored, own overflow clipped) */}
              <div
                ref={gutterRef}
                aria-hidden="true"
                className="flex-none select-none overflow-hidden border-r border-outline-variant/40 text-right text-on-surface-variant/40"
                style={EDITOR_GUTTER_STYLE}
              >
                {codeLines.map((_, i) => (
                  <div key={i} style={EDITOR_LINE_STYLE}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                ))}
              </div>

              {/* Overlay + textarea share one box and identical metrics */}
              <div className="relative flex-1">
                {/* Highlight overlay (scroll mirrored; pointer-events off) */}
                <div
                  ref={overlayRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre"
                  style={EDITOR_TEXT_STYLE}
                >
                  {codeLines.map((line, i) => {
                    const tokens = tokenizeLine(line, exercise.language);
                    return (
                      <div key={i} style={EDITOR_LINE_STYLE}>
                        {tokens.length === 0 ? (
                          " "
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

                {/* Editable textarea: the real scroll container. Transparent text
                    lets the overlay show through; the caret stays visible. */}
                <textarea
                  ref={textareaRef}
                  value={editorCode}
                  onChange={handleEditorChange}
                  onPaste={handlePaste}
                  onScroll={handleEditorScroll}
                  spellCheck={false}
                  wrap="off"
                  className="ice-scroll absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent text-transparent caret-on-surface outline-none"
                  style={EDITOR_TEXT_STYLE}
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
              {runError && <div className="text-error">[ERROR] {runError}</div>}

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
                      {c.error && <div className="ml-4 text-error/80">{c.error}</div>}
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
              {/* Initial hint bubble */}
              <div className="border-l-2 border-primary bg-primary/5 p-3">
                <p className="text-sm leading-relaxed text-on-surface">{exercise.hint}</p>
              </div>
              {messages.length === 0 && (
                <div className="border-l-2 border-outline-variant/60 bg-surface-container-high/50 p-3">
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    Ciel guides your reasoning; it never writes the solution for you.
                  </p>
                </div>
              )}
              {/* Chat message history */}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user"
                  ? "border-l-2 border-outline-variant/60 bg-surface-container-high/50 p-3"
                  : "border-l-2 border-primary bg-primary/5 p-3"
                }>
                  <p className="text-sm leading-relaxed text-on-surface">{m.text}</p>
                  {m.verifyHint && (
                    <p className="mt-1 text-xs text-on-surface-variant/60 italic">
                      Verify this carefully before trusting it.
                    </p>
                  )}
                </div>
              ))}
              {chatSending && (
                <div className="border-l-2 border-primary bg-primary/5 p-3">
                  <p className="animate-pulse text-sm text-on-surface-variant/60">Ciel is thinking…</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-outline-variant/60 p-4">
              <div className="relative">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleChatSend(); } }}
                  disabled={chatSending}
                  className="w-full border border-outline-variant/60 bg-surface-container-lowest/50 p-2.5 pr-10 font-label-mono text-label-mono outline-none focus:border-primary disabled:opacity-50"
                  placeholder="Ask Ciel…"
                  type="text"
                />
                <button
                  aria-label="Send"
                  onClick={() => void handleChatSend()}
                  disabled={chatSending || !chatInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-primary disabled:opacity-40"
                >
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
                  onClick={() => handleSuggestionClick(p)}
                  disabled={chatSending}
                  className="w-full cursor-pointer border border-outline-variant/50 p-2 text-left font-label-mono text-label-mono text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
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
