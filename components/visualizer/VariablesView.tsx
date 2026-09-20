"use client";

import type { VizValue } from "@/lib/types/trace";
import { formatVizValue } from "./vizValue";

const KIND_LABEL: Record<VizValue["kind"], string> = {
  scalar: "",
  array: "array",
  map: "map",
};

/** Variables table for the current frame; `changed` names are highlighted. */
export function VariablesView({
  locals,
  changed,
}: {
  locals: Record<string, VizValue>;
  changed: Set<string>;
}) {
  const entries = Object.entries(locals);

  if (entries.length === 0) {
    return <p className="font-label-mono text-label-mono text-on-surface-variant/50">—</p>;
  }

  return (
    <dl className="flex flex-col divide-y divide-outline-variant/40">
      {entries.map(([name, value]) => {
        const isChanged = changed.has(name);
        return (
          <div key={name} className="flex items-baseline justify-between gap-3 py-1.5">
            <dt className="flex items-center gap-2 font-label-mono text-label-mono">
              <span className={isChanged ? "text-primary" : "text-on-surface"}>{name}</span>
              {KIND_LABEL[value.kind] && (
                <span className="rounded bg-surface-container-highest px-1.5 py-0.5 text-[10px] text-on-surface-variant/60">
                  {KIND_LABEL[value.kind]}
                </span>
              )}
            </dt>
            <dd
              className={`truncate text-right font-label-mono text-sm transition-colors duration-300 ${
                isChanged ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {formatVizValue(value)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
