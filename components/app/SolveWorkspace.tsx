"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppTopNav, Sym } from "@/components/app/AppChrome";
import {
  tokenizeLine,
  resolveEditorStarter,
  RUBRIC,
  type Exercise,
  type LevelConfig,
} from "@/lib/exercises";
import {
  ApiError,
  createAttempt,
  getAttempt,
  getExerciseDetail,
  locateBug,
  logHypothesis,
  runTests,
  saveSnapshot,
  submitAttempt,
  takeDebugHint,
  type DebugState,
  type ExerciseDetail,
  type RunResult,
  type SubmitSummary,
  type TestsState,
} from "@/lib/api";
import { useCiel } from "@/hooks/useCiel";
import { ResultTabs } from "@/components/workspace/ResultTabs";
import { HintAccordion } from "@/components/workspace/HintAccordion";
import { WorkspaceVisualizer } from "@/components/workspace/WorkspaceVisualizer";
import { visualizerSource } from "@/components/workspace/visualizerInput";
import { CielPanel } from "@/components/workspace/CielPanel";
import { ExplainBackModal } from "@/components/app/ExplainBackModal";
import { LocatePanel } from "@/components/debug/LocatePanel";
import {
  canResumeAttempt,
  clearResume,
  debugStep,
  readResume,
  toggleLine,
  writeResume,
  type ResumeStore,
} from "@/components/debug/locate";
import { TestsPanel } from "@/components/studentTests/TestsPanel";
import { hasTestsTab } from "@/components/studentTests/studentTests";
import { useStudentTests } from "@/hooks/useStudentTests";
import { useSessionStore } from "@/lib/stores/useSessionStore";
import { useVisualizerStore } from "@/lib/stores/useVisualizerStore";
import { createTelemetry } from "@/lib/telemetry";
import { useI18n } from "@/lib/i18n";
import { appContent } from "@/lib/appContent";
import { exerciseContentVi } from "@/lib/exerciseContentVi";

// ── Token -> Tailwind class map (mirrors the original page) ──────────────────
const TOKEN_CLASS: Record<string, string> = {
  kw: "text-primary",
  fn: "text-secondary",
  com: "text-on-surface-variant/40 italic",
};

// ── Shared editor metrics ───────────────────────────────────────────────────
// The textarea, the highlight overlay, and the line-number gutter MUST share
// identical font metrics + box padding so glyphs line up 1:1 - including when
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

const ATTEMPT_DURATION_MS = 45 * 60 * 1000;
const AUTOSAVE_INTERVAL_MS = 12 * 1000;

/** Per-tab storage for resuming an attempt (debug step or Tests tab); null where it is unavailable. */
function sessionStore(): ResumeStore | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ── Responsive helper ─────────────────────────────────────────────────────────
// Mirrors the old Tailwind breakpoints (lg/xl) that gated the side panels.
// Initialises to `false` on both server and first client render to avoid a
// hydration mismatch, then corrects after mount.
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Vertical drag handle between two horizontal panels. */
function ColResizeHandle() {
  return (
    <PanelResizeHandle className="group relative w-px flex-none bg-outline-variant/60 outline-none transition-colors data-[resize-handle-state=drag]:bg-primary data-[resize-handle-state=hover]:bg-primary/60">
      <span className="absolute inset-y-0 -left-1 -right-1 z-10" aria-hidden="true" />
    </PanelResizeHandle>
  );
}

