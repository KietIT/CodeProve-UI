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

const h = React.createElement;
const {
  apiFetch,
  ApiError,
  readConsentDetail,
  consentErrorOf,
  consentMessageOf,
  outdatedVersionOf,
  onConsentRequired,
  limitErrorOf,
} = require('../lib/api/client.ts');
const { signup } = require('../lib/api/auth.ts');
const { getPrivacy, acceptPrivacy, updatePrivacy } = require('../lib/api/privacy.ts');
const { appContent } = require('../lib/appContent.ts');
const { content } = require('../lib/content.ts');
const { privacyPolicy, PRIVACY_POLICY_VERSION } = require('../lib/legal/privacyPolicy.ts');
const { tokenizeInline } = require('../lib/legal/inline.ts');

const CONSENT = {
  code: 'privacy_consent_required',
  message_vi: 'Bạn cần đồng ý với Chính sách quyền riêng tư trước khi dùng các tính năng AI.',
  message_en: 'Please accept the Privacy Policy before using the AI features.',
};
const STATE = { consented: true, version: '2026-10-2', current_version: '2026-10-2', ai_personalization: true };

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

test('readConsentDetail reads only the consent object', () => {
  assert.deepEqual(readConsentDetail(CONSENT), CONSENT);
  assert.deepEqual(readConsentDetail({ ...CONSENT, extra: 1 }), CONSENT);
  assert.equal(readConsentDetail({ ...CONSENT, code: 'ciel_daily_limit' }), null);
  assert.equal(readConsentDetail({ code: 'privacy_consent_required', message_vi: 'x' }), null);
  assert.equal(readConsentDetail('Forbidden'), null);
  assert.equal(readConsentDetail(null), null);
  // A consent detail is not a cost limit.
  assert.equal(limitErrorOf(new ApiError('x', 403, CONSENT)), null);
});

test('consentErrorOf / consentMessageOf need a 403 ApiError', () => {
  const err = new ApiError(CONSENT.message_en, 403, CONSENT);
  assert.deepEqual(consentErrorOf(err), CONSENT);
  assert.equal(consentMessageOf(err, 'vi'), CONSENT.message_vi);
  assert.equal(consentMessageOf(err, 'en'), CONSENT.message_en);
  assert.equal(consentErrorOf(new ApiError('x', 400, CONSENT)), null);
  assert.equal(consentMessageOf(new Error('boom'), 'vi'), null);
});

test('outdatedVersionOf reads the 409 privacy_version_outdated', () => {
  const err = new ApiError('x', 409, { code: 'privacy_version_outdated', current_version: '2027-01' });
  assert.equal(outdatedVersionOf(err), '2027-01');
  assert.equal(outdatedVersionOf(new ApiError('x', 409, 'Attempt already located')), null);
  assert.equal(outdatedVersionOf(new ApiError('x', 400, { code: 'privacy_version_outdated', current_version: 'v' })), null);
});

test('apiFetch tells the consent listeners about a 403 privacy_consent_required, and only that', async () => {
  let calls = 0;
  const stop = onConsentRequired(() => {
    calls += 1;
  });
  try {
    const refused = await withFetch(403, { detail: CONSENT }, () => apiFetch('/attempts/1/mentor', { method: 'POST' }));
    assert.ok(refused.error instanceof ApiError);
    assert.equal(refused.error.message, CONSENT.message_en);
    assert.equal(calls, 1);

    await withFetch(403, { detail: 'Not your attempt' }, () => apiFetch('/attempts/1'));
    await withFetch(429, { detail: { code: 'ciel_daily_limit', message_vi: 'a', message_en: 'b' } }, () => apiFetch('/x'));
    assert.equal(calls, 1);
  } finally {
    stop();
  }
  await withFetch(403, { detail: CONSENT }, () => apiFetch('/attempts/1/hypothesis', { method: 'POST' }));
  assert.equal(calls, 1, 'unsubscribed listeners are not called');
});

