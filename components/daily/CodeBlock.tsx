"use client";

// Pinned monospace stack for actual code display - deliberately independent
// of the --font-mono CSS variable, which now resolves to Inter sans-serif
// site-wide (see feat/replace-jetbrains-mono). Matches the exact stack
// components/app/SolveWorkspace.tsx uses for its own code editor.
const CODE_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

/**
 * How a line is highlighted. "selected" = the student's pick, "bug" = the
 * revealed answer (Daily); "hit" / "missed" / "extra" = the debug-exercise
 * reveal (a bug line picked, a bug line not picked, a pick outside the bug).
 */
export type LineMark = "selected" | "bug" | "hit" | "missed" | "extra";

export const MARK_CLASS: Record<LineMark, string> = {
  selected: "bg-primary/20",
  bug: "bg-error/20",
  hit: "bg-success/25 shadow-[inset_3px_0_0_rgb(var(--success))]",
  missed: "bg-error/35 shadow-[inset_3px_0_0_rgb(var(--error))]",
  extra: "bg-on-surface/10 shadow-[inset_3px_0_0_rgb(var(--warning))]",
};

/** Shown next to the line number when labels are given, so marks read without colour. */
export const MARK_SYMBOL: Record<LineMark, string> = {
  selected: "●",
  bug: "✗",
  hit: "✓",
  missed: "✗",
  extra: "•",
};

const TAG_CLASS: Record<LineMark, string> = {
  selected: "text-primary",
  bug: "text-error",
  hit: "text-success",
  missed: "text-error",
  extra: "text-warning",
};

type CodeBlockProps = {
  code: string;
  /** Highlight per 1-based line number. */
  marks?: ReadonlyMap<number, LineMark>;
  /** Makes lines clickable (and keyboard-togglable) when set. */
  onSelectLine?: (line: number) => void;
  /**
   * Short text per mark. When set, marked lines get a symbol next to the line
   * number and the text at the end of the line (screen readers only on narrow
   * screens, where long lines scroll and would hide it).
   */
  markLabels?: Partial<Record<LineMark, string>>;
  disabled?: boolean;
  ariaLabel?: string;
};

export function CodeBlock({
  code,
  marks,
  onSelectLine,
  markLabels,
  disabled = false,
  ariaLabel,
}: CodeBlockProps) {
  const lines = code.split("\n");
  const interactive = Boolean(onSelectLine) && !disabled;

  return (
    <div
      className="overflow-x-auto rounded-card border border-border bg-surface/60 p-4"
      role={interactive ? "group" : undefined}
      aria-label={ariaLabel}
    >
      <div style={{ fontFamily: CODE_FONT_FAMILY, fontSize: 13, lineHeight: "21px" }}>
        {lines.map((line, i) => {
          const num = i + 1;
          const mark = marks?.get(num);
          const tag = mark ? markLabels?.[mark] : undefined;
          const select = () => {
            if (interactive) onSelectLine?.(num);
          };
          return (
            <div
              key={num}
              onClick={select}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select();
                }
              }}
              role={interactive ? "checkbox" : undefined}
              aria-checked={interactive ? mark === "selected" : undefined}
              tabIndex={interactive ? 0 : undefined}
              className={`flex gap-4 rounded px-2 outline-none transition-colors duration-150 ${
                mark ? MARK_CLASS[mark] : ""
              } ${
                interactive
                  ? "cursor-pointer hover:bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary"
                  : ""
              }`}
            >
              <span className="w-6 shrink-0 select-none text-right text-muted/60">{num}</span>
              {markLabels && (
                <span aria-hidden="true" className={`-ml-2 w-3 shrink-0 select-none text-center font-bold ${mark ? TAG_CLASS[mark] : ""}`}>
                  {mark ? MARK_SYMBOL[mark] : ""}
                </span>
              )}
              <span className="flex-1 whitespace-pre text-content">{line || " "}</span>
              {mark && tag && (
                <span
                  className={`sr-only shrink-0 select-none self-center text-[11px] font-semibold sm:not-sr-only ${TAG_CLASS[mark]}`}
                >
                  {tag}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
