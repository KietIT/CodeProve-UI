const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

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

const { adminErrorMessage, adminRequest } = require('../lib/adminClient.ts');
const { adminCopy } = require('../app/(admin)/admin/_copy.ts');

test('adminErrorMessage reads plain, validation and coded errors', () => {
  assert.equal(adminErrorMessage({ detail: 'User not found' }, 404), 'User not found');
  assert.equal(adminErrorMessage({ detail: [{ msg: 'Reason is too short' }, { msg: 'days too large' }] }, 422),
    'Reason is too short; days too large');
  assert.equal(adminErrorMessage({ detail: { errors: ['missing tests', 'bad level'] } }, 400), 'missing tests; bad level');
  assert.equal(adminErrorMessage({ detail: { code: 'x', message_vi: 'Lỗi', message_en: 'Failed' } }, 409), 'Failed');
  assert.equal(adminErrorMessage({ detail: { code: 'x' } }, 409), 'Request failed (409)');
  assert.equal(adminErrorMessage(null, 500), 'Request failed (500)');
});

test('a coded error is shown in Vietnamese when the page is in Vietnamese', () => {
  global.document = { documentElement: { lang: 'vi' } };
  try {
    assert.equal(adminErrorMessage({ detail: { message_vi: 'Lỗi', message_en: 'Failed' } }, 409), 'Lỗi');
    assert.equal(adminErrorMessage({ detail: { message_en: 'Failed' } }, 409), 'Failed');
  } finally {
    delete global.document;
  }
});

test('giving a plan posts the tier, days and reason through the admin gateway', async () => {
  const orig = global.fetch;
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ tier: 'pro', expires_at: null, days_left: 7, orders: [] }), { status: 200 });
  };
  try {
    const out = await adminRequest('/admin/users/5/subscription', { method: 'POST', body: { tier: 'pro', days: 7, reason: 'gift' } });
    assert.equal(out.tier, 'pro');
    assert.equal(calls[0].url, '/api/admin-gateway/admin/users/5/subscription');
    assert.equal(calls[0].init.method, 'POST');
    assert.deepEqual(JSON.parse(calls[0].init.body), { tier: 'pro', days: 7, reason: 'gift' });
  } finally {
    global.fetch = orig;
  }
});

test('the admin billing and overview copy has the same keys in both languages', () => {
  const keys = (obj) => Object.keys(obj).sort();
  for (const section of ['billing', 'overview', 'users']) {
    assert.deepEqual(keys(adminCopy.vi[section]), keys(adminCopy.en[section]), section);
  }
  assert.deepEqual(keys(adminCopy.vi.billing.tiers), ['free', 'plus', 'pro']);
  assert.match(adminCopy.vi.billing.grantConfirm('Pro', 7), /Pro.*7/);
  assert.match(adminCopy.en.billing.grantConfirm('Pro', 7), /Pro.*7/);
});
