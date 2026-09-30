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
const { RecommendedCard, reasonLabels } = require('../components/dashboard/RecommendedCard.tsx');

const item = (over = {}) => ({
  code: 'CP-006',
  title: 'Count Word Frequency',
  level: 'fresher',
  kind: 'implement',
  skills: [
    { key: 'hash-map', vi: 'Bảng băm (dict)', en: 'Hash map' },
    { key: 'string-processing', vi: 'Xử lý chuỗi', en: 'String processing' },
  ],
  reason_skills: ['string-processing'],
  ...over,
});

const renderCard = (items, locale = 'vi') =>
  render(React.createElement(RecommendedCard, { items, locale, copy: appContent[locale].dashboard }));

test('RecommendedCard renders nothing when the list is empty or missing', () => {
  assert.equal(renderCard([]), '');
  assert.equal(renderCard(undefined), '');
});

test('RecommendedCard shows one linked row per item, in the given order', () => {
  const html = renderCard([item(), item({ code: 'CP-104', title: 'Second', level: 'junior' })]);
  assert.match(html, /Bài nên làm tiếp/);
  assert.match(html, /href="\/solve\?id=CP-006&amp;level=fresher"/);
  assert.match(html, /href="\/solve\?id=CP-104&amp;level=junior"/);
  assert.ok(html.indexOf('Count Word Frequency') < html.indexOf('Second'));
  assert.match(html, /Fresher/);
  assert.match(html, /Junior/);
});

test('RecommendedCard labels skills and the reason line in the current locale', () => {
  const vi = renderCard([item()], 'vi');
  assert.match(vi, /Bảng băm \(dict\)/);
  assert.match(vi, /Luyện: Xử lý chuỗi/);
  const en = renderCard([item()], 'en');
  assert.match(en, /Recommended next/);
  assert.match(en, /Hash map/);
  assert.match(en, /Practise: String processing/);
});

test('RecommendedCard hides the reason line when there are no weak skills', () => {
  const html = renderCard([item({ reason_skills: [] })], 'vi');
  assert.doesNotMatch(html, /Luyện:/);
});

test('RecommendedCard marks debug exercises and shows no percentage', () => {
  const html = renderCard([item({ kind: 'debug' }), item({ code: 'CP-001' })]);
  assert.equal((html.match(/>Debug</g) ?? []).length, 1);
  assert.doesNotMatch(html, /%/);
});

test('reasonLabels keeps the skill order and ignores unknown keys', () => {
  const it = item({ reason_skills: ['string-processing', 'nope', 'hash-map'] });
  assert.deepEqual(reasonLabels(it, 'en'), ['Hash map', 'String processing']);
});
