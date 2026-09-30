const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

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

const { appContent } = require('../lib/appContent.ts');

const NEUTRAL = { vi: 'Viết vào đây', en: 'Write here' };
// Function / class names of real exercises: an example using them is a free answer.
const EXERCISE_NAMES = ['two_sum', 'sum_to_n', 'LRUCache'];

test('student input placeholders during an attempt are the neutral text only', () => {
  for (const locale of ['vi', 'en']) {
    const { debug, tests } = appContent[locale].solve;
    assert.equal(debug.reasonPlaceholder, NEUTRAL[locale]);
    assert.equal(tests.inputPlaceholder, NEUTRAL[locale]);
    assert.equal(tests.expectedPlaceholder, NEUTRAL[locale]);
    assert.equal(tests.whyPlaceholder, NEUTRAL[locale]);
  }
});

test('test format help examples use neutral names, never a real exercise', () => {
  for (const locale of ['vi', 'en']) {
    const { tests } = appContent[locale].solve;
    const help = [tests.formatInput, tests.formatInputExample, tests.formatClass, tests.formatClassExample, tests.formatRename, tests.formatExpected];
    for (const text of help) {
      assert.equal(typeof text, 'string');
      for (const name of EXERCISE_NAMES) assert.ok(!text.includes(name), `${locale}: "${text}" mentions ${name}`);
    }
    assert.match(tests.formatInputExample, /^f\(/);
    assert.match(tests.formatClassExample, /MyClass\(\)/);
  }
});

test('no workspace copy or Tests tab source hard-codes a real exercise name', () => {
  for (const locale of ['vi', 'en']) {
    const solve = JSON.stringify(appContent[locale].solve);
    for (const name of EXERCISE_NAMES) assert.ok(!solve.includes(name), `${locale} solve copy mentions ${name}`);
  }
  const panel = fs.readFileSync(path.join(__dirname, '../components/studentTests/TestsPanel.tsx'), 'utf8');
  for (const name of EXERCISE_NAMES) assert.ok(!panel.includes(name), `TestsPanel.tsx mentions ${name}`);
});

test('static debug starters (offline fallback, shown verbatim) carry no comment naming the bug', () => {
  const { LEVEL_LIST } = require('../lib/exercises.ts');
  const debug = LEVEL_LIST.flatMap((level) => level.exercises).filter((e) => e.kind === 'debug');
  assert.ok(debug.length > 0);
  for (const e of debug) assert.ok(!e.starter.includes('#'), `${e.id} starter has a comment`);
});
