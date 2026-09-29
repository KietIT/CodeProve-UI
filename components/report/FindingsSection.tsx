import type { Diagnosis, Finding } from "@/lib/types/report";
import { FindingCard, type FindingCopy } from "./FindingCard";
import { splitFindings } from "./diagnosis";

export type FindingsSectionCopy = FindingCopy & {
  risksEyebrow: string;
  risksTitle: string;
  noRisks: string;
  strengthsEyebrow: string;
  strengthsTitle: string;
  noStrengths: string;
};

/** Ranked diagnosis findings: focus areas first, then strengths. */
export function FindingsSection({
  diagnosis,
  axisName,
  copy,
}: {
  diagnosis: Diagnosis;
  axisName: (axis: Finding["axis"]) => string;
  copy: FindingsSectionCopy;
}) {
  const { risks, strengths } = splitFindings(diagnosis);
  return (
    <div className="mb-10 space-y-10">
      <FindingGroup
        eyebrow={copy.risksEyebrow}
        title={copy.risksTitle}
        empty={copy.noRisks}
        tone="text-error"
        findings={risks}
        axisName={axisName}
        copy={copy}
      />
      <FindingGroup
        eyebrow={copy.strengthsEyebrow}
        title={copy.strengthsTitle}
        empty={copy.noStrengths}
        tone="text-primary"
        findings={strengths}
        axisName={axisName}
        copy={copy}
      />
    </div>
  );
}

function FindingGroup({
  eyebrow,
  title,
  empty,
  tone,
  findings,
  axisName,
  copy,
}: {
  eyebrow: string;
  title: string;
  empty: string;
  tone: string;
  findings: Finding[];
  axisName: (axis: Finding["axis"]) => string;
  copy: FindingCopy;
}) {
  return (
    <section>
      <span className={`font-label-caps text-label-caps uppercase tracking-widest ${tone}`}>{eyebrow}</span>
      <h3 className="mb-5 mt-1 font-headline-lg-mobile text-headline-lg-mobile">{title}</h3>
      {findings.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{empty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {findings.map((f, i) => (
            <FindingCard key={`${f.code}-${i}`} finding={f} axisLabel={axisName(f.axis)} copy={copy} />
          ))}
        </div>
      )}
    </section>
  );
}
