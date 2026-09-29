import { Badge } from "@/components/ui/Badge";
import type { SubmitTests, TestFailure } from "@/lib/types/report";
import {
  categoryName,
  fill,
  hiddenFailures,
  submitSummaryLine,
  visibleFailures,
  type SubmitSummaryCopy,
} from "./diagnosis";

export type TestResultsCopy = SubmitSummaryCopy & {
  testsTitle: string;
  allPassed: string;
  showMoreFailures: string;
  hiddenTag: string;
  visibleTag: string;
  inputLabel: string;
  expectedLabel: string;
  actualLabel: string;
  errorLabel: string;
};

const SHOWN_FAILURES = 3;

/** Full submit-suite result, failing hidden tests first (P1.2: inputs only on this page). */
export function TestResults({ tests, copy }: { tests: SubmitTests; copy: TestResultsCopy }) {
  const failures = [...hiddenFailures(tests), ...visibleFailures(tests)];
  const shown = failures.slice(0, SHOWN_FAILURES);
  const rest = failures.slice(SHOWN_FAILURES);
  const allPassed = tests.total > 0 && tests.passed === tests.total;

  return (
    <section className="mb-10">
      <h3 className="mb-2 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
        {copy.testsTitle}
      </h3>
      <p className="mb-5 font-label-mono text-label-mono text-on-surface">{submitSummaryLine(tests, copy)}</p>
      {allPassed ? (
        <p className="text-sm text-primary">{copy.allPassed}</p>
      ) : (
        <div className="space-y-4">
          {shown.map((f, i) => (
            <FailureItem key={i} failure={f} copy={copy} />
          ))}
          {rest.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer font-label-mono text-label-mono text-primary">
                {fill(copy.showMoreFailures, { n: rest.length })}
              </summary>
              <div className="mt-4 space-y-4">
                {rest.map((f, i) => (
                  <FailureItem key={i} failure={f} copy={copy} />
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

function FailureItem({ failure, copy }: { failure: TestFailure; copy: TestResultsCopy }) {
  const fields: [string, string | null][] = [
    [copy.inputLabel, failure.input],
    [copy.expectedLabel, failure.expected],
    [copy.actualLabel, failure.actual],
    [copy.errorLabel, failure.error],
  ];
  return (
    <article className="ice-card border-l-2 border-l-error p-5">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        {failure.description && <h4 className="mr-1 font-medium">{failure.description}</h4>}
        <Badge tone={failure.hidden ? "warning" : "neutral"}>
          {failure.hidden ? copy.hiddenTag : copy.visibleTag}
        </Badge>
        <Badge>{categoryName(failure.category, copy.categoryNames)}</Badge>
      </header>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields
          .filter((field): field is [string, string] => field[1] !== null && field[1] !== "")
          .map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="font-label-mono text-label-mono uppercase text-on-surface-variant/70">{label}</dt>
              <dd className="mt-1">
                <pre className="overflow-x-auto whitespace-pre-wrap break-all bg-surface-container-lowest/60 p-2 font-label-mono text-label-mono text-on-surface">
                  {value}
                </pre>
              </dd>
            </div>
          ))}
      </dl>
    </article>
  );
}
