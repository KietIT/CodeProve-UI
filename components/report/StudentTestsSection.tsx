import { Sym } from "@/components/app/AppChrome";
import { Badge } from "@/components/ui/Badge";
import { fill } from "@/components/report/diagnosis";
import { STUDENT_TEST_CATEGORIES, reportCounts, reportReasonView } from "@/components/studentTests/studentTests";
import type { StudentTestCategory } from "@/lib/types/attempt";
import type { StudentTestReport, StudentTestsReport } from "@/lib/types/report";

export type StudentTestsCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  mutants: string;
  mutantsHelp: string;
  none: string;
  categoriesTitle: string;
  covered: string;
  notCovered: string;
  validTag: string;
  invalidTag: string;
  reasons: Readonly<{ wrong_expected: string; exception: string; refused: string }>;
  whyLabel: string;
  missedTitle: string;
  inputLabel: string;
  expectedLabel: string;
  categoryNames: Readonly<Record<StudentTestCategory, string>>;
};

/**
 * "Your tests" on the Feedback page (P2.3): each test with its verdict, the
 * categories covered against the exercise's, the planted bugs caught and the
 * kinds of bugs missed (never the mutant code).
 */
export function StudentTestsSection({ report, copy }: { report: StudentTestsReport; copy: StudentTestsCopy }) {
  const { written, valid } = reportCounts(report);
  const covered = new Set(report.categories);
  const exerciseCategories = STUDENT_TEST_CATEGORIES.filter(
    (c) => report.exercise_categories.includes(c) || covered.has(c),
  );

  return (
    <section className="ice-card mb-10 p-6 sm:p-8" aria-labelledby="student-tests-title">
      <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary">{copy.eyebrow}</span>
      <h3 id="student-tests-title" className="mb-4 mt-1 font-headline-lg-mobile text-headline-lg-mobile">
        {copy.title}
      </h3>

      <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 font-label-mono text-label-mono text-on-surface">
        <span className="flex items-center gap-1.5">
          <Sym name="fact_check" className="text-[16px] text-primary" />
          {fill(copy.summary, { valid, written })}
        </span>
        {report.total > 0 && (
          <span className="flex items-center gap-1.5">
            <Sym name="pest_control" className="text-[16px] text-primary" />
            {fill(copy.mutants, { killed: report.killed, total: report.total })}
          </span>
        )}
      </div>
      {report.total > 0 && <p className="-mt-3 mb-5 text-xs text-on-surface-variant">{copy.mutantsHelp}</p>}

      {exerciseCategories.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 font-label-caps text-[11px] uppercase tracking-widest text-on-surface-variant">
            {copy.categoriesTitle}
          </h4>
          <ul className="flex flex-wrap gap-2">
            {exerciseCategories.map((c) => {
              const done = covered.has(c);
              return (
                <li
                  key={c}
                  className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-label-mono text-label-mono ${
                    done ? "border-success/40 bg-success/10 text-success" : "border-error/40 bg-error/5 text-error"
                  }`}
                >
                  <Sym name={done ? "check_circle" : "cancel"} className="text-[15px]" />
                  {copy.categoryNames[c]} · {done ? copy.covered : copy.notCovered}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {written === 0 ? (
        <p className="mb-6 text-sm text-on-surface-variant">{copy.none}</p>
      ) : (
        <ol className="mb-6 space-y-3">
          {report.tests.map((t, i) => (
            <TestItem key={i} test={t} copy={copy} />
          ))}
        </ol>
      )}

      {report.missed.length > 0 && (
        <div className="border-l-2 border-warning bg-warning/5 p-4">
          <h4 className="mb-2 flex items-center gap-1.5 font-label-caps text-label-caps uppercase tracking-widest text-warning">
            <Sym name="bug_report" className="text-[16px]" /> {copy.missedTitle}
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-on-surface">
            {report.missed.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function TestItem({ test, copy }: { test: StudentTestReport; copy: StudentTestsCopy }) {
  const reason = test.valid ? null : reportReasonView(test.reason);
  return (
    <li className={`border-l-2 bg-surface-container-lowest/40 p-4 ${test.valid ? "border-l-success" : "border-l-error"}`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone={test.valid ? "success" : "danger"}>{test.valid ? copy.validTag : copy.invalidTag}</Badge>
        <Badge>{copy.categoryNames[test.category] ?? test.category}</Badge>
      </div>
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label={copy.inputLabel} value={test.input} />
        <Field label={copy.expectedLabel} value={test.expected} />
      </dl>
      {test.why && (
        <p className="mt-2 text-sm text-on-surface-variant">
          <span className="font-medium text-on-surface">{copy.whyLabel}:</span> {test.why}
        </p>
      )}
      {reason && (
        <p className="mt-2 text-sm text-error">
          {reason.kind === "wrong_expected"
            ? copy.reasons.wrong_expected
            : reason.kind === "refused"
              ? copy.reasons.refused
              : copy.reasons.exception}
          {(reason.kind === "refused" || reason.kind === "exception") && reason.detail && (
            <code className="ml-1 break-all font-label-mono text-label-mono">{reason.detail}</code>
          )}
        </p>
      )}
    </li>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">{label}</dt>
      <dd className="mt-1">
        <pre className="overflow-x-auto whitespace-pre-wrap break-all bg-surface-container-lowest/60 p-2 font-label-mono text-label-mono text-on-surface">
          {value || "—"}
        </pre>
      </dd>
    </div>
  );
}
