const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Resolve the "@/..." alias to the project root, matching tests/ui.test.cjs, so
// components importing shared UI through the alias load in this harness.
const Module = require('node:module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(process.cwd(), request.slice(2));
  return origResolve.call(this, request, ...rest);
};

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

const { appContent } = require('../lib/appContent.ts');

// Nested key paths, so vi and en can be compared structurally.
function keyPaths(value, prefix = '') {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.keys(value).flatMap((k) => keyPaths(value[k], prefix ? `${prefix}.${k}` : k)).sort();
}

test('feedback copy has the same keys in vi and en', () => {
  assert.deepEqual(keyPaths(appContent.vi.feedback), keyPaths(appContent.en.feedback));
});

test('feedback copy covers levels, severities, categories, finding fields and tests', () => {
  for (const locale of ['vi', 'en']) {
    const f = appContent[locale].feedback;
    assert.equal(f.levelNames.length, 4, locale);
    assert.deepEqual(Object.keys(f.severityNames).sort(), ['high', 'low', 'medium']);
    assert.deepEqual(Object.keys(f.categoryNames).sort(), ['boundary', 'edge', 'error', 'happy', 'uncategorized']);
    assert.deepEqual(Object.keys(f.findingFields).sort(), ['how_to_improve', 'try_next', 'what_happened', 'why_it_matters']);
    assert.match(f.openExercise, /\{code\}/);
    assert.match(f.testsSummary, /\{passed\}.*\{total\}.*\{hidden_passed\}.*\{hidden_total\}/);
    assert.match(f.failedGroups, /\{categories\}/);
  }
  assert.deepEqual([...appContent.vi.feedback.levelNames], ['Chưa đạt', 'Cơ bản', 'Khá', 'Tốt']);
  assert.deepEqual([...appContent.en.feedback.levelNames], ['Not yet', 'Basic', 'Good', 'Strong']);
});

const React = require('react');
const { renderToStaticMarkup: render } = require('react-dom/server');
const { AxisLevels } = require('../components/report/AxisLevels.tsx');
const { fill } = require('../components/report/diagnosis.ts');

const levelCopy = {
  naLabel: 'Không áp dụng',
  levelNames: appContent.vi.feedback.levelNames,
  levelAria: appContent.vi.feedback.levelAria,
};
const renderAxes = (rows) => render(React.createElement(AxisLevels, { rows, copy: levelCopy }));
const filledCount = (html) => (html.match(/data-filled="true"/g) ?? []).length;

test('fill replaces named placeholders and blanks unknown ones', () => {
  assert.equal(fill('Mở bài {code}', { code: 'CP-105' }), 'Mở bài CP-105');
  assert.equal(fill('{a}-{b}', { a: 1 }), '1-');
});

test('AxisLevels shows the level label and fills one segment per level', () => {
  const html = renderAxes([{ key: 'understanding', label: 'Thấu hiểu', pct: 66.7, level: 2 }]);
  assert.match(html, /Khá/);
  assert.equal(filledCount(html), 2);
  assert.match(html, /aria-label="Thấu hiểu: Khá \(2\/3\)"/);
  assert.doesNotMatch(html, /%/); // no decimals once levels exist
});

test('AxisLevels tells level 0 apart from not applicable', () => {
  const zero = renderAxes([{ key: 'testing', label: 'Kiểm thử', pct: 0, level: 0 }]);
  assert.match(zero, /Chưa đạt/);
  assert.equal(filledCount(zero), 0);
  const na = renderAxes([{ key: 'debugging', label: 'Gỡ lỗi', pct: null, level: null, naReason: 'Không có gì để debug.' }]);
  assert.match(na, /Không áp dụng/);
  assert.match(na, /Không có gì để debug\./);
  assert.doesNotMatch(na, /data-filled/);
});

test('AxisLevels keeps the percentage bar for a report without levels', () => {
  const html = renderAxes([{ key: 'testing', label: 'Kiểm thử', pct: 62.5, level: undefined }]);
  assert.match(html, /63%/);
  assert.doesNotMatch(html, /data-filled/);
});

const { FindingCard } = require('../components/report/FindingCard.tsx');
const { FindingsSection } = require('../components/report/FindingsSection.tsx');

