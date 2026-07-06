"use client";

// Pinned monospace stack for actual code display - deliberately independent
// of the --font-mono CSS variable, which now resolves to Inter sans-serif
// site-wide (see feat/replace-jetbrains-mono). Matches the exact stack
// components/app/SolveWorkspace.tsx uses for its own code editor.
const CODE_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

type CodeBlockProps = {
  code: string;
  selectedLine: number | null;
  onSelectLine: (line: number) => void;
  /** The real bug's line number, set only once the answer has been revealed. */
  revealedLine?: number | null;
  disabled?: boolean;
};

export function CodeBlock({
  code,
  selectedLine,
  onSelectLine,
  revealedLine = null,
  disabled = false,
}: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-surface/60 p-4">
      <div style={{ fontFamily: CODE_FONT_FAMILY, fontSize: 13, lineHeight: "21px" }}>
        {lines.map((line, i) => {
          const num = i + 1;
          const isRevealedBug = revealedLine === num;
          const isSelected = selectedLine === num;
          // Reveal state always wins visually over the user's own pick, so a
          // correct guess and the revealed answer don't fight over which
          // background color applies to the same line.
          const bgClass = isRevealedBug ? "bg-error/20" : isSelected ? "bg-primary/20" : "";
          return (
            <div
              key={num}
              onClick={() => !disabled && onSelectLine(num)}
              className={`flex gap-4 rounded px-2 transition-colors duration-150 ${bgClass} ${
                disabled ? "" : "cursor-pointer hover:bg-primary/10"
              }`}
            >
              <span className="w-6 shrink-0 select-none text-right text-muted/60">{num}</span>
              <span className="whitespace-pre text-content">{line || " "}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