test('signup sends accept_privacy: true', async () => {
  const { seen } = await withFetch(200, { user: { id: 1 }, access_token: 't' }, () => signup('An', 'an@x.vn', 'secret123'));
  assert.match(seen.url, /\/api\/auth\/signup$/);
  assert.deepEqual(seen.body, { full_name: 'An', email: 'an@x.vn', password: 'secret123', accept_privacy: true });
});

test('privacy endpoints use the backend contract', async () => {
  let r = await withFetch(200, STATE, () => getPrivacy());
  assert.match(r.seen.url, /\/api\/me\/privacy$/);
  assert.equal(r.seen.method, 'GET');
  assert.deepEqual(r.value, STATE);

  r = await withFetch(200, STATE, () => acceptPrivacy('2026-10-2'));
  assert.match(r.seen.url, /\/api\/me\/privacy\/consent$/);
  assert.equal(r.seen.method, 'POST');
  assert.deepEqual(r.seen.body, { version: '2026-10-2' });

  r = await withFetch(200, { ...STATE, ai_personalization: false }, () => updatePrivacy({ ai_personalization: false }));
  assert.match(r.seen.url, /\/api\/me\/privacy$/);
  assert.equal(r.seen.method, 'PATCH');
  assert.deepEqual(r.seen.body, { ai_personalization: false });
});

test('tokenizeInline reads bold, code and https links only', () => {
  assert.deepEqual(tokenizeInline('a **b** `c` [d e](https://x.dev/p?q=1) [f](http://x.dev) [NHÓM ĐIỀN: g]'), [
    { kind: 'text', text: 'a ' },
    { kind: 'bold', text: 'b' },
    { kind: 'text', text: ' ' },
    { kind: 'code', text: 'c' },
    { kind: 'text', text: ' ' },
    { kind: 'link', text: 'd e', href: 'https://x.dev/p?q=1' },
    { kind: 'text', text: ' [f](http://x.dev) [NHÓM ĐIỀN: g]' },
  ]);
  assert.deepEqual(tokenizeInline('plain'), [{ kind: 'text', text: 'plain' }]);
});

test('the privacy page serves the approved 2026-10-2 policy in both locales', () => {
  assert.equal(PRIVACY_POLICY_VERSION, '2026-10-2');
  assert.equal(content.vi.pages.privacy, privacyPolicy.vi);
  assert.equal(content.en.pages.privacy, privacyPolicy.en);
  assert.equal(privacyPolicy.vi.updated, '**Cập nhật lần cuối:** 01/10/2026 · **Phiên bản:** 2026-10-2');
  assert.equal(privacyPolicy.en.updated, '**Last updated:** 1 October 2026 · **Version:** 2026-10-2');
  for (const locale of ['vi', 'en']) {
    const doc = privacyPolicy[locale];
    const text = JSON.stringify(doc);
    assert.equal('draftNote' in doc, false, `${locale}: no draft banner`);
    assert.doesNotMatch(text, /NHÓM ĐIỀN|TEAM:|\[số\]|\[number\]|trinhkiet2005/);
    assert.ok(text.includes('**flux@codeprove.vn**'));
    assert.ok(text.includes('(https://developers.openai.com/api/docs/guides/your-data)'));
    assert.equal(doc.sections.length, 8);
  }
  assert.deepEqual(
    privacyPolicy.vi.sections.map((s) => s.h),
    [
      '1. Dữ liệu chúng tôi thu thập',
      '2. Mục đích sử dụng',
      '3. Bên thứ ba xử lý dữ liệu',
      '4. Thời gian lưu trữ',
      '5. Quyền của bạn',
      '6. Bảo mật',
      '7. Độ tuổi',
      '8. Thay đổi chính sách',
    ],
  );
  assert.deepEqual(
    privacyPolicy.en.sections.map((s) => s.h),
    ['1. Data we collect', '2. Why we use it', '3. Processors', '4. Retention', '5. Your rights', '6. Security', '7. Age', '8. Changes'],
  );
  // The terms page keeps its own text.
  assert.equal(content.vi.pages.terms.title, 'Điều khoản dịch vụ');
});

