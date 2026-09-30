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

const {
  MAX_LOCATE_LINES, MAX_REASON_CHARS, debugStep, toggleLine, canSubmitLocation, nextHintStep,
  canResumeAttempt, revealMarks, regionsHit, revealFitsStarter, readResume, writeResume, clearResume,
} = require('../components/debug/locate.ts');

const reveal = (extra = {}) => ({
  regions: [[3]], selected: [2, 3], hit: [true], hints_used: 1, skipped: false,
  explanation: 'Dòng 3: range(1, n) dừng trước n', ...extra,
});

function memoryStore() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    data,
  };
}

test('debugStep: missing or null debug means no locate step', () => {
  assert.equal(debugStep(undefined), 'none');
  assert.equal(debugStep(null), 'none');
  assert.equal(debugStep({ located: false, hints_used: 0, hints: [] }), 'locate');
  assert.equal(debugStep({ located: true, hints_used: 2, hints: ['a', 'b'] }), 'fix');
});

test('toggleLine adds sorted, removes on second click, stops at the maximum', () => {
  assert.deepEqual(toggleLine([], 4), [4]);
  assert.deepEqual(toggleLine([4], 2), [2, 4]);
  assert.deepEqual(toggleLine([2, 4], 4), [2]);
  const full = [1, 2, 3];
  assert.equal(full.length, MAX_LOCATE_LINES);
  assert.deepEqual(toggleLine(full, 5), [1, 2, 3]);
  assert.deepEqual(toggleLine(full, 2), [1, 3]);
});

test('canSubmitLocation needs lines and a reason within limits', () => {
  assert.equal(canSubmitLocation([], 'the loop stops early'), false);
  assert.equal(canSubmitLocation([3], '   '), false);
  assert.equal(canSubmitLocation([3], 'the loop stops early'), true);
  assert.equal(canSubmitLocation([1, 2, 3, 4], 'why'), false);
  assert.equal(canSubmitLocation([3], 'x'.repeat(MAX_REASON_CHARS)), true);
  assert.equal(canSubmitLocation([3], 'x'.repeat(MAX_REASON_CHARS + 1)), false);
});

test('nextHintStep goes 1, 2, then none', () => {
  assert.equal(nextHintStep(0), 1);
  assert.equal(nextHintStep(1), 2);
  assert.equal(nextHintStep(2), null);
});

test('canResumeAttempt only for the same exercise while in progress', () => {
  const state = { id: 7, exercise_code: 'CP-004', status: 'in_progress', score: null, latest_code: null };
  assert.equal(canResumeAttempt(state, 'cp-004'), true);
  assert.equal(canResumeAttempt({ ...state, status: 'submitted' }, 'CP-004'), false);
  assert.equal(canResumeAttempt(state, 'CP-008'), false);
});

test('revealMarks: hit, missed and extra lines', () => {
  const marks = revealMarks(reveal({ regions: [[3], [7, 8]], selected: [2, 3, 7], hit: [true, true] }));
  assert.equal(marks.get(3), 'hit');
  assert.equal(marks.get(7), 'hit');
  assert.equal(marks.get(8), 'missed');
  assert.equal(marks.get(2), 'extra');
  assert.equal(marks.has(1), false);
});

test('revealMarks of a skip shows every bug line as missed', () => {
  const marks = revealMarks(reveal({ skipped: true, selected: [3], hit: [false] }));
  assert.deepEqual([...marks.entries()], [[3, 'missed']]);
});

test('regionsHit counts touched regions, zero on a skip', () => {
  assert.equal(regionsHit(reveal({ regions: [[7], [9]], hit: [true, false] })), 1);
  assert.equal(regionsHit(reveal({ skipped: true, hit: [true] })), 0);
});

test('revealFitsStarter rejects lines beyond the starter', () => {
  assert.equal(revealFitsStarter(reveal(), 5), true);
  assert.equal(revealFitsStarter(reveal({ regions: [[6]] }), 5), false);
  assert.equal(revealFitsStarter(reveal({ selected: [0] }), 5), false);
});

test('resume entry round-trips per exercise and clears', () => {
  const store = memoryStore();
  assert.equal(readResume(store, 'CP-004'), null);
  writeResume(store, 'cp-004', { attemptId: 42, snapshotVersion: 3 });
  assert.deepEqual(readResume(store, 'CP-004'), { attemptId: 42, snapshotVersion: 3 });
  assert.equal(readResume(store, 'CP-008'), null);
  clearResume(store, 'CP-004');
  assert.equal(readResume(store, 'CP-004'), null);
});

test('resume ignores corrupt entries and missing or throwing storage', () => {
  const store = memoryStore();
  store.setItem('codeprove_debug_attempt_CP-004', '{not json');
  assert.equal(readResume(store, 'CP-004'), null);
  store.setItem('codeprove_debug_attempt_CP-004', JSON.stringify({ attemptId: 'x', snapshotVersion: 0 }));
  assert.equal(readResume(store, 'CP-004'), null);
  assert.equal(readResume(null, 'CP-004'), null);
  const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  assert.equal(readResume(throwing, 'CP-004'), null);
  assert.doesNotThrow(() => writeResume(throwing, 'CP-004', { attemptId: 1, snapshotVersion: 0 }));
  assert.doesNotThrow(() => clearResume(throwing, 'CP-004'));
});

test('debug API helpers hit the contract paths with the locale', async () => {
  const calls = [];
  const realFetch = global.fetch;
  global.fetch = async (url, init) => {
    calls.push({ url, method: init.method, body: init.body });
    return { ok: true, json: async () => ({ ok: true }) };
  };
  try {
    const { getAttempt, takeDebugHint, locateBug } = require('../lib/api/attempts.ts');
    await getAttempt(5, 'vi');
    await takeDebugHint(5, 'vi');
    await locateBug(5, { lines: [3], reason: 'stops before n', skipped: false });
    assert.match(calls[0].url, /\/api\/attempts\/5\?locale=vi$/);
    assert.equal(calls[0].method, 'GET');
    assert.match(calls[1].url, /\/api\/attempts\/5\/debug\/hint\?locale=vi$/);
    assert.equal(calls[1].method, 'POST');
    assert.match(calls[2].url, /\/api\/attempts\/5\/debug\/locate$/);
    assert.deepEqual(JSON.parse(calls[2].body), { lines: [3], reason: 'stops before n', skipped: false });
  } finally {
    global.fetch = realFetch;
  }
});

test('a refused location surfaces the server detail', async () => {
  const realFetch = global.fetch;
  global.fetch = async () => ({
    ok: false, status: 422, statusText: 'Unprocessable Entity',
    json: async () => ({ detail: 'Select at least one line, and only the lines you suspect' }),
  });
  try {
    const { locateBug } = require('../lib/api/attempts.ts');
    const { ApiError } = require('../lib/api/client.ts');
    await assert.rejects(
      locateBug(5, { lines: [1, 2, 3], reason: 'r', skipped: false }),
      (e) => e instanceof ApiError && e.status === 422 && e.message.startsWith('Select at least one line'),
    );
  } finally {
    global.fetch = realFetch;
  }
});
