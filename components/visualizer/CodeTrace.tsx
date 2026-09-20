"use client";

/** Read-only code view with the currently executing line highlighted. */
export function CodeTrace({ code, activeLine }: { code: string; activeLine: number }) {
  const lines = code.split("\n");
  return (
    <div className="overflow-auto rounded-lg border border-outline-variant/50 bg-surface-container-lowest font-label-mono text-sm">
      {lines.map((line, i) => {
        const n = i + 1;
        const active = n === activeLine;
        return (
          <div
            key={i}
            className={`flex transition-colors duration-200 ${
              active ? "bg-primary/15" : ""
            }`}
          >
            <span className="w-10 flex-none select-none border-r border-outline-variant/40 px-2 py-0.5 text-right text-on-surface-variant/40">
              {n}
            </span>
            <span
              className={`whitespace-pre px-3 py-0.5 ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {line || " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}