const vf = appContent.vi.feedback;
const findingCopy = { severityNames: vf.severityNames, findingFields: vf.findingFields, openExercise: vf.openExercise };
const sectionCopy = {
  ...findingCopy,
  strengthsEyebrow: vf.strengthsEyebrow, strengthsTitle: vf.strengthsTitle, noStrengths: vf.noStrengths,
  risksEyebrow: vf.risksEyebrow, risksTitle: vf.risksTitle, noRisks: vf.noRisks,
};
const renderSection = (findings) => render(React.createElement(FindingsSection, {
  diagnosis: { version: 1, locale: 'vi', findings }, axisName: (a) => `axis:${a}`, copy: sectionCopy,
}));

test('FindingsSection lists risks before strengths, keeping the backend order', () => {
  const html = renderSection([
    finding('explain_strong', 'strength', { text: { ...text, what_happened: 'S1' } }),
    finding('bug_not_fixed', 'risk', { text: { ...text, what_happened: 'R1' } }),
    finding('no_hypothesis', 'risk', { text: { ...text, what_happened: 'R2' } }),
  ]);
  const at = (s) => html.indexOf(s);
  assert.ok(at('R1') > -1 && at('R1') < at('R2') && at('R2') < at('S1'));
  assert.ok(at(vf.risksTitle) < at(vf.strengthsTitle));
});

test('FindingsSection shows the empty lines when a group has no findings', () => {
  const html = renderSection([finding('bug_not_fixed', 'risk')]);
  assert.match(html, new RegExp(vf.noStrengths));
  assert.doesNotMatch(html, new RegExp(vf.noRisks));
});

test('FindingCard shows the axis, the severity chip, the four headings and the exercise link', () => {
  const f = finding('hidden_edge_failed', 'risk', { severity: 'high', next_exercise: 'CP-105' });
  const html = render(React.createElement(FindingCard, { finding: f, axisLabel: 'Kiểm thử', copy: findingCopy }));
  assert.match(html, /Kiểm thử/);
  assert.match(html, /Mức độ cao/);
  for (const heading of Object.values(vf.findingFields)) assert.match(html, new RegExp(heading));
  assert.match(html, /href="\/solve\?id=CP-105"/);
  assert.match(html, /Mở bài CP-105/);
});

test('FindingCard has no severity chip for a strength and no link without next_exercise', () => {
  const html = render(React.createElement(FindingCard, { finding: finding('quick_fix', 'strength'), axisLabel: 'Gỡ lỗi', copy: findingCopy }));
  assert.doesNotMatch(html, /Mức độ/);
  assert.doesNotMatch(html, /href=/);
});

test('FindingCard renders backend text as text, never as HTML', () => {
  const evil = '<script>alert(1)</script>';
  const f = finding('explain_shallow', 'risk', { text: { ...text, what_happened: evil } });
  const html = render(React.createElement(FindingCard, { finding: f, axisLabel: 'x', copy: findingCopy }));
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
  for (const file of ['components/report/FindingCard.tsx', 'components/report/FindingsSection.tsx']) {
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /dangerouslySetInnerHTML/);
  }
});

const { submitSummaryLine } = require('../components/report/diagnosis.ts');
const { TestResults } = require('../components/report/TestResults.tsx');

const testsCopy = {
  testsTitle: vf.testsTitle, testsSummary: vf.testsSummary, testsSummaryNoHidden: vf.testsSummaryNoHidden,
  failedGroups: vf.failedGroups, allPassed: vf.allPassed, showMoreFailures: vf.showMoreFailures,
  hiddenTag: vf.hiddenTag, visibleTag: vf.visibleTag, inputLabel: vf.inputLabel,
  expectedLabel: vf.expectedLabel, actualLabel: vf.actualLabel, errorLabel: vf.errorLabel,
  categoryNames: vf.categoryNames,
};
const failure = (description, hidden, extra = {}) => ({
  description, category: 'edge', hidden, input: `in-${description}`, expected: 'e', actual: 'a', error: null, ...extra,
});
const suite = (failures, extra = {}) => ({
  passed: 6, total: 8, hidden_passed: 4, hidden_total: 6, failed_categories: ['boundary', 'edge'], failures, ...extra,
});

