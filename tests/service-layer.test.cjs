const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Transpile TS on require, matching tests/ui.test.cjs. Type-only imports (e.g.
// `import type` from the `@/` alias) are elided, so no path mapping is needed.
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (mod, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    mod._compile(result.outputText, filename);
  };
}

const { prepareMentorRequest, CielGuardError } = require('../hooks/cielGuard.ts');

test('Ciel guard blocks an empty message before any network call', () => {
  assert.throws(() => prepareMentorRequest(94, { message: '' }), (e) => e instanceof CielGuardError && e.reason === 'empty');
  assert.throws(() => prepareMentorRequest(94, { message: '   ' }), (e) => e.reason === 'empty');
});

test('Ciel guard requires an active attempt id', () => {
  assert.throws(() => prepareMentorRequest(null, { message: 'Explain hash maps' }), (e) => e instanceof CielGuardError && e.reason === 'no-attempt');
});

test('Ciel guard trims the message and passes code through unchanged', () => {
  const out = prepareMentorRequest(21, { message: '  Explain Two Sum  ', code: 'def f(): pass' });
  assert.deepEqual(out, { id: 21, message: 'Explain Two Sum', code: 'def f(): pass' });
});

test('session store keeps the prompt log in insertion order and clears it', () => {
  const { useSessionStore } = require('../lib/stores/useSessionStore.ts');
  const s = useSessionStore.getState();
  s.startSession(94, 'CP-001');
  s.addPromptEntry({ role: 'user', text: 'first' });
  s.addPromptEntry({ role: 'assistant', text: 'second', verifyHint: true });
  const log = useSessionStore.getState().promptLog;
  assert.equal(log.length, 2);
  assert.deepEqual(log.map((e) => e.text), ['first', 'second']);
  assert.equal(typeof log[0].ts, 'number');
  assert.equal(useSessionStore.getState().attemptId, 94);
  useSessionStore.getState().clear();
  assert.deepEqual(useSessionStore.getState().promptLog, []);
  assert.equal(useSessionStore.getState().attemptId, null);
});

test('editor store updates code/panel and resets to defaults', () => {
  const { useEditorStore } = require('../lib/stores/useEditorStore.ts');
  useEditorStore.getState().setCode('print(1)');
  useEditorStore.getState().setOpenPanel('tests');
  assert.equal(useEditorStore.getState().code, 'print(1)');
  assert.equal(useEditorStore.getState().openPanel, 'tests');
  useEditorStore.getState().reset();
  assert.equal(useEditorStore.getState().code, '');
  assert.equal(useEditorStore.getState().openPanel, 'ciel');
});

const { filterProblems, ALL } = require('../components/dashboard/filterProblems.ts');
const PROBLEMS = [
  { id: 1, num: 1, code: 'CP-001', title: 'Two Sum', difficulty: 'Easy', acceptance: 80, topics: ['array', 'hash'], level: 'fresher', status: 'todo' },
  { id: 2, num: 2, code: 'CP-002', title: 'Valid Parentheses', difficulty: 'Easy', acceptance: 60, topics: ['stack'], level: 'fresher', status: 'solved' },
  { id: 3, num: 3, code: 'CP-010', title: 'LRU Cache', difficulty: 'Hard', acceptance: 30, topics: ['hash', 'design'], level: 'senior', status: 'todo' },
];
const noFilter = { search: '', difficulty: ALL, topic: ALL, level: ALL };

test('filterProblems returns everything when no criteria are set', () => {
  assert.equal(filterProblems(PROBLEMS, noFilter).length, 3);
});

test('filterProblems combines search + topic + level with AND', () => {
  // Easy + topic hash + level fresher + search "sum" -> only CP-001
  const out = filterProblems(PROBLEMS, { search: 'sum', difficulty: 'Easy', topic: 'hash', level: 'fresher' });
  assert.deepEqual(out.map((p) => p.code), ['CP-001']);
});

test('filterProblems search matches title or code, case-insensitively', () => {
  assert.deepEqual(filterProblems(PROBLEMS, { ...noFilter, search: 'cp-010' }).map((p) => p.code), ['CP-010']);
  assert.deepEqual(filterProblems(PROBLEMS, { ...noFilter, search: 'CACHE' }).map((p) => p.code), ['CP-010']);
});

test('filterProblems returns an empty list when nothing matches (not all)', () => {
  // level fresher AND difficulty Hard: no such problem
  assert.equal(filterProblems(PROBLEMS, { ...noFilter, difficulty: 'Hard', level: 'fresher' }).length, 0);
});

const { useVisualizerStore } = require('../lib/stores/useVisualizerStore.ts');
const FRAMES = [
  { line: 1, event: 'line', locals: {} },
  { line: 2, event: 'line', locals: {} },
  { line: 3, event: 'return', locals: {} },
];

test('visualizer store loads frames at step 0 and clamps prev/next at the ends', () => {
  const s = useVisualizerStore.getState();
  s.setFrames(FRAMES);
  assert.equal(useVisualizerStore.getState().step, 0);
  assert.equal(useVisualizerStore.getState().status, 'ready');
  useVisualizerStore.getState().prev();
  assert.equal(useVisualizerStore.getState().step, 0); // clamped at start
  useVisualizerStore.getState().next();
  useVisualizerStore.getState().next();
  assert.equal(useVisualizerStore.getState().step, 2);
  useVisualizerStore.getState().next();
  assert.equal(useVisualizerStore.getState().step, 2); // clamped at end
});

test('visualizer store goto clamps and play auto-stops on the last frame', () => {
  useVisualizerStore.getState().setFrames(FRAMES);
  useVisualizerStore.getState().goto(99);
  assert.equal(useVisualizerStore.getState().step, 2);
  useVisualizerStore.getState().goto(0);
  useVisualizerStore.getState().setPlaying(true);
  assert.equal(useVisualizerStore.getState().playing, true);
  useVisualizerStore.getState().next(); // 0 -> 1
  assert.equal(useVisualizerStore.getState().playing, true);
  useVisualizerStore.getState().next(); // 1 -> 2 (last) -> stop
  assert.equal(useVisualizerStore.getState().step, 2);
  assert.equal(useVisualizerStore.getState().playing, false);
});

test('visualizer store will not start playback with a single frame', () => {
  useVisualizerStore.getState().setFrames([FRAMES[0]]);
  useVisualizerStore.getState().setPlaying(true);
  assert.equal(useVisualizerStore.getState().playing, false);
});
