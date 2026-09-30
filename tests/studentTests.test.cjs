const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Resolve the "@/..." alias (the helpers import static data through it).
const Module = require('node:module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(process.cwd(), request.slice(2));
  return origResolve.call(this, request, ...rest);
};

// Transpile TS on require, matching the other test files. Type-only imports are elided.
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (mod, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    });
    mod._compile(result.outputText, filename);
  };
}

const {
  MAX_STUDENT_TESTS, MAX_TEST_INPUT, MAX_TEST_WHY, hasTestsTab, newDraft, draftsFrom, clampTest, addDraft,
  removeDraft, updateDraft, isSavable, testSignature, toSaved, currentResult, mapRunResults, coveredCategories,
  missingCategories, checkedValidCount, exerciseCategoriesFor, workedExample, isExceptionType, checkView,
  reportReasonView, testsErrorKind, reportCounts,
} = require('../components/studentTests/studentTests.ts');

const draft = (key, extra = {}) => ({ ...newDraft(key), input: 'add(1, 2)', expected: '3', ...extra });

test('hasTestsTab: missing, null or disabled means no tab', () => {
  assert.equal(hasTestsTab(undefined), false);
  assert.equal(hasTestsTab(null), false);
  assert.equal(hasTestsTab({ enabled: false, required: false, tests: [] }), false);
  assert.equal(hasTestsTab({ enabled: true, required: true, tests: [] }), true);
});

test('draftsFrom keeps saved tests in order with fresh keys, at most the maximum', () => {
  let n = 0;
  const saved = Array.from({ length: 12 }, (_, i) => ({ category: 'edge', input: `f(${i})`, expected: `${i}`, why: '' }));
  const drafts = draftsFrom(saved, () => `k${n++}`);
  assert.equal(drafts.length, MAX_STUDENT_TESTS);
  assert.equal(drafts[0].key, 'k0');
  assert.equal(drafts[3].input, 'f(3)');
});

test('clampTest cuts fields to the server limits and repairs a bad category', () => {
  const t = clampTest({ category: 'weird', input: 'x'.repeat(400), expected: '1', why: 'y'.repeat(250) });
  assert.equal(t.category, 'happy');
  assert.equal(t.input.length, MAX_TEST_INPUT);
  assert.equal(t.why.length, MAX_TEST_WHY);
});

test('addDraft stops at 10, removeDraft and updateDraft work by key', () => {
  let list = [];
  for (let i = 0; i < 11; i += 1) list = addDraft(list, draft(`k${i}`));
  assert.equal(list.length, MAX_STUDENT_TESTS);
  list = removeDraft(list, 'k0');
  assert.equal(list.length, 9);
  assert.equal(list[0].key, 'k1');
  list = updateDraft(list, 'k1', { expected: '4', category: 'boundary' });
  assert.equal(list[0].expected, '4');
  assert.equal(list[0].category, 'boundary');
  assert.equal(list[1].expected, '3');
});

test('toSaved sends only rows with an input, trimmed, and keeps their keys', () => {
  const list = [draft('a', { input: '  add(1, 2) ', expected: ' 3 ', why: ' sum ' }), draft('b', { input: '   ' }), draft('c')];
  assert.equal(isSavable(list[1]), false);
  const saved = toSaved(list);
  assert.deepEqual(saved.keys, ['a', 'c']);
  assert.deepEqual(saved.tests[0], { category: 'happy', input: 'add(1, 2)', expected: '3', why: 'sum' });
  assert.equal('key' in saved.tests[0], false);
  assert.equal(saved.signatures[0], testSignature(list[0]));
});

test('a stamped result disappears once input or expected changes, not on why/category', () => {
  const d = draft('a');
  const checks = { a: { signature: testSignature(d), result: { status: 'valid', reason: null } } };
  assert.equal(currentResult(checks, d).status, 'valid');
  assert.equal(currentResult(checks, { ...d, why: 'because', category: 'edge' }).status, 'valid');
  assert.equal(currentResult(checks, { ...d, expected: '4' }), null);
  assert.equal(currentResult(checks, draft('other')), null);
});

test('mapRunResults pairs saved order with results and tolerates a length mismatch', () => {
  const r = (passed) => ({ passed, actual: passed ? '3' : '4', error: null });
  const mapped = mapRunResults({ keys: ['a', 'c', 'd'], signatures: ['s1', 's2', 's3'] }, [r(true), r(false)]);
  assert.deepEqual(Object.keys(mapped), ['a', 'c']);
  assert.equal(mapped.c.result.actual, '4');
  assert.equal(mapped.c.signature, 's2');
});

