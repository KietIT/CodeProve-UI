"use client";

import { useState } from "react";
import { Sym } from "@/components/app/AppChrome";
import { fill } from "@/components/report/diagnosis";
import type { StudentTestsController } from "@/hooks/useStudentTests";
import type { appContent } from "@/lib/appContent";
import type { StudentTestCategory } from "@/lib/types/attempt";
import type { WorkedExample } from "@/lib/studentTestExamples";
import {
  MAX_STUDENT_TESTS,
  MAX_TEST_EXPECTED,
  MAX_TEST_INPUT,
  MAX_TEST_WHY,
  REQUIRED_VALID_TESTS,
  STUDENT_TEST_CATEGORIES,
  checkView,
  checkedValidCount,
  coveredCategories,
  currentResult,
  exerciseCategoriesFor,
  isSavable,
  missingCategories,
  workedExample,
  type CheckView,
  type TestDraft,
} from "./studentTests";

export type TestsCopy =
  | (typeof appContent)["vi"]["solve"]["tests"]
  | (typeof appContent)["en"]["solve"]["tests"];

type Locale = "vi" | "en";

type TestsPanelProps = {
  exerciseCode: string;
  /** Junior/senior: 3 valid tests count towards Testing. Fresher: learning mode. */
  required: boolean;
  tests: StudentTestsController;
  locale: Locale;
  copy: TestsCopy;
  /** Anti-cheat handlers shared with the rest of the workspace. */
  onBlockedPaste: (e: React.ClipboardEvent<HTMLElement>) => void;
  onBlockedDrop: (e: React.DragEvent<HTMLElement>) => void;
};

const FIELD =
  "w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest/50 px-2.5 py-2 text-on-surface outline-none focus:border-primary disabled:opacity-60";
const MONO_FIELD = `${FIELD} font-label-mono text-label-mono`;
const LABEL = "mb-1 block font-label-caps text-[11px] uppercase tracking-widest text-on-surface-variant";

/**
 * The Tests tab (P2.3): the student's own tests with a check against the
 * reference, a run on their code and category coverage. Junior/senior see the
 * "3 valid tests" rule; fresher sees a learning mode with a worked example.
 */
