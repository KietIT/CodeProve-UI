"use client";

import { useEffect, useRef } from "react";
import { ChatMarkdown } from "@/components/app/ChatMarkdown";
import { hasCodeBlock } from "@/lib/chat";
import { useSessionStore } from "@/lib/stores/useSessionStore";

export type PromptLogLabels = {
  /** Shown once, before the first question is asked. */
  intro: string;
  /** Footnote under every reply that contains code (AI code can be wrong). */
  verifyHint: string;
  /** Placeholder bubble while Ciel is answering. */
  thinking: string;
};

export type PromptLogProps = {
  /** Ciel's opening hint bubble, always pinned to the top of the log. */
  initialHint: string;
  /** True while a reply is in flight (drives the thinking bubble). */
  sending: boolean;
  labels: PromptLogLabels;
};

/**
 * Renders the Ciel conversation history. The log itself lives in
 * `useSessionStore` (client-side only, per Phase 5) so this component reads it
 * straight from the store rather than taking the turns as props — keeping the
 * "prompt log is session state" contract in one place.
 */
export function PromptLog({ initialHint, sending, labels }: PromptLogProps) {
  const entries = useSessionStore((s) => s.promptLog);
  const endRef = useRef<HTMLDivElement>(null);

  // Follow the newest turn (and the thinking bubble) as it arrives.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries, sending]);

  return (
    <div className="ice-scroll flex-1 space-y-4 overflow-y-auto p-4">
      {/* Opening hint bubble */}
      <div className="border-l-2 border-primary bg-primary/5 p-3">
        <p className="text-sm leading-relaxed text-on-surface">{initialHint}</p>
      </div>

      {entries.length === 0 && (
        <div className="border-l-2 border-outline-variant/60 bg-surface-container-high/50 p-3">
          <p className="text-sm leading-relaxed text-on-surface-variant">{labels.intro}</p>
        </div>
      )}

      {entries.map((m, i) => (
        <div
          key={i}
          className={
            m.role === "user"
              ? "border-l-2 border-outline-variant/60 bg-surface-container-high/50 p-3"
              : "border-l-2 border-primary bg-primary/5 p-3"
          }
        >
          {m.role === "assistant" ? (
            <ChatMarkdown text={m.text} />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">{m.text}</p>
          )}
          {m.role === "assistant" && hasCodeBlock(m.text) && (
            <p className="mt-1 text-xs italic text-on-surface-variant/60">{labels.verifyHint}</p>
          )}
        </div>
      ))}

      {sending && (
        <div className="border-l-2 border-primary bg-primary/5 p-3">
          <p className="animate-pulse text-sm text-on-surface-variant/60">{labels.thinking}</p>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
