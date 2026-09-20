"use client";

/**
 * Renders a 1D array as cells with pointer labels beneath the indices they
 * reference. Cells targeted by any pointer are highlighted. Pure/presentational.
 */
export function ArrayView({
  name,
  items,
  ptrs = {},
}: {
  name: string;
  items: string[];
  ptrs?: Record<string, number>;
}) {
  // index -> list of pointer names sitting on it
  const labelsByIndex = new Map<number, string[]>();
  for (const [ptr, idx] of Object.entries(ptrs)) {
    if (!labelsByIndex.has(idx)) labelsByIndex.set(idx, []);
    labelsByIndex.get(idx)!.push(ptr);
  }

  return (
    <div>
      <div className="mb-2 font-label-mono text-label-mono text-on-surface-variant/70">{name}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((val, i) => {
          const labels = labelsByIndex.get(i);
          const active = !!labels;
          return (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg border font-label-mono text-sm transition-colors duration-300 ${
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-outline-variant/60 bg-surface-container-lowest text-on-surface"
                }`}
              >
                {val}
              </div>
              <div className="mt-1 h-4 font-label-mono text-[11px] text-on-surface-variant/50">{i}</div>
              <div className="h-4 font-label-mono text-[11px] font-semibold text-primary">
                {labels ? labels.join(",") : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