test('submitSummaryLine lists counts and category labels, never test inputs', () => {
  const line = submitSummaryLine(suite([failure('secret', true)]), testsCopy);
  assert.equal(line, 'Pass 6/8 · test ẩn 4/6 · nhóm chưa pass: giá trị biên, tình huống đặc biệt');
  assert.doesNotMatch(line, /in-secret/);
  const noHidden = submitSummaryLine({ passed: 3, total: 3, hidden_passed: 0, hidden_total: 0, failed_categories: [] }, testsCopy);
  assert.equal(noHidden, 'Pass 3/3');
});

test('TestResults lists hidden failures before visible ones, with tags and details', () => {
  const html = render(React.createElement(TestResults, {
    tests: suite([failure('visible-case', false), failure('hidden-case', true, { actual: null, error: 'boom' })]), copy: testsCopy,
  }));
  assert.ok(html.indexOf('hidden-case') < html.indexOf('visible-case'));
  assert.match(html, />test ẩn</); // the tag, not the summary line
  assert.match(html, />test hiển thị</);
  assert.match(html, /in-hidden-case/); // full inputs are shown on the feedback page
  assert.match(html, /boom/);
  assert.match(html, /tình huống đặc biệt/);
  assert.doesNotMatch(html, /<details/);
});

test('TestResults collapses failures beyond the first three', () => {
  const failures = ['case-1', 'case-2', 'case-3', 'case-4', 'case-5'].map((d) => failure(d, true));
  const html = render(React.createElement(TestResults, { tests: suite(failures), copy: testsCopy }));
  const details = html.indexOf('<details');
  assert.ok(details > html.indexOf('case-3') && details < html.indexOf('case-4'));
  assert.match(html, /Xem thêm 2 test chưa pass/);
});

test('TestResults says all passed when the suite is green', () => {
  const html = render(React.createElement(TestResults, {
    tests: suite([], { passed: 8, hidden_passed: 6, failed_categories: [] }), copy: testsCopy,
  }));
  assert.match(html, new RegExp(vf.allPassed));
});

const { noteText, timelineText } = require('../components/report/reportText.ts');

test('noteText localises a known code and otherwise shows the stored note as is', () => {
  assert.equal(noteText({ axis: 'testing', code: 'strong', note: 'Strong testing.' }, 'Kiểm thử', vf), 'Trục Kiểm thử tốt.');
  assert.equal(noteText({ axis: 'testing', code: 'new_code', note: 'Server text.' }, 'Kiểm thử', vf), 'Server text.');
  // No code: the English note is shown, never pattern-matched back into a code.
  assert.equal(noteText({ axis: 'testing', note: 'Strong testing.' }, 'Kiểm thử', vf), 'Strong testing.');
});

test('timelineText builds each step from its key and shows keyless items as stored', () => {
  const impl = { key: 'implementation', coverage_pct: 75, step: 'Step 2', title: 'T', desc: 'Passed 6/8 tests at submit.', active: true };
  assert.deepEqual(timelineText(impl, vf), { step: vf.timelineSteps.implementation, title: vf.timelineTitles.implementation, desc: 'Coverage tốt nhất 75%.' });
  const explain = { key: 'explain_back', explain_score: 14, step: 's', title: 't', desc: 'd', active: true };
  assert.equal(timelineText(explain, vf).desc, 'Phần giải thích đạt 14/20.');
  assert.equal(timelineText(explain, vf, 'Khá').desc, 'Mức giải thích: Khá.');
  assert.equal(timelineText({ key: 'implementation', step: 's', title: 't', desc: 'd', active: false }, vf).desc, vf.timelineDesc.noTests);
  const keyless = { step: 'Step 3 · Explain-back', title: 'Reasoning verified', desc: 'Explanation scored 12/20.', active: true };
  assert.deepEqual(timelineText(keyless, vf), { step: keyless.step, title: keyless.title, desc: keyless.desc });
});

test('the feedback page no longer parses English notes or timeline text', () => {
  for (const file of ['app/(app)/feedback/FeedbackContent.tsx', 'components/report/reportText.ts']) {
    const src = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(src, /legacyNoteCode|RegExp|\.match\(|\.test\(|\.includes\(/, file);
  }
});
