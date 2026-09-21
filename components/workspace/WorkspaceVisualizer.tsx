"use client";

import { useState } from "react";
import { Sym } from "@/components/app/AppChrome";
import { useTrace } from "@/hooks/useTrace";
import { VisualizerViews } from "@/components/visualizer/VisualizerViews";
import { useI18n } from "@/lib/i18n";

const copy = {
  vi: {
    title: "Xem thuật toán chạy",
    visualize: "Xem chạy",
    running: "Đang chạy…",
    variables: "Biến",
    hint: "Bấm “Xem chạy” để tua từng bước code của bạn: ô mảng, con trỏ và biến thay đổi.",
    error: "Không chạy được",
  },
  en: {
    title: "Watch it run",
    visualize: "Visualize",
    running: "Running…",
    variables: "Variables",
    hint: "Press “Visualize” to step through your code: array cells, pointers and variables change.",
    error: "Run failed",
  },
} as const;

/**
 * In-workspace algorithm visualizer. Traces the CURRENT editor code (read on
 * click via getCode) and steps through it inline, next to the problem - so the
 * student solves and watches in one place. Reuses the shared VisualizerViews.
 */
export function WorkspaceVisualizer({ getCode }: { getCode: () => string }) {
  const { locale } = useI18n();
  const c = copy[locale];
  const trace = useTrace();
  const [tracedCode, setTracedCode] = useState("");

  const onVisualize = () => {
    const code = getCode();
    setTracedCode(code);
    trace.mutate(code);
  };

  return (
    <section className="border border-outline-variant/50">
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
      <div className="p-4">
        <VisualizerViews code={tracedCode} copy={{ variables: c.variables, hint: c.hint, error: c.error }} />
      </div>
    </section>
  );
}
