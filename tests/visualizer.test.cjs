const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
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

const { visualizerSource, buildTraceInput, callPlaceholder } = require('../components/workspace/visualizerInput.ts');

const STARTER = 'def sum_to(n):\n    total = 0\n    for i in range(1, n):\n        total += i\n    return total';

test('visualizerSource: traces the served starter while the editor is locked', () => {
  assert.equal(visualizerSource(true, STARTER, ''), STARTER);
  assert.equal(visualizerSource(true, STARTER, 'edited'), STARTER);
});

test('visualizerSource: traces the editor code once unlocked', () => {
  assert.equal(visualizerSource(false, STARTER, 'edited'), 'edited');
  assert.equal(visualizerSource(false, STARTER, ''), '');
});

test('buildTraceInput: blank call falls back to the exercise sample input', () => {
  assert.deepEqual(buildTraceInput(STARTER, 'CP-201', ''), { source_code: STARTER, exercise_code: 'CP-201' });
  assert.deepEqual(buildTraceInput(STARTER, 'CP-201', '   \n'), { source_code: STARTER, exercise_code: 'CP-201' });
});

test('buildTraceInput: a call is trimmed and replaces the exercise lookup', () => {
  assert.deepEqual(buildTraceInput(STARTER, 'CP-201', '  sum_to(5) '), { source_code: STARTER, call: 'sum_to(5)' });
});

test('callPlaceholder: names the first top-level function', () => {
  assert.equal(callPlaceholder(STARTER), 'sum_to(…)');
  assert.equal(callPlaceholder('import math\n\ndef area(r):\n    return math.pi * r\n\ndef other():\n    pass'), 'area(…)');
});

test('callPlaceholder: ignores nested defs and code without a function', () => {
  assert.equal(callPlaceholder('class A:\n    def m(self):\n        pass'), '');
  assert.equal(callPlaceholder('x = 1'), '');
  assert.equal(callPlaceholder(''), '');
});