export function TestsPanel({
  exerciseCode,
  required,
  tests,
  locale,
  copy,
  onBlockedPaste,
  onBlockedDrop,
}: TestsPanelProps) {
  const { drafts, checks, runSummary, running, error } = tests;
  const categories = exerciseCategoriesFor(exerciseCode);
  const covered = new Set(coveredCategories(drafts));
  const missing = missingCategories(categories, drafts);
  const example = workedExample(exerciseCode, required);
  const full = drafts.length >= MAX_STUDENT_TESTS;
  const validCount = checkedValidCount(drafts, checks);

  return (
    <div className="ice-scroll absolute inset-0 z-[5] overflow-y-auto bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 p-4 sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{copy.title}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-label-mono text-label-mono text-on-surface-variant">
              <span>{fill(copy.count, { n: drafts.length, max: MAX_STUDENT_TESTS })}</span>
              <SaveBadge state={tests.saveState} copy={copy} />
            </p>
          </div>
          <button
            type="button"
            onClick={() => void tests.run()}
            disabled={running}
            className="inline-flex cursor-pointer items-center gap-2 bg-primary px-4 py-2 font-label-mono text-label-mono uppercase text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sym name={running ? "progress_activity" : "play_arrow"} className={`text-[16px] ${running ? "animate-spin" : ""}`} />
            {running ? copy.runningMine : copy.runOnMine}
          </button>
        </header>

        {error && (
          <div role="alert" className="rounded-xl border border-error/40 bg-error/10 p-3 font-label-mono text-label-mono text-error">
            {copy.errors[error]}
          </div>
        )}

        {runSummary && (
          <p role="status" className="font-label-mono text-label-mono text-on-surface">
            {runSummary.total === 0 ? copy.runNothing : fill(copy.runSummary, runSummary)}
          </p>
        )}

        {required ? (
          <div className="rounded-xl flex items-start gap-2 border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm text-on-surface">
            <Sym name="rule" className="mt-px text-[16px] text-primary" />
            <div>
              <p>{fill(copy.requiredNote, { n: REQUIRED_VALID_TESTS })}</p>
              <p className={`mt-1 font-label-mono text-label-mono ${validCount >= REQUIRED_VALID_TESTS ? "text-success" : "text-on-surface-variant"}`}>
                {fill(copy.validSoFar, { n: validCount, required: REQUIRED_VALID_TESTS })}
              </p>
            </div>
          </div>
        ) : (
          <LearningMode
            example={example}
            locale={locale}
            copy={copy}
            canAdd={!full}
            onAdd={(ex) => tests.add({ category: ex.category, input: ex.input, expected: ex.expected, why: ex.why[locale] })}
          />
        )}

        <section aria-labelledby="tests-categories" className="rounded-2xl border border-outline-variant/50 p-4">
          <h3 id="tests-categories" className="font-label-caps text-label-caps uppercase tracking-widest text-primary">
            {copy.categoriesTitle}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => {
              const done = covered.has(c);
              return (
                <li
                  key={c}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 font-label-mono text-label-mono ${
                    done ? "border-success/40 bg-success/10 text-success" : "border-outline-variant/60 text-on-surface-variant"
                  }`}
                >
                  <Sym name={done ? "check_circle" : "radio_button_unchecked"} className="text-[15px]" />
                  {copy.categoryNames[c]}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-on-surface-variant">{copy.categoriesNote}</p>
          {!required && missing.length > 0 && (
            <div className="mt-3">
              <p className="font-label-mono text-[11px] uppercase text-on-surface-variant">{copy.missingHintsTitle}</p>
              <ul className="mt-1.5 space-y-1.5">
                {missing.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-on-surface">
                    <Sym name="lightbulb" className="mt-0.5 text-[15px] text-primary" />
                    <span>
                      <strong className="font-medium">{copy.categoryNames[c]}:</strong> {copy.categoryHints[c]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <FormatHelp copy={copy} defaultOpen={!required} />

        {drafts.length === 0 ? (
          <p className="text-sm text-on-surface-variant">{copy.empty}</p>
        ) : (
          <ol className="space-y-4">
            {drafts.map((d, i) => (
              <TestCard
                key={d.key}
                index={i}
                draft={d}
                tests={tests}
                copy={copy}
                onBlockedPaste={onBlockedPaste}
                onBlockedDrop={onBlockedDrop}
              />
            ))}
          </ol>
        )}

        <div className="flex flex-wrap items-center gap-3 pb-4">
          <button
            type="button"
            onClick={() => tests.add()}
            disabled={full}
            className="inline-flex cursor-pointer items-center gap-1.5 border border-primary/60 px-3 py-1.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sym name="add" className="text-[16px]" /> {copy.add}
          </button>
          {full && (
            <span className="font-label-mono text-label-mono text-warning">
              {fill(copy.maxReached, { max: MAX_STUDENT_TESTS })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveBadge({ state, copy }: { state: StudentTestsController["saveState"]; copy: TestsCopy }) {
  if (state === "idle") return null;
  if (state === "error") return <span className="text-error">{copy.saveFailed}</span>;
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-on-surface-variant/80">
        <Sym name="cloud_done" className="text-[14px]" /> {copy.saved}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-on-surface-variant/80">
      <Sym name="sync" className="text-[14px]" /> {copy.saving}
    </span>
  );
}

function LearningMode({
  example,
  locale,
  copy,
  canAdd,
  onAdd,
}: {
  example: WorkedExample | null;
  locale: Locale;
  copy: TestsCopy;
  canAdd: boolean;
  onAdd: (example: WorkedExample) => void;
}) {
  const [added, setAdded] = useState(false);
  return (
    <section aria-labelledby="tests-learning" className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
      <h3 id="tests-learning" className="flex items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-primary">
        <Sym name="school" className="text-[16px]" /> {copy.learningTitle}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-on-surface">{copy.learningNote}</p>
      {example && (
        <div className="rounded-xl mt-3 border border-outline-variant/60 bg-surface-container-low p-3">
          <p className="font-label-mono text-[11px] uppercase text-on-surface-variant">{copy.exampleTitle}</p>
          <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="text-on-surface-variant">{copy.categoryLabel}</dt>
            <dd className="text-on-surface">{copy.categoryNames[example.category]}</dd>
            <dt className="text-on-surface-variant">{copy.inputLabel}</dt>
            <dd className="min-w-0 break-all font-label-mono text-label-mono text-on-surface">{example.input}</dd>
            <dt className="text-on-surface-variant">{copy.expectedLabel}</dt>
            <dd className="min-w-0 break-all font-label-mono text-label-mono text-on-surface">{example.expected}</dd>
            <dt className="text-on-surface-variant">{copy.whyShort}</dt>
            <dd className="text-on-surface">{example.why[locale]}</dd>
          </dl>
          <button
            type="button"
            onClick={() => {
              onAdd(example);
              setAdded(true);
            }}
            disabled={added || !canAdd}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 border border-primary/60 px-3 py-1.5 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sym name={added ? "check" : "add"} className="text-[15px]" />
            {added ? copy.exampleAdded : copy.useExample}
          </button>
        </div>
      )}
    </section>
  );
}

/** Format help with neutral names only: an example matching a real exercise would hand out a valid test. */
function FormatHelp({ copy, defaultOpen }: { copy: TestsCopy; defaultOpen: boolean }) {
  return (
    <details open={defaultOpen} className="group border border-outline-variant/50 p-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-label-caps text-label-caps uppercase tracking-widest text-on-surface">
        <Sym name="help" className="text-[16px] text-primary" /> {copy.formatTitle}
        <Sym name="expand_more" className="ml-auto text-[18px] transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-on-surface">
        <p>{copy.formatInput}</p>
        <Code>{copy.formatInputExample}</Code>
        <p>{copy.formatClass}</p>
        <Code>{copy.formatClassExample}</Code>
        <p className="text-on-surface-variant">{copy.formatRename}</p>
        <p>{copy.formatExpected}</p>
        <p className="text-on-surface-variant">{fill(copy.formatRules, { max: MAX_TEST_INPUT })}</p>
      </div>
    </details>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-all bg-surface-container-lowest/60 p-2 font-label-mono text-label-mono text-on-surface">
      {children}
    </pre>
  );
}

function TestCard({
  index,
  draft,
  tests,
  copy,
  onBlockedPaste,
  onBlockedDrop,
}: {
  index: number;
  draft: TestDraft;
  tests: StudentTestsController;
  copy: TestsCopy;
  onBlockedPaste: (e: React.ClipboardEvent<HTMLElement>) => void;
  onBlockedDrop: (e: React.DragEvent<HTMLElement>) => void;
}) {
  const id = `test-${draft.key}`;
  const savable = isSavable(draft);
  const checking = tests.checking.includes(draft.key);
  const check = currentResult(tests.checks, draft);
  const run = currentResult(tests.runResults, draft);
  const blockers = { onPaste: onBlockedPaste, onDrop: onBlockedDrop };

  return (
    <li className="ice-card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="font-label-mono text-label-mono text-primary">{fill(copy.testNumber, { n: index + 1 })}</span>
        <label className="sr-only" htmlFor={`${id}-category`}>
          {copy.categoryLabel}
        </label>
        <select
          id={`${id}-category`}
          value={draft.category}
          onChange={(e) => tests.update(draft.key, { category: e.target.value as StudentTestCategory })}
          className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-2 py-1 font-label-mono text-label-mono text-on-surface outline-none focus:border-primary"
        >
          {STUDENT_TEST_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {copy.categoryNames[c]}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => void tests.check(draft.key)}
            disabled={!savable || checking}
            className="inline-flex cursor-pointer items-center gap-1.5 border border-primary/60 px-3 py-1 font-label-mono text-label-mono uppercase text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sym name={checking ? "progress_activity" : "fact_check"} className={`text-[15px] ${checking ? "animate-spin" : ""}`} />
            {checking ? copy.checking : copy.check}
          </button>
          <button
            type="button"
            onClick={() => tests.remove(draft.key)}
            aria-label={`${copy.remove} ${index + 1}`}
            title={copy.remove}
            className="cursor-pointer p-1 text-on-surface-variant transition-colors hover:text-error"
          >
            <Sym name="delete" className="text-[18px]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[3fr,2fr]">
        <label className="block min-w-0" htmlFor={`${id}-input`}>
          <span className={LABEL}>{copy.inputLabel}</span>
          <ExpressionField
            id={`${id}-input`}
            value={draft.input}
            maxLength={MAX_TEST_INPUT}
            onChange={(input) => tests.update(draft.key, { input })}
            placeholder={copy.inputPlaceholder}
            {...blockers}
          />
        </label>
        <label className="block min-w-0" htmlFor={`${id}-expected`}>
          <span className={LABEL}>{copy.expectedLabel}</span>
          <ExpressionField
            id={`${id}-expected`}
            value={draft.expected}
            maxLength={MAX_TEST_EXPECTED}
            onChange={(expected) => tests.update(draft.key, { expected })}
            placeholder={copy.expectedPlaceholder}
            {...blockers}
          />
        </label>
      </div>
      <label className="mt-3 block" htmlFor={`${id}-why`}>
        <span className={LABEL}>{copy.whyLabel}</span>
        <input
          id={`${id}-why`}
          value={draft.why}
          maxLength={MAX_TEST_WHY}
          onChange={(e) => tests.update(draft.key, { why: e.target.value })}
          placeholder={copy.whyPlaceholder}
          className={`${FIELD} text-sm`}
          {...blockers}
        />
      </label>

      <div className="mt-3 space-y-1.5" aria-live="polite">
        {!savable && <p className="font-label-mono text-label-mono text-on-surface-variant/80">{copy.needsInput}</p>}
        {check && <CheckLine view={checkView(check)} copy={copy} />}
        {run && (
          <p className={`font-label-mono text-label-mono ${run.passed ? "text-success" : "text-error"}`}>
            <Sym name={run.passed ? "check" : "close"} className="mr-1 align-middle text-[15px]" />
            {copy.mineLabel}: {run.passed ? copy.minePass : copy.mineFail}
            {!run.passed && run.actual !== null && (
              <span className="text-on-surface-variant">
                {" "}
                · {copy.actualLabel} <code className="text-on-surface">{run.actual}</code>
              </span>
            )}
            {run.error && <span className="block pl-5 text-error/90">{run.error}</span>}
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * A one-line Python expression that wraps instead of scrolling (class tests are
 * long lambdas). Enter and pasted line breaks are dropped: it must stay one line.
 */
function ExpressionField({
  id,
  value,
  maxLength,
  onChange,
  placeholder,
  onPaste,
  onDrop,
}: {
  id: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  placeholder: string;
  onPaste: (e: React.ClipboardEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
}) {
  return (
    <textarea
      id={id}
      rows={2}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value.replace(/[\r\n]+/g, " "))}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.preventDefault();
      }}
      onPaste={onPaste}
      onDrop={onDrop}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete="off"
      className={`${MONO_FIELD} resize-none break-all`}
    />
  );
}

function CheckLine({ view, copy }: { view: CheckView; copy: TestsCopy }) {
  if (view.kind === "valid") {
    return (
      <p className="font-label-mono text-label-mono text-success">
        <Sym name="verified" className="mr-1 align-middle text-[15px]" />
        {copy.checkValid}
      </p>
    );
  }
  if (view.kind === "wrong_expected") {
    return (
      <p className="font-label-mono text-label-mono text-error">
        <Sym name="error" className="mr-1 align-middle text-[15px]" />
        {copy.checkWrong}
      </p>
    );
  }
  if (view.kind === "exception") {
    return (
      <p className="font-label-mono text-label-mono text-error">
        <Sym name="bug_report" className="mr-1 align-middle text-[15px]" />
        {copy.checkException}
        {view.detail && <>: <code>{view.detail}</code></>}
      </p>
    );
  }
  return (
    <div role="alert" className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-on-surface">
      <p className="flex items-start gap-1.5 font-medium text-warning">
        <Sym name="block" className="mt-px text-[16px]" />
        {copy.checkRefused}
      </p>
      <code className="mt-1 block break-words font-label-mono text-label-mono text-on-surface">{view.detail}</code>
      <p className="mt-1 text-on-surface-variant">{copy.checkRefusedHelp}</p>
    </div>
  );
}
