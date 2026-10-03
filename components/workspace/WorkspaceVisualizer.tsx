"use client";

import { Sym } from "@/components/app/AppChrome";
import { useTrace } from "@/hooks/useTrace";
import { VisualizerViews } from "@/components/visualizer/VisualizerViews";
import { buildTraceInput, callPlaceholder } from "@/components/workspace/visualizerInput";
import { useI18n } from "@/lib/i18n";

const copy = {
  vi: {
    title: "Xem thuật toán chạy",
    visualize: "Xem chạy",
    running: "Đang chạy…",
    variables: "Biến",
    hint: "Bấm “Xem chạy” để tua từng bước code của bạn: ô mảng, con trỏ và biến thay đổi.",
    lockedHint: "Bấm “Xem chạy” để tua từng bước code của đề (chỉ đọc) và xem lỗi xảy ra ở đâu.",
    error: "Không chạy được",
    callLabel: "Lời gọi (tuỳ chọn)",
    callDefault: "Để trống: dùng input của test mẫu đầu tiên.",
  },
  en: {
    title: "Watch it run",
    visualize: "Visualize",
    running: "Running…",
    variables: "Variables",
    hint: "Press “Visualize” to step through your code: array cells, pointers and variables change.",
    lockedHint: "Press “Visualize” to step through the exercise code (read-only) and see where it goes wrong.",
    error: "Run failed",
    callLabel: "Call (optional)",
    callDefault: "Leave empty to use the first sample test's input.",
  },
} as const;

/**
 * In-workspace algorithm visualizer. Traces the code returned by getCode (read
 * on click: the editor's code, or the served starter while the editor is
 * locked) and steps through it inline, next to the problem - so the student
 * solves and watches in one place. Reuses the shared VisualizerViews.
 */
export function WorkspaceVisualizer({
  getCode,
  exerciseCode,
  locked = false,
  call,
  onCallChange,
  tracedCode,
  onTracedCodeChange,
}: {
  getCode: () => string;
  exerciseCode: string;
  /** The editor is read-only (debug locate step): the code traced is the starter. */
  locked?: boolean;
  /** Owned by the workspace so the trace survives the side panel closing. */
  call: string;
  onCallChange: (call: string) => void;
  /** The code of the trace on screen (its line numbers match the frames). */
  tracedCode: string;
  onTracedCodeChange: (code: string) => void;
}) {
  const { locale } = useI18n();
  const c = copy[locale];
  const trace = useTrace();

  const onVisualize = () => {
    if (trace.isPending) return;
    const code = getCode();
    onTracedCodeChange(code);
    trace.mutate(buildTraceInput(code, exerciseCode, call));
  };

  const example = callPlaceholder(getCode());

  return (
    <section className="rounded-2xl border border-outline-variant/50">
      <div className="flex items-center justify-between gap-2 border-b border-outline-variant/40 px-4 py-3">
        <span className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
          <Sym name="animation" className="text-[16px]" /> {c.title}
        </span>
        <button
          onClick={onVisualize}
          disabled={trace.isPending}
          className="flex items-center gap-1.5 bg-primary px-3 py-1.5 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Sym name={trace.isPending ? "progress_activity" : "play_arrow"} className={`text-[16px] ${trace.isPending ? "animate-spin" : ""}`} />
          {trace.isPending ? c.running : c.visualize}
        </button>
      </div>
      <label className="block border-b border-outline-variant/40 px-4 py-3">
        <span className="mb-1 block font-label-mono text-[11px] uppercase text-on-surface-variant/80">{c.callLabel}</span>
        <input
          value={call}
          onChange={(e) => onCallChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onVisualize();
            }
          }}
          spellCheck={false}
          placeholder={example}
          className="rounded-xl w-full border border-outline-variant/60 bg-surface-container-lowest/50 px-2.5 py-1.5 font-label-mono text-label-mono text-on-surface outline-none focus:border-primary"
        />
        <span className="mt-1 block text-[11px] text-on-surface-variant/70">{c.callDefault}</span>
      </label>
      <div className="p-4">
        <VisualizerViews
          code={tracedCode}
          copy={{ variables: c.variables, hint: locked ? c.lockedHint : c.hint, error: c.error }}
        />
      </div>
    </section>
  );
}
