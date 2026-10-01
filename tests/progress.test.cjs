const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup: render } = require('react-dom/server');

// Resolve the "@/..." path alias to the project root, matching the other UI tests.
const Module = require('node:module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith('@/')) request = path.join(process.cwd(), request.slice(2));
  return origResolve.call(this, request, ...rest);
};

for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (mod, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    mod._compile(result.outputText, filename);
  };
}

const { appContent } = require('../lib/appContent.ts');
const { ratingPercent, ratingBand, splitSkills, recurringLines, seriesPath } = require('../lib/progress.ts');
const { SkillsCard } = require('../components/progress/SkillsCard.tsx');
const { RecurringCard } = require('../components/progress/RecurringCard.tsx');
const { TrendsCard } = require('../components/progress/TrendsCard.tsx');

const skill = (key, rating, attempts, vi = key, en = key) => ({ key, vi, en, rating, attempts });
const levels = (over = {}) => ({
  understanding: 2, hypothesis: 2, prompting: 1, verification: 1, testing: 0, debugging: null, ...over,
});
const report = (code, overall, lv = levels()) => ({ date: '2026-09-28T10:12:00Z', code, title: `Title ${code}`, overall, levels: lv });

test('ratingPercent maps 800..1200 to 0..100 and clamps', () => {
  assert.equal(ratingPercent(800), 0);
  assert.equal(ratingPercent(1000), 50);
  assert.equal(ratingPercent(1200), 100);
  assert.equal(ratingPercent(600), 0);
  assert.equal(ratingPercent(1400), 100);
});

test('ratingBand uses the contract thresholds', () => {
  assert.equal(ratingBand(1050), 'good');
  assert.equal(ratingBand(1049.9), 'average');
  assert.equal(ratingBand(950), 'average');
  assert.equal(ratingBand(949.9), 'practice');
});

test('splitSkills rates only skills with at least 2 attempts, keeping order', () => {
  const { rated, unrated } = splitSkills([skill('a', 1100, 3), skill('b', 1020, 1), skill('c', 900, 2)]);
  assert.deepEqual(rated.map((s) => s.key), ['a', 'c']);
  assert.deepEqual(unrated.map((s) => s.key), ['b']);
});

test('recurringLines capitalises the practice and appends count/window per locale', () => {
  const items = [{ code: 'no_student_tests', count: 4, practice: 'viết ít nhất 3 test trước khi Submit' }];
  assert.deepEqual(recurringLines(items, 5, appContent.vi.progress.recurringUnit), [
    { code: 'no_student_tests', text: 'Viết ít nhất 3 test trước khi Submit (4/5 bài)' },
  ]);
  assert.equal(recurringLines([{ code: 'x', count: 2, practice: 'write tests' }], 5, appContent.en.progress.recurringUnit)[0].text, 'Write tests (2/5)');
});

test('recurringLines drops items without a practice phrase (pre-P3.5 backend)', () => {
  assert.deepEqual(recurringLines([{ code: 'x', count: 3 }, { code: 'y', count: 2, practice: '  ' }], 5, 'bài'), []);
});

test('seriesPath breaks the line at nulls instead of drawing zeros', () => {
  const box = { width: 100, height: 40, padX: 0, padY: 0, max: 3 };
  const { d, points } = seriesPath([1, 2, null, 3, 0], box);
  assert.equal(points.length, 4);
  assert.equal((d.match(/M/g) ?? []).length, 2);
  assert.equal((d.match(/L/g) ?? []).length, 2);
  assert.ok(points.every((p) => p.index !== 2));
  assert.equal(seriesPath([null, null], box).d, '');
});

test('SkillsCard shows a word per rated skill and never the rating number', () => {
  const skills = [skill('hash-map', 1086.0, 3, 'Bảng băm (dict)', 'Hash map'), skill('graphs', 1000, 2, 'Đồ thị', 'Graphs'),
    skill('concurrency', 931.5, 2, 'Đồng thời', 'Concurrency'), skill('regex', 1010, 1, 'Biểu thức chính quy', 'Regex')];
  const vi = render(React.createElement(SkillsCard, { skills, locale: 'vi', copy: appContent.vi.progress }));
  assert.match(vi, /Bảng băm \(dict\)[\s\S]*tốt/);
  assert.match(vi, /Đồ thị[\s\S]*trung bình/);
  assert.match(vi, /Đồng thời[\s\S]*cần luyện/);
  assert.match(vi, /Chưa đủ dữ liệu[\s\S]*Biểu thức chính quy/);
  for (const n of ['1086', '931', '1010', '1000']) assert.ok(!vi.includes(n), `rating ${n} leaked`);
  assert.equal((vi.match(/animate-progress/g) ?? []).length, 3);

  const en = render(React.createElement(SkillsCard, { skills, locale: 'en', copy: appContent.en.progress }));
  assert.match(en, /Hash map[\s\S]*good/);
  assert.match(en, /Concurrency[\s\S]*needs practice/);
  assert.match(en, /Not enough data yet[\s\S]*Regex/);
});

test('RecurringCard hides when the list is empty or has no practice phrases', () => {
  const copy = appContent.vi.progress;
  assert.equal(render(React.createElement(RecurringCard, { items: [], window: 5, copy })), '');
  assert.equal(render(React.createElement(RecurringCard, { items: [{ code: 'x', count: 3 }], window: 5, copy })), '');
  const html = render(React.createElement(RecurringCard, { items: [{ code: 'x', count: 3, practice: 'chạy thử trước khi nộp' }], window: 4, copy }));
  assert.match(html, /Chạy thử trước khi nộp \(3\/4 bài\)/);
});

test('TrendsCard renders nothing without history and gaps v1 reports', () => {
  const props = { axesLabels: appContent.en.axes, naLabel: appContent.en.feedback.naLabel, copy: appContent.en.progress };
  assert.equal(render(React.createElement(TrendsCard, { history: [], ...props })), '');

  const history = [report('CP-001', 64.5), report('CP-004', 71, null), report('CP-006', 80)];
  const html = render(React.createElement(TrendsCard, { history, ...props }));
  assert.match(html, /Overall score/);
  assert.match(html, /Axis trends/);
  for (const name of ['Understanding', 'Hypothesis', 'Prompting', 'Verification', 'Testing', 'Debugging']) assert.match(html, new RegExp(name));
  // Debugging is null everywhere: no line, shown as not applicable.
  assert.match(html, /Debugging<\/span><span[^>]*>Not applicable/);
  // The v1 report sits between two v2 reports, so each axis line has two runs.
  const understandingPath = html.split('aria-label="Understanding"')[1].match(/<path d="([^"]*)"/)[1];
  assert.equal((understandingPath.match(/M/g) ?? []).length, 2);
});

test('TrendsCard keeps only the score chart when every report is v1', () => {
  const history = [report('CP-001', 50, null), report('CP-002', 60, null)];
  const html = render(React.createElement(TrendsCard, {
    history, axesLabels: appContent.vi.axes, naLabel: appContent.vi.feedback.naLabel, copy: appContent.vi.progress,
  }));
  assert.match(html, /Điểm tổng/);
  assert.doesNotMatch(html, /Xu hướng theo trục/);
});

test('progress strings exist in both locales with the same keys', () => {
  assert.deepEqual(Object.keys(appContent.vi.progress).sort(), Object.keys(appContent.en.progress).sort());
  assert.equal(appContent.vi.nav.progress, 'Tiến độ');
  assert.equal(appContent.en.nav.progress, 'Progress');
});
