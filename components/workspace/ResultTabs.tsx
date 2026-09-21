"use client";

import { useState } from "react";
import { Sym } from "@/components/app/AppChrome";
import type { RunResult } from "@/lib/types/attempt";
import { useI18n } from "@/lib/i18n";

export type ResultLabels = {
  testRunner: string;
  running: string;
  runTests: string;
  clear: string;
  runtimeVersion: string;
  collecting: string;
  found: string;
  pending: string;
  runningTests: string;
  passed: string;
  coverage: string;
};

const tabCopy = {
  vi: { terminal: "Terminal", tests: "Tests", leaderboard: "Bảng xếp hạng", soon: "Sắp có", pass: "Đạt", fail: "Trượt" },
  en: { terminal: "Terminal", tests: "Tests", leaderboard: "Leaderboard", soon: "Soon", pass: "Pass", fail: "Fail" },
} as const;

type Tab = "terminal" | "tests" | "leaderboard";

/**
 * Run output as tabs (Terminal / Tests / Leaderboard). Presentational: all run
 * state + handlers come from props, so it holds no attempt logic and is
 * unit-testable. "Pending" (no result yet) is visually distinct from "Fail".
 */
export function ResultTabs({
  runResult,
  runError,
  running,
  tests,
  onRun,
  onClear,
  labels,
}: {
  runResult: RunResult | null;
  runError: string | null;
  running: boolean;
  tests: string[];
  onRun: () => void;
  onClear: () => void;
  labels: ResultLabels;
}) {
  const { locale } = useI18n();
  const c = tabCopy[locale];
  const [tab, setTab] = useState<Tab>("terminal");

  const tabs: { key: Tab; label: string }[] = [
    { key: "terminal", label: c.terminal },
    { key: "tests", label: c.tests },
    { key: "leaderboard", label: c.leaderboard },
  ];

  return (
    <div className="flex h-56 flex-none flex-col border-t border-outline-variant/60 bg-surface-container-lowest">
      {/* Tab bar + actions */}
      <div className="flex items-center justify-between border-b border-outline-variant/60 bg-surface-container-low pr-2">
        <div className="flex">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              aria-pressed={tab === tb.key}
              className={`border-b-2 px-4 py-2 font-label-mono text-label-mono uppercase transition-colors ${
                tab === tb.key
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRun}
            disabled={running}
            className="cursor-pointer bg-primary px-3 py-1 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {running ? labels.running : labels.runTests}
          </button>
          <button
            onClick={onClear}
            className="cursor-pointer border border-outline-variant/60 px-3 py-1 font-label-mono text-label-mono uppercase text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            {labels.clear}
          </button>
        </div>
      </div>

      <div className="ice-scroll flex-1 overflow-y-auto p-4 font-label-mono text-label-mono">
        {tab === "terminal" && (
          <div className="space-y-1.5">
            <div className="text-on-surface-variant/70">{labels.runtimeVersion}</div>
            {!runResult && !runError && !running && (
              <>
                <div className="text-on-surface-variant/70">{labels.collecting} {tests.length} {labels.found}</div>
                {tests.map((tc) => (
                  <div key={tc} className="text-on-surface-variant/50">· {tc} {labels.pending}</div>
                ))}
                <div className="text-on-surface-variant/70">&gt; _</div>
              </>
            )}
            {running && <div className="animate-pulse text-primary">{labels.runningTests}</div>}
            {runError && <div className="text-error">[ERROR] {runError}</div>}
            {runResult && (
              <>
                {runResult.runtime_error && <div className="text-error">[RUNTIME ERROR] {runResult.runtime_error}</div>}
                {runResult.cases.map((cs) => (
                  <div key={cs.name} className={cs.passed ? "text-primary" : "text-error"}>
                    [{cs.passed ? "PASS" : "FAIL"}] {cs.name}
                    {cs.stdout && <span className="ml-2 text-on-surface-variant/60">{cs.stdout}</span>}
                    {cs.error && <div className="ml-4 text-error/80">{cs.error}</div>}
                  </div>
                ))}
                <div className="mt-1 text-on-surface-variant/70">
                  {runResult.passed}/{runResult.total} {labels.passed} · {labels.coverage} {Math.round(runResult.coverage * 100)}%
                </div>
              </>
            )}
          </div>
        )}

        {tab === "tests" && (
          <ul className="space-y-1.5">
            {(runResult ? runResult.cases : tests.map((name) => ({ name, passed: false, pending: true }))).map(
              (cs: { name: string; passed: boolean; pending?: boolean }) => {
                const state = cs.pending ? "pending" : cs.passed ? "pass" : "fail";
                const dot = state === "pass" ? "bg-primary" : state === "fail" ? "bg-error" : "bg-outline-variant";
                const text = state === "pass" ? "text-primary" : state === "fail" ? "text-error" : "text-on-surface-variant/60";
                const label = state === "pass" ? c.pass : state === "fail" ? c.fail : labels.pending;
                return (
                  <li key={cs.name} className="flex items-center justify-between border-b border-outline-variant/40 py-1.5 last:border-0">
                    <span className="flex items-center gap-2 text-on-surface">
                      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                      {cs.name}
                    </span>
                    <span className={text}>{label}</span>
                  </li>
                );
              },
            )}
          </ul>
        )}

        {tab === "leaderboard" && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-on-surface-variant/50">
            <Sym name="leaderboard" className="text-[32px]" />
            <span>{c.leaderboard} · {c.soon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
