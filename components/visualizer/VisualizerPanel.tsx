"use client";

import { useState } from "react";
import { Sym } from "@/components/app/AppChrome";
import { useTrace } from "@/hooks/useTrace";
import { VisualizerViews } from "./VisualizerViews";
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: editor + run */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">{c.codeLabel}</span>
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
      </div>

      {/* Right: playback + views */}
      <VisualizerViews code={code} copy={{ variables: c.variables, hint: c.hint, error: c.error }} />
    </div>
  );
}