/** One tab of the centre header (the code file, the Tests tab). */
function CenterTab({
  active,
  icon,
  label,
  badge,
  onSelect,
}: {
  active: boolean;
  icon: string;
  label: string;
  badge?: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-2 border-r border-outline-variant/60 px-3 py-2.5 transition-colors sm:px-5 ${
        active ? "bg-background text-on-surface" : "text-on-surface-variant hover:text-on-surface"
      }`}
    >
      <Sym name={icon} className={`text-[16px] ${active ? "text-primary" : ""}`} />
      <span className="font-label-mono text-label-mono">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-pill bg-primary/15 px-1.5 font-label-mono text-[11px] text-primary">{badge}</span>
      )}
    </button>
  );
}

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
  const { locale } = useI18n();
  const t = appContent[locale].solve;

  // Side panels are resizable on wide screens and hidden on narrow ones,
  // matching the previous lg/xl Tailwind gates.
  const showLeft = useMediaQuery("(min-width: 1024px)");
  const showRight = useMediaQuery("(min-width: 1280px)");

  // ── Exercise state (starts with static data; hydrates from API) ───────────
  const [exercise, setExercise] = useState<Exercise>(initialExercise);
  const [levelConfig] = useState<LevelConfig>(initialLevel);

  // ── Editor state ──────────────────────────────────────────────────────────
  // The editor stays in a loading state until the exercise detail request
  // settles, then opens with the API starter (static starter only if the API
  // fails). Rendering the static copy first and swapping would flash stale code.
  const [starterReady, setStarterReady] = useState(false);
  const [editorCode, setEditorCode] = useState<string>("");
  // Mirror editorCode in a ref so callbacks (e.g. chat send) read the latest
  // value without needing it in their dependency array.
  const editorCodeRef = useRef<string>("");
  editorCodeRef.current = editorCode;
  // The starter as served (comments stripped on debug exercises): what the
  // locate step shows, so the visualizer traces it while the editor is locked.
  const servedStarterRef = useRef<string>("");

  // Anti-cheat: paste is blocked in the editor (and hypothesis / explain-back).
  // Show a short-lived banner when the user attempts a paste so the block is
  // explained rather than feeling broken.
  const [pasteBlocked, setPasteBlocked] = useState(false);
  const pasteWarnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashPasteBlocked = useCallback(() => {
    setPasteBlocked(true);
    if (pasteWarnTimerRef.current) clearTimeout(pasteWarnTimerRef.current);
    pasteWarnTimerRef.current = setTimeout(() => setPasteBlocked(false), 3500);
  }, []);

  // One indent level. Auto-indent inserts these on Enter after a block opener and
  // Tab inserts one, so the caret behaves like a real IDE instead of jumping to
  // column 0 on every newline.
  const INDENT = "    ";

  // ── Telemetry + attempt ───────────────────────────────────────────────────
  const attemptIdRef = useRef<number | null>(null);
  const telemetryRef = useRef<ReturnType<typeof createTelemetry> | null>(null);
  const snapshotVersionRef = useRef<number>(0);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  // ── Test runner state ─────────────────────────────────────────────────────
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // ── Chat state ────────────────────────────────────────────────────────────
  // The conversation itself lives in useSessionStore (client-side prompt log,
  // Phase 5); only the input box and in-flight flag are local UI state.
  const [chatInput, setChatInput] = useState<string>("");
  const [chatSending, setChatSending] = useState(false);
  const startSession = useSessionStore((s) => s.startSession);
  const addPromptEntry = useSessionStore((s) => s.addPromptEntry);
  // Ciel goes through the shared mutation hook (Phase 2) rather than calling the
  // service directly. Same request/response shape as before; mutateAsync is a
  // stable reference. `chatSending` still drives the local send UI.
  const { mutateAsync: askCiel } = useCiel(attemptId);

  // ── Hypothesis state ──────────────────────────────────────────────────────
  const [hypothesis, setHypothesis] = useState<string>("");
  const [hypothesisSending, setHypothesisSending] = useState(false);
  const [hypothesisResult, setHypothesisResult] = useState<{ correct: boolean; note: string } | null>(null);

  // ── Debug locate step (P2.2) ───────────────────────────────────────────────
  // `debugResolved` stays false on a debug exercise until the attempt state is
  // known, so neither the editor nor the free hint shows before the lock does.
  const [debugState, setDebugState] = useState<DebugState | null>(null);
  const [debugResolved, setDebugResolved] = useState(false);
  const [locateLines, setLocateLines] = useState<number[]>([]);
  const [locateReason, setLocateReason] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [locateSubmitting, setLocateSubmitting] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [justLocated, setJustLocated] = useState(false);
  // True while this attempt (debug step or Tests tab) is remembered for a reload.
  const resumeActiveRef = useRef(false);

  // ── Student tests (P2.3) ────────────────────────────────────────────────────
  const [testsState, setTestsState] = useState<TestsState | null>(null);
  const [centerTab, setCenterTab] = useState<"code" | "tests">("code");
  const studentTests = useStudentTests({
    attemptId,
    initial: testsState,
    getCode: () => editorCodeRef.current,
  });
  const flushStudentTests = studentTests.flush;

  // ── Visualizer (kept here so a trace survives the brief panel closing) ────
  const [traceCall, setTraceCall] = useState("");
  const [tracedCode, setTracedCode] = useState("");

  // ── Explain-back modal state ───────────────────────────────────────────────
  const [explainQuestions, setExplainQuestions] = useState<string[] | null>(null);
  const [submitTests, setSubmitTests] = useState<SubmitSummary | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [hasStartedFullscreen, setHasStartedFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const fullscreenStartedRef = useRef(false);
  const [timerStartedAtMs, setTimerStartedAtMs] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(ATTEMPT_DURATION_MS);
  const timerStartedAtRef = useRef<number | null>(null);
  const timerExpiredRef = useRef(false);
  const [lastAutosaveAt, setLastAutosaveAt] = useState<number | null>(null);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const autosaveInFlightRef = useRef(false);
  const lastAutosavedCodeRef = useRef<string | null>(null);
  const tabHiddenAtRef = useRef<number | null>(null);
  const windowBlurAtRef = useRef<number | null>(null);

  // ── Debounce + delta accumulator for CODE_EDIT telemetry ──────────────────
  const editDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCodeLenRef = useRef<number>(0);
  // Sum of per-keystroke deltas within the current debounce window. Flushing the
  // debounced log sends this total and resets it, so fast typing isn't lost.
  const editDeltaAccRef = useRef<number>(0);

  // ── Editor scroll-sync refs (overlay + gutter follow the textarea) ────────
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // When a keydown handler rewrites the code (auto-indent, Tab), React re-renders
  // the controlled textarea and resets the caret to the end. We stash the desired
  // caret position here and restore it in a layout effect before the browser paints.
  const pendingSelRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (pendingSelRef.current !== null && textareaRef.current) {
      const pos = pendingSelRef.current;
      textareaRef.current.selectionStart = pos;
      textareaRef.current.selectionEnd = pos;
      pendingSelRef.current = null;
    }
  });

  // Keeps the attempt (and its snapshot counter) for a reload.
  const rememberAttempt = useCallback(() => {
    const id = attemptIdRef.current;
    if (!resumeActiveRef.current || !id) return;
    writeResume(sessionStore(), code, { attemptId: id, snapshotVersion: snapshotVersionRef.current });
  }, [code]);

  const performAutosave = useCallback(async (reason: string, force = false) => {
    const id = attemptIdRef.current;
    if (!id || autosaveInFlightRef.current) return;

    const source = editorCodeRef.current;
    if (!force && source === lastAutosavedCodeRef.current) return;

    autosaveInFlightRef.current = true;
    setAutosaveState("saving");
    const version = snapshotVersionRef.current + 1;
    snapshotVersionRef.current = version;
    rememberAttempt();

    try {
      await saveSnapshot(id, version, source);
      lastAutosavedCodeRef.current = source;
      const savedAt = Date.now();
      setLastAutosaveAt(savedAt);
      setAutosaveState("saved");
      telemetryRef.current?.log("AUTO_SAVE", {
        reason,
        version,
        length: source.length,
      });
    } catch {
      setAutosaveState("error");
      telemetryRef.current?.log("AUTO_SAVE_FAILED", { reason, version }, ["AUTO_SAVE_FAILED"]);
    } finally {
      autosaveInFlightRef.current = false;
    }
  }, [rememberAttempt]);

  // ── Mount: fetch detail from API (fallback to initialExercise) + attempt ──
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStarterReady(false);

      // The API detail is the source of truth for the briefing and the editor's
      // starter. The static exercise is only an offline fallback.
      let detail: ExerciseDetail | null = null;
      try {
        detail = await getExerciseDetail(code);
      } catch {
        // Static fallback: continue without live detail.
      }
      if (cancelled) return;

      if (detail) {
        const live = detail;
        setExercise((prev) => ({
          ...prev,
          kind: live.kind ?? prev.kind,
          summary: live.summary ?? prev.summary,
          hint: live.hint ?? prev.hint,
          tests: live.tests ?? prev.tests,
          language: (live.language as Exercise["language"]) ?? prev.language,
        }));
      }

      const starter = resolveEditorStarter(detail?.starter, initialExercise);
      servedStarterRef.current = starter;
      editorCodeRef.current = starter;
      prevCodeLenRef.current = starter.length;
      setEditorCode(starter);
      setStarterReady(true);

      const isDebug = (detail?.kind ?? initialExercise.kind) === "debug";
      setDebugState(null);
      setDebugResolved(!isDebug);
      setTestsState(null);
      setCenterTab("code");
      resumeActiveRef.current = false;

      // An attempt with a locate step (P2.2) or a Tests tab (P2.3) is reopened
      // after a reload so the step, the bought hints, the saved tests and the
      // code are kept; other exercises start fresh.
      let id: number | null = null;
      let debug: DebugState | null = null;
      let tests: TestsState | null = null;
      let latestCode: string | null = null;
      const store = sessionStore();
      const saved = readResume(store, code);
      if (saved) {
        try {
          const state = await getAttempt(saved.attemptId, locale);
          if (canResumeAttempt(state, code) && (state.debug || hasTestsTab(state.tests))) {
            id = state.id;
            debug = state.debug ?? null;
            tests = hasTestsTab(state.tests) ? state.tests : null;
            latestCode = state.latest_code;
            snapshotVersionRef.current = saved.snapshotVersion;
          }
        } catch {
          // Gone or not ours any more: start a new attempt below.
        }
        if (cancelled) return;
        if (id === null) clearResume(store, code);
      }

      try {
        if (id === null) {
          const resp = await createAttempt(code);
          if (cancelled) return;
          id = resp.attempt_id;
          snapshotVersionRef.current = 0;
          try {
            // A backend without P2.2 / P2.3 omits `debug` / `tests`: no step, no tab.
            const state = await getAttempt(id, locale);
            debug = isDebug ? state.debug ?? null : null;
            tests = hasTestsTab(state.tests) ? state.tests : null;
          } catch {
            debug = null;
            tests = null;
          }
          if (cancelled) return;
        }
        attemptIdRef.current = id;
        setAttemptId(id);
        // Fresh attempt → fresh prompt log for this session.
        startSession(id, code);

        if (debug || tests) {
          resumeActiveRef.current = true;
          rememberAttempt();
          // A debug editor keeps the starter until the bug is located.
          if (latestCode && (!debug || debug.located)) {
            editorCodeRef.current = latestCode;
            prevCodeLenRef.current = latestCode.length;
            lastAutosavedCodeRef.current = latestCode;
            setEditorCode(latestCode);
          }
        }
        setDebugState(debug);
        setTestsState(tests);

        const telem = createTelemetry(id);
        telemetryRef.current = telem;
        telem.log("OPEN");
      } catch {
        // Backend not reachable: telemetry stays a no-op via the null checks below.
      } finally {
        if (!cancelled) setDebugResolved(true);
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

  // The visualizer store is global: drop a trace left by another page or exercise.
  useEffect(() => {
    useVisualizerStore.getState().reset();
    setTraceCall("");
    setTracedCode("");
  }, [code]);

  useEffect(() => {
    if (timerStartedAtMs === null) return;
    const startedAt = timerStartedAtMs;

    function updateRemaining() {
      const deadline = startedAt + ATTEMPT_DURATION_MS;
      const left = Math.max(0, deadline - Date.now());
      setRemainingMs(left);

      if (left === 0 && !timerExpiredRef.current) {
        timerExpiredRef.current = true;
        telemetryRef.current?.log("TIMER_EXPIRED");
        void performAutosave("timer_expired", true);
      }
    }

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [performAutosave, timerStartedAtMs]);

  useEffect(() => {
    if (!attemptId || !hasStartedFullscreen) return;

    const timer = window.setInterval(() => {
      void performAutosave("interval");
    }, AUTOSAVE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [attemptId, hasStartedFullscreen, performAutosave]);

  useEffect(() => {
    function handleFullscreenChange() {
      const active = Boolean(document.fullscreenElement);
      setFullscreenActive(active);
      setFullscreenError(null);

      if (active) {
        fullscreenStartedRef.current = true;
        setHasStartedFullscreen(true);
        if (timerStartedAtRef.current === null) {
          const startedAt = Date.now();
          timerStartedAtRef.current = startedAt;
          setTimerStartedAtMs(startedAt);
          setRemainingMs(ATTEMPT_DURATION_MS);
          telemetryRef.current?.log("TIMER_START", { durationMs: ATTEMPT_DURATION_MS });
        }
        telemetryRef.current?.log("FULLSCREEN_ENTER");
        return;
      }

      if (fullscreenStartedRef.current) {
        telemetryRef.current?.log("FULLSCREEN_EXIT", {}, ["FULLSCREEN_EXIT"]);
      }
    }

    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ── Visibility / focus integrity telemetry ────────────────────────────────
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        tabHiddenAtRef.current = Date.now();
        telemetryRef.current?.log("TAB_HIDDEN", {}, ["TAB_HIDDEN"]);
        void performAutosave("tab_hidden", true);
        return;
      }

      if (document.visibilityState === "visible") {
        const hiddenAt = tabHiddenAtRef.current;
        if (hiddenAt === null) return;
        tabHiddenAtRef.current = null;
        telemetryRef.current?.log("TAB_VISIBLE", {
          hiddenMs: Date.now() - hiddenAt,
        });
      }
    }

    function handleBlur() {
      if (document.visibilityState === "visible") {
        windowBlurAtRef.current = Date.now();
        telemetryRef.current?.log("WINDOW_BLUR", {}, ["WINDOW_BLUR"]);
        void performAutosave("window_blur", true);
      }
    }

    function handleFocus() {
      const blurredAt = windowBlurAtRef.current;
      if (blurredAt === null) return;
      windowBlurAtRef.current = null;
      telemetryRef.current?.log("WINDOW_FOCUS", {
        blurredMs: Date.now() - blurredAt,
      });
    }

    function handlePageHide() {
      void performAutosave("pagehide", true);
    }

    function handleBeforeUnload() {
      void performAutosave("beforeunload", true);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [performAutosave]);

  // ── Editor value commit (shared by onChange + auto-indent keydown) ────────
  // Updates React state, accumulates a debounced CODE_EDIT delta, and (optionally)
  // schedules a caret restore for programmatic edits.
  const commitEditorValue = useCallback((newCode: string, caret?: number) => {
    const delta = newCode.length - prevCodeLenRef.current;
    prevCodeLenRef.current = newCode.length;
    if (caret !== undefined) pendingSelRef.current = caret;
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
  }, []);

  // ── Editor onChange ───────────────────────────────────────────────────────
  const handleEditorChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      commitEditorValue(e.target.value);
    },
    [commitEditorValue],
  );

  // ── Editor onKeyDown - IDE-like auto-indent (Enter/Tab/Backspace) ─────────
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget;
      const { selectionStart: s, selectionEnd: en, value } = ta;

      // Enter → keep the current line's indent, and add one level after a block
      // opener (`:` for Python, `{` for JS) so `for …:` ⏎ lands indented.
      if (e.key === "Enter") {
        e.preventDefault();
        const lineStart = value.lastIndexOf("\n", s - 1) + 1;
        const leading = value.slice(lineStart).match(/^[ \t]*/)?.[0] ?? "";
        const beforeCaret = value.slice(lineStart, s).trimEnd();
        const opensBlock = beforeCaret.endsWith(":") || beforeCaret.endsWith("{");
        const indent = leading + (opensBlock ? INDENT : "");
        const insert = "\n" + indent;
        const newValue = value.slice(0, s) + insert + value.slice(en);
        commitEditorValue(newValue, s + insert.length);
        return;
      }

      // Tab / Shift+Tab → insert or strip one indent level (whole selection aware).
      if (e.key === "Tab") {
        e.preventDefault();
        if (s === en && !e.shiftKey) {
          const newValue = value.slice(0, s) + INDENT + value.slice(en);
          commitEditorValue(newValue, s + INDENT.length);
          return;
        }
        const from = value.lastIndexOf("\n", s - 1) + 1;
        const block = value.slice(from, en);
        if (e.shiftKey) {
          const dedented = block.replace(/^( {1,4}|\t)/gm, "");
          const newValue = value.slice(0, from) + dedented + value.slice(en);
          commitEditorValue(newValue, Math.max(from, en - (block.length - dedented.length)));
        } else {
          const indented = block.replace(/^/gm, INDENT);
          const newValue = value.slice(0, from) + indented + value.slice(en);
          commitEditorValue(newValue, en + (indented.length - block.length));
        }
        return;
      }

      // Backspace inside pure leading whitespace → delete a whole indent level.
      if (e.key === "Backspace" && s === en) {
        const lineStart = value.lastIndexOf("\n", s - 1) + 1;
        const before = value.slice(lineStart, s);
        if (before.length >= INDENT.length && /^ +$/.test(before) && before.length % INDENT.length === 0) {
          e.preventDefault();
          const newValue = value.slice(0, s - INDENT.length) + value.slice(en);
          commitEditorValue(newValue, s - INDENT.length);
        }
      }
    },
    [commitEditorValue, INDENT],
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

  // ── Anti-cheat: block paste + drop everywhere the student writes ──────────
  // Pasting is how someone drops in an answer from another AI without engaging.
  // We prevent it outright, surface a short banner, and log a flagged event so
  // the scoring engine can penalise the attempt.
  const handleBlockedPaste = useCallback((e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    telemetryRef.current?.log("PASTE_BLOCKED", { length: pasted.length }, ["PASTE_BLOCKED"]);
    flashPasteBlocked();
  }, [flashPasteBlocked]);

  const handleBlockedDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    telemetryRef.current?.log("PASTE_BLOCKED", { via: "drop" }, ["PASTE_BLOCKED"]);
    flashPasteBlocked();
  }, [flashPasteBlocked]);

  // Copy / cut are still allowed but logged as integrity signals (teammate's
  // telemetry). Paste itself is blocked above rather than merely logged.
  const getSelectedCodeLength = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return 0;
    return Math.abs(ta.selectionEnd - ta.selectionStart);
  }, []);

  const handleCopy = useCallback(() => {
    telemetryRef.current?.log("COPY", { length: getSelectedCodeLength() });
  }, [getSelectedCodeLength]);

  const handleCut = useCallback(() => {
    telemetryRef.current?.log("CUT", { length: getSelectedCodeLength() });
  }, [getSelectedCodeLength]);

  const handleEnterFullscreen = useCallback(async () => {
    setFullscreenError(null);

    const root = document.documentElement;
    if (!root.requestFullscreen) {
      setFullscreenError("This browser does not support fullscreen mode.");
      telemetryRef.current?.log("FULLSCREEN_UNSUPPORTED", {}, ["FULLSCREEN_UNSUPPORTED"]);
      return;
    }

    try {
      await root.requestFullscreen();
    } catch {
      setFullscreenError("Fullscreen was blocked. Click the button again to continue.");
      telemetryRef.current?.log("FULLSCREEN_FAILED", {}, ["FULLSCREEN_FAILED"]);
    }
  }, []);

  // ── Run tests ─────────────────────────────────────────────────────────────
  const handleRunTests = useCallback(async () => {
    const id = attemptIdRef.current;
    if (!id) {
      setRunError(t.noActiveAttempt);
      return;
    }
    if (debugStep(debugState) === "locate") return;
    setRunning(true);
    setRunError(null);
    setRunResult(null);

    try {
      snapshotVersionRef.current += 1;
      rememberAttempt();
      await saveSnapshot(id, snapshotVersionRef.current, editorCode);
      const result = await runTests(id, editorCode);
      setRunResult(result);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }, [editorCode, t.noActiveAttempt, debugState, rememberAttempt]);

  // ── Clear results ─────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setRunResult(null);
    setRunError(null);
  }, []);

  // ── Chat send ─────────────────────────────────────────────────────────────
  // Turns are appended to the session prompt log; PromptLog renders from there.
  const handleChatSend = useCallback(async (text?: string) => {
    const msg = (text ?? chatInput).trim();
    if (!msg || chatSending) return;
    const id = attemptIdRef.current;
    if (!id) return;

    setChatInput("");
    addPromptEntry({ role: "user", text: msg });
    setChatSending(true);

    try {
      // Send the student's current editor code so Ciel can reason about
      // "this exercise" and what they have written so far.
      const res = await askCiel({ message: msg, code: editorCodeRef.current });
      addPromptEntry({ role: "assistant", text: res.reply });
    } catch (err) {
      const errText = err instanceof Error ? err.message : "Failed to reach Ciel.";
      addPromptEntry({ role: "assistant", text: `[Error] ${errText}` });
    } finally {
      setChatSending(false);
    }
  }, [chatInput, chatSending, askCiel, addPromptEntry]);

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

  // ── Submit → explain-back modal ───────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const id = attemptIdRef.current;
    if (!id) {
      setSubmitError(t.noActiveAttempt);
      return;
    }
    if (debugStep(debugState) === "locate") return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await performAutosave("submit", true);
      // The server evaluates the saved tests: send pending edits first.
      await flushStudentTests();
      // Flush telemetry before submitting - non-critical, so never let it block submit.
      try {
        await telemetryRef.current?.stop();
      } catch {
        /* telemetry flush is best-effort; ignore failures */
      }
      const { questions, tests } = await submitAttempt(id, locale);
      resumeActiveRef.current = false;
      clearResume(sessionStore(), code);
      setSubmitTests(tests ?? null);
      setExplainQuestions(questions);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
    // Invoke optional external callback (used in tests / storybook).
    onSubmit?.();
  }, [onSubmit, performAutosave, flushStudentTests, locale, t.noActiveAttempt, debugState, code]);

  // ── Debug locate step ───────────────────────────────────────────────────────
  // After a 409 (another tab located, or the attempt moved on) the server state
  // wins: reload it instead of guessing.
  const refreshDebugState = useCallback(async () => {
    const id = attemptIdRef.current;
    if (!id) return;
    try {
      const state = await getAttempt(id, locale);
      setDebugState(state.debug ?? null);
    } catch {
      // Keep the current step; the error message is already shown.
    }
  }, [locale]);

  const handleTakeHint = useCallback(async () => {
    const id = attemptIdRef.current;
    if (!id || hintLoading) return;
    setHintLoading(true);
    setLocateError(null);
    try {
      const { text } = await takeDebugHint(id, locale);
      setDebugState((prev) =>
        prev ? { ...prev, hints_used: prev.hints_used + 1, hints: [...prev.hints, text] } : prev,
      );
    } catch (err) {
      setLocateError(err instanceof Error ? err.message : t.debug.failed);
      if (err instanceof ApiError && err.status === 409) await refreshDebugState();
    } finally {
      setHintLoading(false);
    }
  }, [hintLoading, locale, refreshDebugState, t.debug.failed]);

  const sendLocation = useCallback(
    async (skipped: boolean) => {
      const id = attemptIdRef.current;
      if (!id) {
        setLocateError(t.noActiveAttempt);
        return;
      }
      if (locateSubmitting) return;
      setLocateSubmitting(true);
      setLocateError(null);
      try {
        await locateBug(id, {
          lines: skipped ? [] : locateLines,
          reason: skipped ? "" : locateReason.trim(),
          skipped,
        });
        setDebugState((prev) => (prev ? { ...prev, located: true } : prev));
        setJustLocated(true);
      } catch (err) {
        // A 422 is the server refusing the selection (e.g. more lines than it
        // allows); its detail is English-only, so show the localised sentence.
        const refused = err instanceof ApiError && err.status === 422;
        setLocateError(refused ? t.debug.refused : err instanceof Error ? err.message : t.debug.failed);
        if (err instanceof ApiError && err.status === 409) await refreshDebugState();
      } finally {
        setLocateSubmitting(false);
      }
    },
    [locateLines, locateReason, locateSubmitting, refreshDebugState, t.debug.failed, t.debug.refused, t.noActiveAttempt],
  );

  // ── Derived display values ────────────────────────────────────────────────
  const codeLines = editorCode.split("\n");
  const backSlug = level ?? levelConfig.slug;
  const fullscreenLocked = !fullscreenActive;
  const fullscreenTitle = hasStartedFullscreen ? "Fullscreen paused" : "Start Attempt";
  const fullscreenBody = hasStartedFullscreen
    ? "You left fullscreen mode. Return to fullscreen to continue this attempt."
    : "This assessment must run in fullscreen before the editor is available.";
  const fullscreenAction = hasStartedFullscreen ? "Return to fullscreen" : "Start Attempt";
  const timeLeft = formatDuration(remainingMs);
  const timerIsLow = remainingMs <= 60 * 1000;
  const autosaveLabel =
    autosaveState === "saving"
      ? "Saving..."
      : autosaveState === "error"
        ? "Autosave failed"
        : lastAutosaveAt
          ? `Saved ${new Date(lastAutosaveAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "Autosave ready";

  // Localised briefing: prefer the Vietnamese overlay, falling back to the
  // English canonical data so the problem statement + hint follow the language.
  const viCopy = locale === "vi" ? exerciseContentVi[exercise.id] : undefined;
  const problemSummary = viCopy?.summary ?? exercise.summary;
  const problemHint = viCopy?.hint ?? exercise.hint;

  // Debug exercises: locate first. Until the step is known or done, the editor,
  // Run and Submit stay locked and the free hint stays hidden (several of them
  // name the bug).
  const locating = debugStep(debugState) === "locate";
  const hintLocked = !debugResolved || locating;
  const actionsLocked = !debugResolved || locating;
  // The Tests tab opens with the editor (after the locate step on debug exercises).
  const testsTabShown = testsState !== null && starterReady && debugResolved && !locating;
  const showTests = testsTabShown && centerTab === "tests";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-body-md text-on-surface">
      <AppTopNav />

      <PanelGroup
        direction="horizontal"
        autoSaveId="codeprove-workspace"
        className={`flex flex-1 overflow-hidden transition duration-200 ${
          fullscreenLocked ? "pointer-events-none select-none blur-[1px]" : ""
        }`}
      >
        {/* Left - brief (resizable, hidden on < lg) */}
        {showLeft && (
        <>
        <Panel id="brief" order={1} defaultSize={24} minSize={15} collapsible className="flex flex-col">
          <aside className="flex h-full flex-col bg-surface-container-low">
          <div className="border-b border-outline-variant/60 p-5">
            <Link
              href={`/workspace/${backSlug}`}
              className="mb-3 inline-flex items-center gap-1 font-label-mono text-label-mono text-on-surface-variant/70 transition-colors hover:text-primary"
            >
              <Sym name="arrow_back" className="text-[15px]" /> {levelConfig.name} {t.exercisesSuffix}
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
                <Sym name="description" className="text-[16px]" /> {t.problem}
              </h3>
              <p className="text-sm leading-relaxed text-on-surface-variant">{problemSummary}</p>
            </section>
            {!hintLocked && <HintAccordion hint={problemHint} label={locale === "vi" ? "Gợi ý" : "Hint"} />}
            <WorkspaceVisualizer
              getCode={() => visualizerSource(actionsLocked, servedStarterRef.current, editorCodeRef.current)}
              exerciseCode={exercise.id}
              locked={locating}
              call={traceCall}
              onCallChange={setTraceCall}
              tracedCode={tracedCode}
              onTracedCodeChange={setTracedCode}
            />
            <section>
              <h3 className="mb-3 flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
                <Sym name="analytics" className="text-[16px]" /> {t.scoringRubric}
              </h3>
              <div className="space-y-2 font-label-mono text-label-mono">
                {RUBRIC.map(([k, v], i) => (
                  <div key={k} className="flex justify-between border-b border-outline-variant/40 pb-1.5">
                    <span className="text-on-surface-variant">{t.rubricLabels[i] ?? k}</span>
                    <span className="text-primary">{v}</span>
                  </div>
                ))}
              </div>
            </section>
            {/* Hypothesis box */}
            <section className="ice-card p-4">
              <h3 className="mb-2 font-label-caps text-label-caps uppercase tracking-widest">{t.initialHypothesis}</h3>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                onPaste={handleBlockedPaste}
                onDrop={handleBlockedDrop}
                className="h-28 w-full resize-none border border-outline-variant/60 bg-surface-container-lowest/50 p-2.5 font-label-mono text-label-mono text-on-surface outline-none focus:border-primary"
                placeholder={t.hypothesisPlaceholder}
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
                {hypothesisSending ? t.logging : t.logHypothesis}
              </button>
            </section>
          </div>
          </aside>
        </Panel>
        <ColResizeHandle />
        </>
        )}

        {/* Center - editor + terminal */}
        <Panel id="editor" order={2} minSize={30}>
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex flex-none items-center justify-between border-b border-outline-variant/60 bg-surface-container-low pr-4">
            {testsTabShown ? (
              <div className="flex" role="tablist" aria-label={t.tests.title}>
                <CenterTab active={!showTests} icon="code" label={exercise.filename} onSelect={() => setCenterTab("code")} />
                <CenterTab
                  active={showTests}
                  icon="checklist"
                  label={t.tests.tab}
                  badge={studentTests.drafts.length}
                  onSelect={() => setCenterTab("tests")}
                />
              </div>
            ) : (
            <div className="flex">
              <div className="flex items-center gap-2 border-r border-outline-variant/60 bg-background px-5 py-2.5">
                <Sym name={locating ? "lock" : "code"} className="text-[16px] text-primary" />
                <span className="font-label-mono text-label-mono">{exercise.filename}</span>
              </div>
            </div>
            )}
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex items-center gap-1.5 font-label-mono text-label-mono ${
                  timerIsLow ? "text-error" : "text-on-surface-variant"
                }`}
              >
                <Sym name="timer" className="text-[16px]" />
                <span>{timeLeft}</span>
              </div>
              <div
                className={`hidden items-center gap-1.5 font-label-mono text-label-mono md:flex ${
                  autosaveState === "error" ? "text-error" : "text-on-surface-variant/70"
                }`}
              >
                <Sym name={autosaveState === "saving" ? "sync" : "save"} className="text-[16px]" />
                <span>{autosaveLabel}</span>
              </div>
              {submitError && (
                <span className="max-w-56 truncate font-label-mono text-label-mono text-sm text-error">
                  {submitError}
                </span>
              )}
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting || actionsLocked}
                title={locating ? t.debug.actionsLocked : undefined}
                className="flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? t.submitting : t.submit}{" "}
                {!submitting && <Sym name="send" className="text-[16px]" />}
              </button>
            </div>
          </div>

          {/* Editor - textarea is the scroll container; gutter + overlay mirror
              its scroll position via handleEditorScroll. All three share the
              EDITOR_* metrics so highlighted glyphs and line numbers stay aligned
              with the real text even when scrolled deep into a long starter. */}
          {justLocated && !locating && (
            <div
              role="status"
              className="flex flex-none items-start justify-between gap-3 border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm text-on-surface"
            >
              <span className="flex items-start gap-2">
                <Sym name="lock_open" className="mt-px text-[16px] text-primary" />
                {t.debug.located}
              </span>
              <button
                type="button"
                onClick={() => setJustLocated(false)}
                aria-label={t.explainBack.close}
                className="cursor-pointer text-on-surface-variant hover:text-primary"
              >
                <Sym name="close" className="text-[16px]" />
              </button>
            </div>
          )}
          <div className="relative flex-1 overflow-hidden bg-surface-container-lowest/60">
            <div className="scanline" />
            {starterReady && locating ? (
              <LocatePanel
                code={editorCode}
                selected={locateLines}
                onToggleLine={(line) => {
                  setLocateLines((prev) => toggleLine(prev, line));
                  setLocateError(null);
                }}
                reason={locateReason}
                onReasonChange={setLocateReason}
                hints={debugState?.hints ?? []}
                hintLoading={hintLoading}
                onTakeHint={() => void handleTakeHint()}
                submitting={locateSubmitting}
                onSubmit={() => void sendLocation(false)}
                onSkip={() => void sendLocation(true)}
                error={locateError}
                onBlockedPaste={handleBlockedPaste}
                onBlockedDrop={handleBlockedDrop}
                copy={t.debug}
              />
            ) : !starterReady || !debugResolved ? (
              <div
                role="status"
                aria-live="polite"
                className="absolute inset-0 flex items-center justify-center gap-2 font-label-mono text-label-mono text-on-surface-variant"
              >
                <Sym name="progress_activity" className="animate-spin text-[18px]" />
                {t.loadingEditor}
              </div>
            ) : (
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
                  onKeyDown={handleEditorKeyDown}
                  onPaste={handleBlockedPaste}
                  onDrop={handleBlockedDrop}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  onScroll={handleEditorScroll}
                  spellCheck={false}
                  wrap="off"
                  className="ice-scroll absolute inset-0 h-full w-full resize-none overflow-auto whitespace-pre bg-transparent text-transparent caret-on-surface outline-none"
                  style={EDITOR_TEXT_STYLE}
                />
                {/* Paste-blocked banner (auto-dismisses) */}
                {pasteBlocked && (
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-md border border-warning/40 bg-warning/15 px-3 py-1.5 font-label-mono text-label-mono text-warning shadow-lg backdrop-blur-sm">
                    <Sym name="content_paste_off" className="mr-1 align-middle text-[15px]" />
                    {t.pasteDisabled}
                  </div>
                )}
              </div>
            </div>
            )}
            {/* Tests tab, drawn over the editor so the editor stays mounted (undo history, scroll). */}
            {showTests && testsState && (
              <TestsPanel
                exerciseCode={exercise.id}
                required={testsState.required}
                tests={studentTests}
                locale={locale}
                copy={t.tests}
                onBlockedPaste={handleBlockedPaste}
                onBlockedDrop={handleBlockedDrop}
              />
            )}
            {showTests && pasteBlocked && (
              <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-md border border-warning/40 bg-warning/15 px-3 py-1.5 font-label-mono text-label-mono text-warning shadow-lg backdrop-blur-sm">
                <Sym name="content_paste_off" className="mr-1 align-middle text-[15px]" />
                {t.pasteDisabled}
              </div>
            )}
          </div>

          {/* Terminal / Tests / Leaderboard (hidden while locating: nothing can run yet) */}
          {!locating && (
          <ResultTabs
            runResult={runResult}
            runError={runError}
            running={running}
            tests={exercise.tests}
            onRun={() => void handleRunTests()}
            onClear={handleClear}
            runLockedReason={actionsLocked ? t.debug.actionsLocked : undefined}
            labels={{
              testRunner: t.testRunner,
              running: t.running,
              runTests: t.runTests,
              clear: t.clear,
              runtimeVersion: t.runtimeVersion,
              collecting: t.collecting,
              found: t.found,
              pending: t.pending,
              runningTests: t.runningTests,
              passed: t.passed,
              coverage: t.coverage,
            }}
          />
          )}
        </div>

        </Panel>

        {/* Right - AI mentor (resizable, hidden on < xl) */}
        {showRight && (
        <>
        <ColResizeHandle />
        <Panel id="ciel" order={3} defaultSize={24} minSize={16} collapsible className="flex flex-col">
          <CielPanel
            initialHint={hintLocked ? t.debug.cielLocked : problemHint}
            input={chatInput}
            sending={chatSending}
            onInputChange={setChatInput}
            onSend={() => void handleChatSend()}
            onSuggestionClick={handleSuggestionClick}
            suggestions={t.promptItems}
            notice={locating ? t.debug.cielHintOnly : undefined}
            labels={{
              intro: t.cielIntro,
              verifyHint: t.verifyHint,
              thinking: t.cielThinking,
              ask: t.askCiel,
              suggestionsTitle: t.promptSuggestions,
            }}
          />
        </Panel>
        </>
        )}
      </PanelGroup>

      {/* Explain-back modal - mounted after submit API returns questions */}
      {explainQuestions !== null && attemptIdRef.current !== null && (
        <ExplainBackModal
          attemptId={attemptIdRef.current}
          questions={explainQuestions}
          tests={submitTests}
          onClose={() => setExplainQuestions(null)}
        />
      )}

      {fullscreenLocked && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/92 px-5 backdrop-blur-md">
          <div className="w-full max-w-md border border-outline-variant/70 bg-surface-container-low p-6 shadow-card">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
              <Sym name={hasStartedFullscreen ? "fullscreen_exit" : "fullscreen"} className="text-[24px]" />
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              {fullscreenTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {fullscreenBody}
            </p>
            {fullscreenError && (
              <div className="mt-4 border border-error/40 bg-error/10 p-3 font-label-mono text-label-mono text-error">
                {fullscreenError}
              </div>
            )}
            <button
              onClick={() => void handleEnterFullscreen()}
              className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-primary px-4 py-3 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90"
            >
              {fullscreenAction}
              <Sym name="open_in_full" className="text-[18px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