test('LegalPage renders the version, date, tables and the OpenAI link, with no draft markers', () => {
  const { I18nProvider } = require('../lib/i18n.tsx');
  const { LegalPage } = require('../components/sections/LegalPage.tsx');
  const html = render(h(I18nProvider, null, h(LegalPage, { doc: 'privacy' })));
  assert.match(html, /01\/10\/2026/);
  assert.match(html, /Phiên bản:<\/strong><span> 2026-10-2<\/span>/);
  assert.match(html, /<strong[^>]*>flux@codeprove\.vn<\/strong>/);
  assert.match(html, /<code[^>]*>store=false<\/code>/);
  assert.match(
    html,
    /<a href="https:\/\/developers\.openai\.com\/api\/docs\/guides\/your-data" target="_blank" rel="noopener noreferrer"[^>]*>Điều khoản dữ liệu API của OpenAI<\/a>/,
  );
  assert.match(html, /<table/);
  assert.doesNotMatch(html, /<mark|BẢN NHÁP|NHÓM ĐIỀN|role="note"/);

  const terms = render(h(I18nProvider, null, h(LegalPage, { doc: 'terms' })));
  assert.doesNotMatch(terms, /<mark|BẢN NHÁP/);
});

test('the consent dialog summarises, links the policy in a new tab and offers Accept / Later', () => {
  const { I18nProvider } = require('../lib/i18n.tsx');
  const { PrivacyConsentDialog } = require('../components/privacy/PrivacyConsentDialog.tsx');
  const props = { version: '2026-10-2', accepting: false, notice: null, onAccept() {}, onLater() {} };
  const html = render(h(I18nProvider, null, h(PrivacyConsentDialog, props)));
  const t = appContent.vi.privacy.dialog;
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  for (const point of t.points) assert.ok(html.includes(point));
  assert.match(html, /href="\/privacy" target="_blank" rel="noopener noreferrer"/);
  assert.ok(html.includes('>Đồng ý<'));
  assert.ok(html.includes('>Để sau<'));
  assert.ok(html.includes('Phiên bản 2026-10-2'));

  const outdated = render(h(I18nProvider, null, h(PrivacyConsentDialog, { ...props, notice: 'outdated' })));
  assert.ok(outdated.includes(t.outdated));
});

test('privacy copy exists in both locales with the agreed wording', () => {
  assert.equal(appContent.vi.privacy.dialog.accept, 'Đồng ý');
  assert.equal(appContent.en.privacy.dialog.accept, 'Accept');
  assert.equal(appContent.vi.privacy.dialog.later, 'Để sau');
  assert.equal(appContent.en.privacy.dialog.later, 'Later');
  assert.equal(
    `${appContent.vi.privacy.signupAgree} ${appContent.vi.privacy.signupPolicyLink}`,
    'Tôi đã đọc và đồng ý với Chính sách quyền riêng tư',
  );
  assert.equal(`${appContent.en.privacy.signupAgree} ${appContent.en.privacy.signupPolicyLink}`, 'I have read and accept the Privacy Policy');
  assert.equal(appContent.vi.privacy.profile.aiTitle, 'Cá nhân hoá AI');
  assert.equal(appContent.en.privacy.profile.aiTitle, 'AI personalisation');
  assert.equal(
    appContent.vi.privacy.profile.aiHelp,
    'Khi bật, Ciel nhận một bản tóm tắt ngắn về kỹ năng mạnh/yếu của bạn (không có tên, email hay code).',
  );
  assert.equal(
    appContent.en.privacy.profile.aiHelp,
    'When on, Ciel receives a short summary of your strong and weak skills (no name, email or code).',
  );
});
