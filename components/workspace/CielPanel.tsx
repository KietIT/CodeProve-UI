"use client";

import { Sym } from "@/components/app/AppChrome";
import { PromptLog, type PromptLogLabels } from "@/components/workspace/PromptLog";

export type CielPanelLabels = PromptLogLabels & {
  /** Input placeholder. */
  ask: string;
  /** Heading above the suggestion list. */
  suggestionsTitle: string;
};

export type CielPanelProps = {
  /** Ciel's opening hint (pinned to the top of the log). */
  initialHint: string;
  /** Controlled value of the question input. */
  input: string;
  /** True while a reply is in flight. */
  sending: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestionClick: (suggestion: string) => void;
  suggestions: readonly string[];
  labels: CielPanelLabels;
};

/**
 * The Workspace's right column: the Ciel mentor. UI only — it owns no API
 * logic. The conversation is rendered by <PromptLog> (which reads the session
 * store); sending is driven by the parent via `onSend`, which routes through
 * the `useCiel` hook. This is the "change the UI wrapper, not the call" split
 * from Phase 5.
 */
export function CielPanel({
  initialHint,
  input,
  sending,
  onInputChange,
  onSend,
  onSuggestionClick,
  suggestions,
  labels,
}: CielPanelProps) {
  return (
    <aside className="flex h-full flex-col border-l border-outline-variant/60 bg-surface-container-low">
      <div className="flex flex-1 flex-col overflow-hidden border-b border-outline-variant/60">
        <div className="flex items-center justify-between border-b border-outline-variant/60 p-4">
          <div className="flex items-center gap-2">
            <Sym name="smart_toy" className="text-primary" />
            <span className="font-label-mono text-label-mono uppercase">Ciel</span>
          </div>
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        </div>

        <PromptLog
          initialHint={initialHint}
          sending={sending}
          labels={{ intro: labels.intro, verifyHint: labels.verifyHint, thinking: labels.thinking }}
        />

        <div className="border-t border-outline-variant/60 p-4">
          <div className="relative">
            <input
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={sending}
              className="w-full border border-outline-variant/60 bg-surface-container-lowest/50 p-2.5 pr-10 font-label-mono text-label-mono outline-none focus:border-primary disabled:opacity-50"
              placeholder={labels.ask}
              type="text"
            />
            <button
              aria-label="Send"
              onClick={onSend}
              disabled={sending || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-primary disabled:opacity-40"
            >
              <Sym name="send" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-1/3 flex-col">
        <div className="border-b border-outline-variant/60 p-4">
          <h3 className="font-label-mono text-label-mono uppercase">{labels.suggestionsTitle}</h3>
        </div>
        <div className="ice-scroll flex-1 space-y-2 overflow-y-auto p-3">
          {suggestions.map((p) => (
            <button
              key={p}
              onClick={() => onSuggestionClick(p)}
              disabled={sending}
              className="w-full cursor-pointer border border-outline-variant/50 p-2 text-left font-label-mono text-label-mono text-on-surface-variant transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
