import { Sym } from "@/components/app/AppChrome";
import { recurringLines } from "@/lib/progress";
import type { RecurringIssue } from "@/lib/types/learner";

export type RecurringCopy = { recurringTitle: string; recurringSub: string; recurringUnit: string };

/** Recurring risk habits with their practice phrase; renders nothing when there is none to show. */
export function RecurringCard({
  items,
  window,
  copy,
  className = "",
}: {
  items: RecurringIssue[];
  window: number;
  copy: RecurringCopy;
  className?: string;
}) {
  const lines = recurringLines(items, window, copy.recurringUnit);
  if (lines.length === 0) return null;

  return (
    <section className={`ice-card p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between border-b border-outline-variant/50 pb-4">
        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile">{copy.recurringTitle}</h2>
          <p className="mt-1 font-label-mono text-label-mono text-on-surface-variant/70">{copy.recurringSub}</p>
        </div>
        <Sym name="repeat" className="text-warning" />
      </div>
      <ul className="flex flex-col divide-y divide-outline-variant/40">
        {lines.map((line) => (
          <li key={line.code} className="flex items-start gap-3 py-3 text-sm text-on-surface">
            <Sym name="arrow_right" className="mt-0.5 shrink-0 text-[18px] text-warning" />
            <span>{line.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
