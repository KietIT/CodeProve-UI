const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

const loadTs = (mod, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  mod._compile(result.outputText, filename);
};
require.extensions['.ts'] = loadTs;
require.extensions['.tsx'] = loadTs;

const { isAdminLoginId, staffHome, canViewStaffPage } = require('../lib/adminClient.ts');
const viewer = { role: 'payment_viewer', must_change_password: false };

test('lecturer email uses staff login and lands directly on payments', () => {
  assert.equal(isAdminLoginId(' Lecture@CodeProve.vn '), true);
  assert.equal(isAdminLoginId('student@example.com'), false);
  assert.equal(staffHome(viewer), '/admin/payments');
  assert.equal(staffHome({ ...viewer, must_change_password: true }), '/admin/change-password');
  assert.equal(staffHome({ role: 'admin', must_change_password: false }), '/admin');
});

test('payment viewer cannot mount any other admin section', () => {
  assert.equal(canViewStaffPage(viewer, '/admin/payments'), true);
  assert.equal(canViewStaffPage(viewer, '/admin/change-password'), true);
  for (const path of ['/admin', '/admin/users', '/admin/users/1', '/admin/exercises', '/admin/admins', '/admin/activity', '/admin/payments-other']) {
    assert.equal(canViewStaffPage(viewer, path), false, path);
  }
  assert.equal(canViewStaffPage({ role: 'admin' }, '/admin/users'), true);
  assert.equal(canViewStaffPage({ role: 'admin' }, '/admin/admins'), false);
  assert.equal(canViewStaffPage({ role: 'super_admin' }, '/admin/admins'), true);
});

test('lecturer shell renders only payments and sign-out and never mounts blocked children', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const Module = require('node:module');
  const originalLoad = Module._load;
  let pathname = '/admin/payments';
  Module._load = function (request, parent, ...rest) {
    if (request === '@/lib/adminClient') return require('../lib/adminClient.ts');
    if (request === './_auth') return { useAdminAuth: () => ({ admin: { ...viewer, full_name: 'Lecturer' }, loading: false, logout: async () => {} }) };
    if (request === './_copy') return { useAdminCopy: () => ({ t: { common: { payments: 'Payments', signOut: 'Sign out' } } }) };
    if (request === '@/components/ui/Toggles') return { LanguageToggle: () => null, ThemeToggle: () => null };
    if (request === 'next/navigation') return { usePathname: () => pathname, useRouter: () => ({ replace: () => {} }) };
    if (request === 'next/link') return ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
    return originalLoad.call(this, request, parent, ...rest);
  };
  try {
    const Layout = require('../app/(admin)/admin/layout.tsx').default;
    const html = renderToStaticMarkup(React.createElement(Layout, null, React.createElement('p', null, 'Payment content')));
    assert.match(html, /Payment content/);
    assert.match(html, /Sign out/);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(hrefs, ['/admin/payments']);
    for (const blocked of ['/admin', '/admin/users', '/admin/exercises', '/admin/activity', '/admin/admins']) {
      pathname = blocked;
      let mounted = false;
      const Child = () => { mounted = true; return React.createElement('p', null, 'Secret'); };
      renderToStaticMarkup(React.createElement(Layout, null, React.createElement(Child)));
      assert.equal(mounted, false, blocked);
    }
  } finally {
    Module._load = originalLoad;
  }
});
