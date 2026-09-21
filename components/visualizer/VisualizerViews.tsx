"use client";

import { Sym } from "@/components/app/AppChrome";
import { useVisualizerStore } from "@/lib/stores/useVisualizerStore";
import { StepPlayer } from "./StepPlayer";
import { CodeTrace } from "./CodeTrace";
import { VariablesView } from "./VariablesView";
import { ArrayView } from "./ArrayView";
import { MapView } from "./MapView";
import { changedKeys } from "./vizValue";

export type VisualizerViewsCopy = { variables: string; hint: string; error: string };

/**
 * The shared visualizer output (player + code trace + array + variables), driven
 * by useVisualizerStore. Reused by the public practice page and the in-workspace
 * panel. Takes the code being visualized so CodeTrace can highlight lines.
 */
export function VisualizerViews({ code, copy }: { code: string; copy: VisualizerViewsCopy }) {
  const { frames, step, status, error } = useVisualizerStore();
  const frame = frames[step];
  const prevFrame = step > 0 ? frames[step - 1] : undefined;
  const changed = frame ? changedKeys(prevFrame?.locals, frame.locals) : new Set<string>();
  const arrayEntry = frame ? Object.entries(frame.locals).find(([, v]) => v.kind === "array") : undefined;
  const mapEntry = frame ? Object.entries(frame.locals).find(([, v]) => v.kind === "map") : undefined;

  if (status === "error") {
    return (
      <div className="rounded-lg border border-error/40 bg-error/10 p-3 font-label-mono text-label-mono text-error">
        {copy.error}: {error}
      </div>
    );
  }

  if (status !== "ready" || !frame) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-outline-variant/50 p-6 text-center text-on-surface-variant/70">
        <Sym name="animation" className="text-[36px] text-primary/50" />
        <p className="max-w-xs text-sm">{copy.hint}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <StepPlayer />
      <CodeTrace code={code} activeLine={frame.line} />
      {arrayEntry && (
        <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
          <ArrayView
            name={arrayEntry[0]}
            items={(arrayEntry[1] as { items: string[] }).items}
            ptrs={(arrayEntry[1] as { ptrs?: Record<string, number> }).ptrs}
          />
        </div>
      )}
      {mapEntry && (
        <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
          <MapView name={mapEntry[0]} entries={(mapEntry[1] as { entries: [string, string][] }).entries} />
        </div>
      )}
      <div className="rounded-lg border border-outline-variant/50 bg-surface-container-low p-4">
        <div className="mb-2 font-label-mono text-label-mono uppercase text-on-surface-variant/70">{copy.variables}</div>
        <VariablesView locals={frame.locals} changed={changed} />
      </div>
    </div>
  );
}
