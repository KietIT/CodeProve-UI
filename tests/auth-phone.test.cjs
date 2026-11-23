const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Resolve the "@/..." path alias to the project root, matching the other tests.
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

const { normalizeVnPhone, normalizeLoginId, isEmail } = require('../lib/phone.ts');
const { authErrorOf, authErrorField } = require('../lib/authErrors.ts');
const { ApiError } = require('../lib/api/client.ts');
const { login, signup, updateMe } = require('../lib/api/auth.ts');

/** Runs `call` against one canned response; returns the request seen and the result or error. */
async function withFetch(status, body, call) {
  const orig = global.fetch;
  const seen = {};
  global.fetch = async (url, init) => {
    seen.url = url;
    seen.method = init.method;
    seen.body = init.body === undefined ? undefined : JSON.parse(init.body);
    return new Response(JSON.stringify(body), { status });
  };
  try {
    return { seen, value: await call() };
  } catch (err) {
    return { seen, error: err };
  } finally {
    global.fetch = orig;
  }
}

test('normalizeVnPhone accepts the formats the backend accepts and returns 0xxxxxxxxx', () => {
  for (const [raw, canonical] of [
    ['0912345678', '0912345678'],
    ['0912 345 678', '0912345678'],
    ['  0912.345.678 ', '0912345678'],
    ['0912-345-678', '0912345678'],
    ['(091) 234-5678', '0912345678'],
    ['+84912345678', '0912345678'],
    ['+84 912 345 678', '0912345678'],
    ['84912345678', '0912345678'],
    ['0312345678', '0312345678'],
    ['0512345678', '0512345678'],
    ['0712345678', '0712345678'],
    ['0812345678', '0812345678'],
  ]) {
    assert.equal(normalizeVnPhone(raw), canonical, raw);
  }
});

test('normalizeVnPhone rejects anything that is not a Vietnamese mobile number', () => {
  for (const raw of [
    '',
    '   ',
    '091234567', // 9 digits
    '09123456789', // 11 digits
    '0112345678', // network prefix not 3/5/7/8/9
    '0212345678',
    '0412345678',
    '0612345678',
    '1912345678', // no leading 0
    '849123456789', // 84 + 10 digits
    '+8491234567', // +84 + 8 digits
    '0912a45678',
    '0912_345_678',
    'an@x.vn',
  ]) {
    assert.equal(normalizeVnPhone(raw), null, JSON.stringify(raw));
  }
});

test('normalizeLoginId keeps emails and canonicalises phone numbers', () => {
  assert.equal(normalizeLoginId(' an@x.vn '), 'an@x.vn');
  assert.equal(normalizeLoginId('0912 345 678'), '0912345678');
  assert.equal(normalizeLoginId('+84 912 345 678'), '0912345678');
  assert.equal(normalizeLoginId('an@x'), null);
  assert.equal(normalizeLoginId('an'), null);
  assert.equal(normalizeLoginId('012345678'), null);
  assert.equal(normalizeLoginId(''), null);
  assert.equal(isEmail('an@x.vn'), true);
  assert.equal(isEmail('0912345678'), false);
});

test('authErrorOf recognises the backend auth errors', () => {
  assert.equal(authErrorOf(new ApiError('x', 409, 'Email already registered')), 'email_taken');
  assert.equal(authErrorOf(new ApiError('x', 409, 'Phone number already registered')), 'phone_taken');
  assert.equal(authErrorOf(new ApiError('x', 401, 'Invalid email, phone number or password')), 'invalid_login');
  const pydantic = (field) => [{ loc: ['body', field], msg: 'Value error', type: 'value_error' }];
  assert.equal(authErrorOf(new ApiError('x', 422, pydantic('phone'))), 'invalid_phone');
  assert.equal(authErrorOf(new ApiError('x', 422, pydantic('identifier'))), 'invalid_identifier');
  assert.equal(authErrorOf(new ApiError('x', 422, pydantic('password'))), null);
  assert.equal(authErrorOf(new ApiError('x', 409, 'Something else')), null);
  assert.equal(authErrorOf(new ApiError('x', 500, 'Email already registered')), null);
  assert.equal(authErrorOf(new Error('Email already registered')), null);
  assert.equal(authErrorField.phone_taken, 'phone');
  assert.equal(authErrorField.email_taken, 'email');
  assert.equal(authErrorField.invalid_login, null);
});

test('login sends { identifier, password }', async () => {
  const { seen } = await withFetch(200, { user: { id: 1, phone: '0912345678' }, access_token: 't' }, () =>
    login('0912345678', 'secret123'),
  );
  assert.match(seen.url, /\/api\/auth\/login$/);
  assert.equal(seen.method, 'POST');
  assert.deepEqual(seen.body, { identifier: '0912345678', password: 'secret123' });
});

test('a rejected login surfaces as invalid_login', async () => {
  const { error } = await withFetch(401, { detail: 'Invalid email, phone number or password' }, () =>
    login('an@x.vn', 'wrong-pass'),
  );
  assert.ok(error instanceof ApiError);
  assert.equal(authErrorOf(error), 'invalid_login');
});

test('signup sends the phone with the privacy consent', async () => {
  const { seen } = await withFetch(200, { user: { id: 1 }, access_token: 't' }, () =>
    signup({ full_name: 'An', email: 'an@x.vn', phone: '0912345678', password: 'secret123' }),
  );
  assert.match(seen.url, /\/api\/auth\/signup$/);
  assert.deepEqual(seen.body, {
    full_name: 'An',
    email: 'an@x.vn',
    phone: '0912345678',
    password: 'secret123',
    accept_privacy: true,
  });
});

test('updateMe can add a phone', async () => {
  const { seen } = await withFetch(200, { id: 1, phone: '0912345678' }, () => updateMe({ phone: '0912345678' }));
  assert.match(seen.url, /\/api\/auth\/me$/);
  assert.equal(seen.method, 'PATCH');
  assert.deepEqual(seen.body, { phone: '0912345678' });
});
