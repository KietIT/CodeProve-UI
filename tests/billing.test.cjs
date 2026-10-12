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

const { ApiError, readLimitDetail, limitErrorOf } = require('../lib/api/client.ts');
const { getPlans, getBillingMe, startCheckout, getOrderPayment, cancelOrder } = require('../lib/api/billing.ts');
const { planCodeFor, ctaState, checkoutErrorMessage, orderOutcome, formatVnd } = require('../lib/billing.ts');
const { billingContent } = require('../lib/billingContent.ts');

/** Records the one request and answers with a canned JSON body. */
async function withFetch(status, body, run) {
  const orig = global.fetch;
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(body), { status });
  };
  try {
    return { result: await run(), calls };
  } catch (err) {
    return { error: err, calls };
  } finally {
    global.fetch = orig;
  }
}

test('planCodeFor maps the pricing toggle to the backend plan codes', () => {
  assert.equal(planCodeFor('plus', 'monthly'), 'plus_monthly');
  assert.equal(planCodeFor('plus', 'annual'), 'plus_yearly');
  assert.equal(planCodeFor('pro', 'monthly'), 'pro_monthly');
  assert.equal(planCodeFor('pro', 'annual'), 'pro_yearly');
});

test('ctaState: free or signed out buys, same plan renews, another running plan is locked', () => {
  assert.equal(ctaState('plus', null), 'buy');
  assert.equal(ctaState('plus', undefined), 'buy');
  assert.equal(ctaState('plus', { tier: 'free' }), 'buy');
  assert.equal(ctaState('plus', { tier: 'plus' }), 'renew');
  assert.equal(ctaState('pro', { tier: 'plus' }), 'locked');
  assert.equal(ctaState('plus', { tier: 'pro' }), 'locked');
});

test('orderOutcome reads the order the student came back for', () => {
  const me = (status) => ({ orders: [{ id: 7, status }, { id: 8, status: 'paid' }] });
  assert.equal(orderOutcome(me('pending'), 7), 'pending');
  assert.equal(orderOutcome(me('paid'), 7), 'paid');
  assert.equal(orderOutcome(me('paid_unapplied'), 7), 'unapplied');
  for (const closed of ['cancelled', 'expired', 'failed']) assert.equal(orderOutcome(me(closed), 7), 'closed');
  assert.equal(orderOutcome(me('pending'), 99), 'unknown');
});

test('checkoutErrorMessage uses the backend message in the right language, else the fallback', () => {
  const locked = new ApiError('x', 409, {
    code: 'plan_change_not_allowed', message_vi: 'Đợi hết hạn.', message_en: 'Wait for expiry.',
  });
  assert.equal(checkoutErrorMessage(locked, 'vi', 'fb'), 'Đợi hết hạn.');
  assert.equal(checkoutErrorMessage(locked, 'en', 'fb'), 'Wait for expiry.');
  assert.equal(checkoutErrorMessage(new ApiError('boom', 500, 'Internal'), 'en', 'fb'), 'fb');
  assert.equal(checkoutErrorMessage(new Error('network'), 'vi', 'fb'), 'fb');
});

test('formatVnd writes dong amounts with dot separators', () => {
  assert.equal(formatVnd(99000), '99.000đ');
  assert.equal(formatVnd(1990000), '1.990.000đ');
});

test('the monthly submit limit is a limit error and carries the upgrade hint', () => {
  const detail = {
    code: 'monthly_submit_limit', message_vi: 'Hết lượt.', message_en: 'Out.', tier: 'free', upgrade: true,
  };
  assert.deepEqual(readLimitDetail(detail), detail);
  assert.equal(limitErrorOf(new ApiError('x', 429, detail)).upgrade, true);
  // Without the plan fields the shape is unchanged (existing Ciel limits).
  const plain = { code: 'ciel_daily_limit', message_vi: 'a', message_en: 'b' };
  assert.deepEqual(readLimitDetail(plain), plain);
});

