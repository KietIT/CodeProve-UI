import { Sym } from "@/components/app/AppChrome";
import { capitalise, seriesPath } from "@/lib/progress";
import { AXIS_KEYS, type AxisKey, type HistoryItem } from "@/lib/types/learner";

export type TrendsCopy = {
  scoreTitle: string;
  scoreSub: string;
  trendsTitle: string;
  trendsSub: string;
};

// Score chart boxes: wide and flat on larger screens, closer to square on
// phones so the line keeps a readable height at full card width.
type ChartBox = { width: number; height: number; padX: number; padY: number; max: number };
const SCORE_WIDE: ChartBox = { width: 720, height: 160, padX: 12, padY: 12, max: 100 };
const SCORE_NARROW: ChartBox = { width: 320, height: 160, padX: 10, padY: 12, max: 100 };
// One small chart per axis, levels 0..3.
const AXIS = { width: 220, height: 72, padX: 18, padY: 8, max: 3 };

const reportLabel = (h: HistoryItem) => `${h.code} · ${h.title}`;

function ScoreChart({ history, box, className }: { history: HistoryItem[]; box: ChartBox; className: string }) {
  const { d, points } = seriesPath(history.map((h) => h.overall), box);
  const innerH = box.height - 2 * box.padY;
  return (
    <svg viewBox={`0 0 ${box.width} ${box.height}`} className={`h-auto w-full ${className}`} role="img">
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={box.padX}
          x2={box.width - box.padX}
          y1={box.padY + g * innerH}
          y2={box.padY + g * innerH}
          stroke="rgb(var(--outline-variant))"
          strokeWidth="1"
          strokeOpacity="0.4"
        />
      ))}
      <path d={d} fill="none" stroke="rgb(var(--primary))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p.index} cx={p.x} cy={p.y} r="3.5" fill="rgb(var(--background))" stroke="rgb(var(--primary))" strokeWidth="2">
          <title>{`${reportLabel(history[p.index])} · ${Math.round(p.value)}`}</title>
        </circle>
      ))}
    </svg>
  );
}

function AxisChart({ history, axis, label, naLabel }: { history: HistoryItem[]; axis: AxisKey; label: string; naLabel: string }) {
  const values = history.map((h) => h.levels?.[axis] ?? null);
  const { d, points } = seriesPath(values, AXIS);
  const innerH = AXIS.height - 2 * AXIS.padY;
  const yAt = (level: number) => AXIS.height - AXIS.padY - (level / AXIS.max) * innerH;

  return (
    <div className="rounded-lg border border-outline-variant/40 p-3">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-label-mono text-label-mono text-on-surface-variant">{label}</span>
        {points.length === 0 && <span className="font-label-mono text-label-mono text-on-surface-variant/40">{naLabel}</span>}
      </div>
      <svg viewBox={`0 0 ${AXIS.width} ${AXIS.height}`} className="h-auto w-full" role="img" aria-label={label}>
        {[0, 1, 2, 3].map((level) => (
          <g key={level}>
            <line
              x1={AXIS.padX}
              x2={AXIS.width - AXIS.padX}
              y1={yAt(level)}
              y2={yAt(level)}
              stroke="rgb(var(--outline-variant))"
              strokeWidth="1"
              strokeOpacity={level === 0 ? 0.6 : 0.3}
            />
            {(level === 0 || level === 3) && (
              <text x={2} y={yAt(level) + 3} fontSize="9" className="fill-on-surface-variant/60 font-label-mono">
                {level}
              </text>
            )}
          </g>
        ))}
        <path d={d} fill="none" stroke="rgb(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.index} cx={p.x} cy={p.y} r="2.75" fill="rgb(var(--primary))">
            <title>{`${reportLabel(history[p.index])} · ${p.value}/3`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

/**
 * Overall score line plus one small level chart per axis over `history`.
 * Reports without levels (old v1) and non-applicable axes are gaps. Renders
 * nothing when there is no history (backends before P3.5 do not send it).
 */
export function TrendsCard({
  history,
  axesLabels,
  naLabel,
  copy,
}: {
  history: HistoryItem[];
  axesLabels: Record<string, string>;
  naLabel: string;
  copy: TrendsCopy;
}) {
  if (history.length === 0) return null;
  const hasLevels = history.some((h) => h.levels !== null);

  return (
    <section className="ice-card mb-6 p-6">
      <div className="mb-6 flex items-center justify-between border-b border-outline-variant/50 pb-4">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{copy.scoreTitle}</h2>
          <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{copy.scoreSub}</p>
        </div>
        <Sym name="show_chart" className="text-primary" />
      </div>
      <ScoreChart history={history} box={SCORE_NARROW} className="sm:hidden" />
      <ScoreChart history={history} box={SCORE_WIDE} className="hidden sm:block" />

      {hasLevels && (
        <>
          <div className="mb-4 mt-8 border-b border-outline-variant/50 pb-4">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{copy.trendsTitle}</h2>
            <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{copy.trendsSub}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AXIS_KEYS.map((axis) => (
              <AxisChart
                key={axis}
                history={history}
                axis={axis}
                label={axesLabels[capitalise(axis)] ?? capitalise(axis)}
                naLabel={naLabel}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
