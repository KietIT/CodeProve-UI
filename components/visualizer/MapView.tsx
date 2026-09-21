"use client";

/** Renders a dict/hash-map as key → value chips. Pure/presentational. */
export function MapView({ name, entries }: { name: string; entries: [string, string][] }) {
  return (
    <div>
      <div className="mb-2 font-label-mono text-label-mono text-on-surface-variant/70">{name}</div>
      {entries.length === 0 ? (
        <span className="font-label-mono text-label-mono text-on-surface-variant/50">{"{ }"}</span>
      ) : (
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v], i) => (
            <div
              key={`${k}-${i}`}
              className="flex items-center overflow-hidden rounded-lg border border-primary/40 font-label-mono text-sm transition-colors duration-300"
            >
              <span className="bg-primary/15 px-2.5 py-1 text-primary">{k}</span>
              <span className="px-2.5 py-1 text-on-surface">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