test('billing API calls hit the right endpoints and send only the plan code', async () => {
  const plans = await withFetch(200, [], () => getPlans());
  assert.ok(plans.calls[0].url.endsWith('/api/billing/plans'));
  assert.equal(plans.calls[0].init.headers.Authorization, undefined, 'plans is public');

  const me = await withFetch(200, { tier: 'free' }, () => getBillingMe());
  assert.ok(me.calls[0].url.endsWith('/api/billing/me'));

  const checkout = await withFetch(200, { order_id: 1, payment_code: 'CP1', amount: 99000 }, () =>
    startCheckout('plus_monthly'),
  );
  assert.equal(checkout.result.payment_code, 'CP1');
  assert.ok(checkout.calls[0].url.endsWith('/api/billing/checkout'));
  assert.equal(checkout.calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(checkout.calls[0].init.body), { plan_code: 'plus_monthly' });

  const payment = await withFetch(200, { order_id: 5, status: 'pending' }, () => getOrderPayment(5));
  assert.ok(payment.calls[0].url.endsWith('/api/billing/orders/5/payment'));


  const cancel = await withFetch(200, { id: 5, status: 'cancelled' }, () => cancelOrder(5));
  assert.ok(cancel.calls[0].url.endsWith('/api/billing/orders/5/cancel'));
  assert.equal(cancel.calls[0].init.method, 'POST');
});

test('a checkout refusal surfaces as an ApiError with the backend detail', async () => {
  const detail = { code: 'payments_not_configured', message_vi: 'Chưa bật.', message_en: 'Not enabled.' };
  const { error } = await withFetch(503, { detail }, () => startCheckout('pro_yearly'));
  assert.ok(error instanceof ApiError);
  assert.equal(error.status, 503);
  assert.deepEqual(error.detail, detail);
});

test('every locale has the same payment copy keys', () => {
  const keys = (o) => Object.keys(o).sort();
  for (const group of ['pricing', 'success', 'cancel', 'profile', 'limits']) {
    assert.deepEqual(keys(billingContent.vi[group]), keys(billingContent.en[group]), group);
  }
  assert.deepEqual(keys(billingContent.vi.profile.status), keys(billingContent.en.profile.status));
});

test('rememberReturn keeps only same-site paths and takeReturn reads them once', () => {
  const store = new Map();
  global.sessionStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => void store.set(k, String(v)),
    removeItem: (k) => void store.delete(k),
  };
  try {
    const { rememberReturn, takeReturn } = require('../lib/authReturn.ts');
    assert.equal(takeReturn(), '/dashboard');
    rememberReturn('/pricing');
    assert.equal(takeReturn(), '/pricing');
    assert.equal(takeReturn(), '/dashboard');
    rememberReturn('https://evil.example/x');
    rememberReturn('//evil.example/x');
    assert.equal(takeReturn(), '/dashboard');
  } finally {
    delete global.sessionStorage;
  }
});

test('takeReturn falls back when storage is unavailable', () => {
  const { takeReturn } = require('../lib/authReturn.ts');
  assert.equal(takeReturn('/dashboard'), '/dashboard');
});

test('the Ciel limit notice links to pricing only when a higher plan would lift it', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { CielPanel } = require('../components/workspace/CielPanel.tsx');
  const base = {
    messages: [], input: '', onInputChange() {}, onSend() {}, onSuggestionClick() {}, suggestions: [],
    labels: { ask: 'Ask', suggestionsTitle: 'Try' }, limitNotice: 'Daily limit reached', blocked: true,
  };
  const withLink = renderToStaticMarkup(React.createElement(CielPanel, { ...base, upgradeLabel: 'Upgrade plan' }));
  assert.match(withLink, /href="\/pricing"/);
  assert.match(withLink, /Upgrade plan/);
  const without = renderToStaticMarkup(React.createElement(CielPanel, base));
  assert.doesNotMatch(without, /href="\/pricing"/);
});
