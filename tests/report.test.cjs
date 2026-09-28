const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Transpile TS on require, matching tests/ui.test.cjs. Type-only imports are elided.
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (mod, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    mod._compile(result.outputText, filename);
  };
}

const {
  splitFindings, nextExercise, levelOf, hiddenFailures, visibleFailures, exerciseHref,
} = require('../components/report/diagnosis.ts');

const text = { what_happened: 'w', why_it_matters: 'y', how_to_improve: 'h', try_next: 't' };
const finding = (code, kind, extra = {}) => ({
  code, axis: 'testing', kind, severity: kind === 'risk' ? 'medium' : null, params: {}, evidence: '',
  text, next_exercise: null, source: 'template', ...extra,
});

function report(feedback = {}) {
  return {
    overall: 50, tier: 'Developing', axes: {}, axes_pct: {}, integrity_status: 'green', timeline: [],
    feedback: { strengths: [], risks: [], per_axis: {}, ...feedback },
  };
}

test('splitFindings keeps the backend ranking inside each group', () => {
  const findings = [
    finding('bug_not_fixed', 'risk'), finding('no_hypothesis', 'risk'),
    finding('explain_strong', 'strength'), finding('prompts_strong', 'strength'),
  ];
  const { risks, strengths } = splitFindings({ version: 1, locale: 'vi', findings });
  assert.deepEqual(risks.map((f) => f.code), ['bug_not_fixed', 'no_hypothesis']);
  assert.deepEqual(strengths.map((f) => f.code), ['explain_strong', 'prompts_strong']);
});

test('splitFindings of a missing diagnosis is empty', () => {
  assert.deepEqual(splitFindings(undefined), { risks: [], strengths: [] });
});

test('nextExercise prefers the first candidate, then a finding, else null', () => {
  const findings = [finding('no_hypothesis', 'risk', { next_exercise: 'CP-003' })];
  assert.equal(nextExercise(report({ diagnosis: { version: 1, locale: 'vi', findings, candidates: ['CP-105'] } })), 'CP-105');
  // A rescored report has no `candidates` (refresh_diagnosis does not store them).
  assert.equal(nextExercise(report({ diagnosis: { version: 1, locale: 'vi', findings } })), 'CP-003');
  assert.equal(nextExercise(report({ diagnosis: { version: 1, locale: 'vi', findings: [finding('x', 'risk')] } })), null);
  assert.equal(nextExercise(report()), null);
});

test('levelOf tells level 0 apart from not applicable and from a v1 report', () => {
  const r = report({ levels: { testing: 0, prompting: null } });
  assert.equal(levelOf(r, 'testing'), 0);
  assert.equal(levelOf(r, 'prompting'), null);
  assert.equal(levelOf(r, 'debugging'), undefined); // axis missing from the map
  assert.equal(levelOf(report(), 'testing'), undefined); // no levels at all
});

test('hidden and visible failures are split, order kept', () => {
  const tests = {
    passed: 5, total: 9, hidden_passed: 3, hidden_total: 6, failed_categories: ['edge'],
    failures: [
      { description: 'v1', category: 'happy', hidden: false, input: '1', expected: '2', actual: '3', error: null },
      { description: 'h1', category: 'edge', hidden: true, input: 'a', expected: 'b', actual: null, error: 'boom' },
      { description: 'h2', category: 'boundary', hidden: true, input: 'c', expected: 'd', actual: 'e', error: null },
    ],
  };
  assert.deepEqual(hiddenFailures(tests).map((f) => f.description), ['h1', 'h2']);
  assert.deepEqual(visibleFailures(tests).map((f) => f.description), ['v1']);
  assert.deepEqual(hiddenFailures(undefined), []);
  assert.deepEqual(visibleFailures({ ...tests, failures: undefined }), []);
});

test('exerciseHref opens the solve page like the level list does', () => {
  // The solve page lives at /solve (app/solve/page.tsx); /workspace/solve would hit /workspace/[level] and 404.
  assert.deepEqual(exerciseHref('CP-105'), { pathname: '/solve', query: { id: 'CP-105' } });
});
