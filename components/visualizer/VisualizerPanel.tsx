"use client";

import { useState } from "react";
import { Sym } from "@/components/app/AppChrome";
import { useTrace } from "@/hooks/useTrace";
import { useVisualizerStore } from "@/lib/stores/useVisualizerStore";
import { StepPlayer } from "./StepPlayer";
import { CodeTrace } from "./CodeTrace";
import { VariablesView } from "./VariablesView";
import { ArrayView } from "./ArrayView";
import { changedKeys } from "./vizValue";
import { useI18n } from "@/lib/i18n";

// Seeded with the hash-map Two Sum so the mock trace's line numbers line up
// with the editor while the backend endpoint is still being built.
const DEFAULT_CODE = `def two_sum(nums, target):
    seen = {}
    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in seen:
            return [seen[complement], i]
        seen[nums[i]] = i`;

const copy = {
  vi: {
    codeLabel: "Code",
    visualize: "Xem chạy",
    running: "Đang chạy…",
    variables: "Biến",
    hint: "Viết code rồi bấm “Xem chạy” để xem thuật toán chạy từng bước.",
    error: "Không chạy được",
  },
  en: {
    codeLabel: "Code",
    visualize: "Visualize",
    running: "Running…",
    variables: "Variables",
    hint: "Write code, then press “Visualize” to watch it run step by step.",
    error: "Run failed",
  },
} as const;

export function VisualizerPanel() {
  const { locale } = useI18n();
  const c = copy[locale];
  const [code, setCode] = useState(DEFAULT_CODE);

  const trace = useTrace();
  const { frames, step, status, error } = useVisualizerStore();

  const frame = frames[step];
  const prevFrame = step > 0 ? frames[step - 1] : undefined;
  const changed = frame ? changedKeys(prevFrame?.locals, frame.locals) : new Set<string>();
  const arrayEntry = frame
    ? Object.entries(frame.locals).find(([, v]) => v.kind === "array")
    : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: editor + run */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">
            {c.codeLabel}
          </span>
          <button
            onClick={() => trace.mutate(code)}
            disabled={trace.isPending}
            className="flex items-center gap-2 bg-primary px-4 py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Sym name={trace.isPending ? "progress_activity" : "play_arrow"} className={`text-[18px] ${trace.isPending ? "animate-spin" : ""}`} />
            {trace.isPending ? c.running : c.visualize}
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="h-72 w-full resize-none rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-3 font-label-mono text-sm text-on-surface outline-none focus:border-primary"
        />
        {status === "error" && (
          <div className="rounded-lg border border-error/40 bg-error/10 p-3 font-label-mono text-label-mono text-error">
            {c.error}: {error}
          </div>
        )}
      </div>

      {/* Right: playback + views */}
      <div className="flex flex-col gap-4">
        {status !== "ready" || !frame ? (
          <div className="flex h-full min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-outline-variant/50 p-6 text-center text-on-surface-variant/70">
            <Sym name="animation" className="text-[40px] text-primary/50" />
            <p className="max-w-xs text-sm">{c.hint}</p>
          </div>
        ) : (
          <>
            <StepPlayer />
            <CodeTrace code={code} activeLine={frame.line} />
            {arrayEntry && (
              <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
                <ArrayView
                  name={arrayEntry[0]}
                  items={(arrayEntry[1] as { items: string[] }).items}
                  ptrs={(arrayEntry[1] as { ptrs?: Record<string, number> }).ptrs}
                />
              </div>
            )}
            <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
              <div className="mb-2 font-label-mono text-label-mono uppercase text-on-surface-variant/70">
                {c.variables}
              </div>
              <VariablesView locals={frame.locals} changed={changed} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