test('category coverage counts written tests only; missing follows the exercise', () => {
  const list = [draft('a', { category: 'edge' }), draft('b', { category: 'boundary', input: '' }), draft('c')];
  assert.deepEqual(coveredCategories(list), ['happy', 'edge']);
  assert.deepEqual(missingCategories(['happy', 'boundary', 'edge'], list), ['boundary']);
});

test('checkedValidCount counts only checks still matching the content', () => {
  const a = draft('a');
  const b = draft('b', { input: 'add(2, 2)', expected: '4' });
  const checks = {
    a: { signature: testSignature(a), result: { status: 'valid', reason: null } },
    b: { signature: 'stale', result: { status: 'valid', reason: null } },
  };
  assert.equal(checkedValidCount([a, b], checks), 1);
});

test('exercise facts: known exercises, unknown falls back to all four categories', () => {
  assert.deepEqual(exerciseCategoriesFor('cp-001'), ['happy', 'boundary', 'edge']);
  assert.deepEqual(exerciseCategoriesFor('CP-999'), ['happy', 'boundary', 'edge', 'error']);
  assert.equal(workedExample('CP-001', false).input, 'two_sum([2, 7, 11, 15], 9)');
  assert.equal(workedExample('CP-001', true), null, 'junior/senior get no worked example');
  assert.equal(workedExample('CP-101', false), null);
});

test('every worked example respects the field limits and has both languages', () => {
  const { EXERCISE_TEST_FACTS } = require('../lib/studentTestExamples.ts');
  for (const [code, facts] of Object.entries(EXERCISE_TEST_FACTS)) {
    assert.ok(facts.categories.length > 0, code);
    if (!facts.example) continue;
    assert.ok(facts.example.input.length <= MAX_TEST_INPUT, code);
    assert.ok(facts.example.why.vi.length <= MAX_TEST_WHY && facts.example.why.en.length <= MAX_TEST_WHY, code);
  }
});

test('error reasons: exception types versus allow-list refusals', () => {
  assert.equal(isExceptionType('TypeError'), true);
  assert.equal(isExceptionType('json.JSONDecodeError'), true);
  assert.equal(isExceptionType(null), true);
  assert.equal(isExceptionType("name '__import__' is not allowed in a test"), false);
  assert.deepEqual(checkView({ status: 'valid', reason: null }), { kind: 'valid' });
  assert.deepEqual(checkView({ status: 'wrong_expected', reason: null }), { kind: 'wrong_expected' });
  assert.deepEqual(checkView({ status: 'error', reason: 'ZeroDivisionError' }), { kind: 'exception', detail: 'ZeroDivisionError' });
  assert.deepEqual(checkView({ status: 'error', reason: 'imports are not allowed' }), { kind: 'refused', detail: 'imports are not allowed' });
});

test('report reasons: wrong_expected, error, allow-list text', () => {
  assert.deepEqual(reportReasonView('wrong_expected'), { kind: 'wrong_expected' });
  assert.deepEqual(reportReasonView('error'), { kind: 'exception', detail: null });
  assert.deepEqual(reportReasonView(null), { kind: 'exception', detail: null });
  assert.deepEqual(reportReasonView("attribute '__class__' is not allowed"), { kind: 'refused', detail: "attribute '__class__' is not allowed" });
});

test('testsErrorKind maps the documented statuses', () => {
  assert.equal(testsErrorKind(429), 'rate_limited');
  assert.equal(testsErrorKind(409), 'submitted');
  assert.equal(testsErrorKind(422), 'invalid');
  assert.equal(testsErrorKind(400), 'no_tab');
  assert.equal(testsErrorKind(500), 'failed');
  assert.equal(testsErrorKind(null), 'failed');
});

test('reportCounts counts written and valid tests', () => {
  const t = (valid) => ({ category: 'happy', input: 'f()', expected: '1', why: '', valid, reason: valid ? null : 'wrong_expected' });
  assert.deepEqual(
    reportCounts({ tests: [t(true), t(false), t(true)], categories: [], exercise_categories: [], killed: 0, total: 0, missed: [] }),
    { written: 3, valid: 2 },
  );
});
