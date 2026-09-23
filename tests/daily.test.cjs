const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Transpile TS on require, matching the other test files.
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (mod, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    });
    mod._compile(result.outputText, filename);
  };
}

const { stripPythonComments } = require('../components/daily/stripComments.ts');

// The exact leak reported in Bug Hunt #7.
const LEAKY = [
  'def reverse_string(s):',
  '    reversed_str = ""',
  '    for i in range(len(s)):',
  '        reversed_str += s[i]',
  '    return reversed_str[::-1]  # This line is incorrect',
  '',
].join('\n');

test('strips a trailing comment that points at the bug', () => {
  const out = stripPythonComments(LEAKY).split('\n');
  assert.equal(out[4], '    return reversed_str[::-1]');
  assert.ok(!stripPythonComments(LEAKY).includes('incorrect'));
});

test('keeps the line count so answers keyed by line number still match', () => {
  assert.equal(stripPythonComments(LEAKY).split('\n').length, LEAKY.split('\n').length);
});

test('a comment-only line becomes an empty line, not a removed one', () => {
  const src = 'def f(x):\n    # bug is on the next line\n    return x + 1';
  assert.deepEqual(stripPythonComments(src).split('\n'), ['def f(x):', '', '    return x + 1']);
});

test('keeps # inside string literals', () => {
  const src = 'tag = "#hash"  # note\nsep = \'#\'\nurl = f"a#{b}"';
  assert.deepEqual(stripPythonComments(src).split('\n'), ['tag = "#hash"', "sep = '#'", 'url = f"a#{b}"']);
});

test('keeps # inside an escaped quote string', () => {
  assert.equal(stripPythonComments('s = "a\\"#b"  # x'), 's = "a\\"#b"');
});

test('does not treat # inside a multi-line docstring as a comment', () => {
  const src = 'def f():\n    """Uses #tags\n    across lines"""\n    return 1  # hint';
  assert.deepEqual(stripPythonComments(src).split('\n'), [
    'def f():',
    '    """Uses #tags',
    '    across lines"""',
    '    return 1',
  ]);
});

test('an unterminated single quote does not swallow the following lines', () => {
  const src = "x = 'oops\ny = 2  # hint";
  assert.deepEqual(stripPythonComments(src).split('\n'), ["x = 'oops", 'y = 2']);
});

test('code without comments is returned unchanged', () => {
  const src = 'def add(a, b):\n    return a + b\n';
  assert.equal(stripPythonComments(src), src);
});
