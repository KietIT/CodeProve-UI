import Link from "next/link";
import { Sym } from "@/components/app/AppChrome";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { Finding, FindingText } from "@/lib/types/report";
import { exerciseHref, fill } from "./diagnosis";

type Severity = NonNullable<Finding["severity"]>;

export type FindingCopy = {
  severityNames: Readonly<Record<Severity, string>>;
  findingFields: Readonly<Record<keyof FindingText, string>>;
  openExercise: string;
};

const SEVERITY_TONE: Record<Severity, BadgeTone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

const FIELD_ORDER: (keyof FindingText)[] = ["what_happened", "why_it_matters", "how_to_improve", "try_next"];

/** One diagnosis finding. Backend texts are plain text: rendered as React children only. */
export function FindingCard({
  finding,
  axisLabel,
  copy,
}: {
  finding: Finding;
  axisLabel: string;
  copy: FindingCopy;
}) {
  const isRisk = finding.kind === "risk";
  return (
    <article className={`ice-card border-l-2 p-5 ${isRisk ? "border-l-error" : "border-l-primary"}`}>
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <Sym name={isRisk ? "science" : "verified"} className={isRisk ? "text-error" : "text-primary"} />
        <h4 className="font-medium">{axisLabel}</h4>
        {isRisk && finding.severity && (
          <Badge tone={SEVERITY_TONE[finding.severity]}>{copy.severityNames[finding.severity]}</Badge>
        )}
      </header>
      <dl className="space-y-3">
        {FIELD_ORDER.map((field) => (
          <div key={field}>
            <dt className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">
              {copy.findingFields[field]}
            </dt>
            <dd className="mt-1 whitespace-pre-line text-sm text-on-surface-variant">
              {finding.text[field]}
              {field === "try_next" && finding.next_exercise && (
                <Link
                  href={exerciseHref(finding.next_exercise)}
                  className="mt-2 flex w-fit items-center gap-1 font-label-mono text-label-mono text-primary hover:underline"
                >
                  {fill(copy.openExercise, { code: finding.next_exercise })}
                  <Sym name="arrow_forward" className="text-[16px]" />
                </Link>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
