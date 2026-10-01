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
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    mod._compile(result.outputText, filename);
  };
}

const { apiFetch, ApiError, readLimitDetail, limitErrorOf, parseRetryAfter } = require('../lib/api/client.ts');
const { cielRemaining, showRemaining, nearCap, CIEL_MESSAGE_MAX, HYPOTHESIS_MAX } = require('../lib/cielQuota.ts');
const { appContent } = require('../lib/appContent.ts');

const LIMIT = { code: 'ciel_daily_limit', message_vi: 'Hết lượt hôm nay.', message_en: 'No messages left today.' };

/** Runs apiFetch against a canned response. */
async function failWith(status, body, headers = {}) {
  const orig = global.fetch;
  global.fetch = async () => new Response(JSON.stringify(body), { status, headers });
  try {
    await apiFetch('/attempts/1/mentor', { method: 'POST', body: { message: 'hi' } });
    assert.fail('apiFetch should throw');
  } catch (err) {
    return err;
  } finally {
    global.fetch = orig;
  }
}

test('readLimitDetail reads a limit object and rejects anything else', () => {
  assert.deepEqual(readLimitDetail(LIMIT), LIMIT);
  assert.deepEqual(readLimitDetail({ ...LIMIT, code: 'rate_limited', extra: 1 }), { ...LIMIT, code: 'rate_limited' });
  assert.equal(readLimitDetail('Not found'), null);
  assert.equal(readLimitDetail([{ msg: 'x', loc: ['body', 'message'] }]), null);
  assert.equal(readLimitDetail({ ...LIMIT, code: 'something_else' }), null);
  assert.equal(readLimitDetail({ code: 'hypothesis_limit', message_vi: 'x' }), null);
  assert.equal(readLimitDetail(null), null);
  assert.equal(readLimitDetail(undefined), null);
});

test('limitErrorOf only reads ApiError details', () => {
  assert.deepEqual(limitErrorOf(new ApiError('x', 429, LIMIT)), LIMIT);
  assert.equal(limitErrorOf(new ApiError('x', 404, 'Not found')), null);
  assert.equal(limitErrorOf(new Error('boom')), null);
  assert.equal(limitErrorOf({ detail: LIMIT }), null);
});

test('parseRetryAfter takes whole seconds and ignores junk', () => {
  assert.equal(parseRetryAfter('12'), 12);
  assert.equal(parseRetryAfter('1.2'), 2);
  assert.equal(parseRetryAfter(null), undefined);
  assert.equal(parseRetryAfter(''), undefined);
  assert.equal(parseRetryAfter('soon'), undefined);
  assert.equal(parseRetryAfter('-3'), undefined);
});

test('apiFetch keeps an object detail and the Retry-After header on ApiError', async () => {
  const err = await failWith(429, { detail: { ...LIMIT, code: 'rate_limited' } }, { 'Retry-After': '17' });
  assert.ok(err instanceof ApiError);
  assert.equal(err.status, 429);
  assert.equal(err.retryAfter, 17);
  assert.equal(err.message, LIMIT.message_en);
  assert.deepEqual(limitErrorOf(err), { ...LIMIT, code: 'rate_limited' });
});

test('apiFetch keeps the existing messages for string and array details', async () => {
  const plain = await failWith(404, { detail: 'Attempt not found' });
  assert.equal(plain.message, 'Attempt not found');
  assert.equal(plain.detail, 'Attempt not found');
  assert.equal(plain.retryAfter, undefined);

  const invalid = await failWith(422, { detail: [{ msg: 'too long', loc: ['body', 'message'] }] });
  assert.equal(invalid.message, 'message: too long');
  assert.ok(Array.isArray(invalid.detail));
  assert.equal(limitErrorOf(invalid), null);

  const unknown = await failWith(500, { detail: { other: true } });
  assert.equal(unknown.message, 'Request failed: 500');
});

test('cielRemaining is the tighter quota, null when the backend sends none', () => {
  assert.equal(cielRemaining(undefined), null);
  assert.equal(cielRemaining(null), null);
  assert.equal(cielRemaining({ attempt_left: 12, day_left: 40 }), 12);
  assert.equal(cielRemaining({ attempt_left: 25, day_left: 3 }), 3);
  assert.equal(cielRemaining({ attempt_left: -1, day_left: 3 }), 0);
  assert.equal(showRemaining(11), false);
  assert.equal(showRemaining(10), true);
  assert.equal(showRemaining(null), false);
});

test('the counter shows within 10% of each cap', () => {
  assert.equal(CIEL_MESSAGE_MAX, 4000);
  assert.equal(HYPOTHESIS_MAX, 2000);
  assert.equal(nearCap(3599, CIEL_MESSAGE_MAX), false);
  assert.equal(nearCap(3600, CIEL_MESSAGE_MAX), true);
  assert.equal(nearCap(1799, HYPOTHESIS_MAX), false);
  assert.equal(nearCap(1800, HYPOTHESIS_MAX), true);
});

test('quota copy exists in both locales and never names a cap', () => {
  assert.equal(appContent.vi.solve.quota.cielLeft.replace('{n}', '3'), 'Còn 3 tin nhắn với Ciel');
  assert.equal(appContent.en.solve.quota.cielLeft.replace('{n}', '3'), '3 Ciel messages left');
  for (const locale of ['vi', 'en']) assert.doesNotMatch(appContent[locale].solve.quota.cielOut, /\d/);
});

test('session store drops a refused question by its timestamp', () => {
  const { useSessionStore } = require('../lib/stores/useSessionStore.ts');
  const s = useSessionStore.getState();
  s.startSession(7, 'CP-001');
  s.addPromptEntry({ role: 'user', text: 'kept', ts: 1 });
  s.addPromptEntry({ role: 'user', text: 'refused', ts: 2 });
  useSessionStore.getState().removePromptEntry(2);
  assert.deepEqual(useSessionStore.getState().promptLog.map((e) => e.text), ['kept']);
});

test('CielPanel shows the remaining line, the limit notice and disables sending when blocked', () => {
  const { CielPanel } = require('../components/workspace/CielPanel.tsx');
  const labels = { intro: 'i', verifyHint: 'v', thinking: 't', ask: 'Viết vào đây', suggestionsTitle: 's' };
  const base = {
    initialHint: 'h', input: 'hello', sending: false, onInputChange() {}, onSend() {}, onSuggestionClick() {},
    suggestions: ['q'], labels,
  };

  const normal = render(React.createElement(CielPanel, base));
  assert.match(normal, /maxLength="4000"/);
  assert.doesNotMatch(normal, /disabled=""/);
  assert.doesNotMatch(normal, /\/4000/);

  const low = render(React.createElement(CielPanel, { ...base, remainingLine: '3 Ciel messages left' }));
  assert.match(low, /3 Ciel messages left/);

  const blocked = render(React.createElement(CielPanel, { ...base, blocked: true, limitNotice: LIMIT.message_en }));
  assert.match(blocked, /No messages left today\./);
  // Input, send button and the suggestion all disabled.
  assert.equal((blocked.match(/disabled=""/g) || []).length, 3);

  const long = render(React.createElement(CielPanel, { ...base, input: 'x'.repeat(3700) }));
  assert.match(long, /3700\/4000/);
});
