import type { AxisLevel } from "@/lib/types/report";
import { fill } from "./diagnosis";

export type AxisRow = {
  key: string;
  label: string;
  /** 0-100, `null` when not applicable; used only when the report has no level. */
  pct: number | null;
  /** 0-3, `null` = not applicable, `undefined` = engine v1 report (no level). */
  level: AxisLevel | undefined;
  naReason?: string;
};

export type AxisLevelsCopy = {
  naLabel: string;
  levelNames: readonly string[];
  levelAria: string;
};

const MAX_LEVEL = 3;

/** One row per axis: a level label + segmented bar, or the older % bar. */
export function AxisLevels({ rows, copy }: { rows: AxisRow[]; copy: AxisLevelsCopy }) {
  return (
    <>
      {rows.map((row) => (
        <div key={row.key}>
          {row.level === null || (row.level === undefined && row.pct === null) ? (
            <NotApplicableRow row={row} copy={copy} />
          ) : row.level === undefined ? (
            <PercentRow label={row.label} pct={row.pct ?? 0} />
          ) : (
            <LevelRow label={row.label} level={row.level} copy={copy} />
          )}
        </div>
      ))}
    </>
  );
}

function LevelRow({ label, level, copy }: { label: string; level: number; copy: AxisLevelsCopy }) {
  const name = copy.levelNames[level] ?? String(level);
  return (
    <>
      <div className="mb-2 flex justify-between font-label-mono text-label-mono">
        <span>{label}</span>
        <span className="text-primary">{name}</span>
      </div>
      <div
        role="img"
        aria-label={fill(copy.levelAria, { axis: label, level: name, n: level })}
        className="flex h-1.5 w-full gap-1"
      >
        {Array.from({ length: MAX_LEVEL }, (_, i) => (
          <span
            key={i}
            data-filled={i < level ? "true" : "false"}
            className={`h-full flex-1 ${i < level ? "bg-primary" : "bg-surface-container-highest"}`}
          />
        ))}
      </div>
    </>
  );
}

function PercentRow({ label, pct }: { label: string; pct: number }) {
  return (
    <>
      <div className="mb-2 flex justify-between font-label-mono text-label-mono">
        <span>{label}</span>
        <span className="text-primary">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden bg-surface-container-highest">
        <div
          className="animate-progress h-full bg-primary"
          style={{ ["--final-width" as string]: `${pct}%` }}
        />
      </div>
    </>
  );
}

function NotApplicableRow({ row, copy }: { row: AxisRow; copy: AxisLevelsCopy }) {
  return (
    <>
      <div className="mb-2 flex justify-between font-label-mono text-label-mono">
        <span>{row.label}</span>
        <span className="text-on-surface-variant/40">{copy.naLabel}</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-highest opacity-30" />
      {row.naReason && <p className="mt-1 text-xs text-on-surface-variant/60">{row.naReason}</p>}
    </>
  );
}
