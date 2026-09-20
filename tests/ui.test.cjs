const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup: render } = require('react-dom/server');

// Use the existing TypeScript compiler to render TSX without a new test runtime.
for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (mod, filename) => {
    const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    mod._compile(result.outputText, filename);
  };
}
const h = React.createElement;
const { Button } = require('../components/ui/Button.tsx');

test('disabled links cannot navigate or enter the tab order', () => {
  const html = render(h(Button, { href: '/workspace', disabled: true }, 'Start'));
  assert.doesNotMatch(html, /href=/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /tabindex="-1"/);
});

test('Button forwards native form attributes and defaults to a non-submit button', () => {
  const html = render(h(Button, { name: 'intent', value: 'save', title: 'Save draft' }, 'Save'));
  assert.match(html, /type="button"/);
  assert.match(html, /name="intent"/);
  assert.match(html, /value="save"/);
  assert.match(html, /title="Save draft"/);
});

test('AvatarStack keeps the total count when only a subset is displayed', () => {
  assert.ok(fs.existsSync('components/ui/AvatarStack.tsx'), 'AvatarStack is implemented');
  const { AvatarStack } = require('../components/ui/AvatarStack.tsx');
  const avatars = [{ name: 'An Nguyen' }, { name: 'Binh Tran' }, { name: 'Chi Le' }];
  const html = render(h(AvatarStack, { avatars, maxVisible: 2, total: 12, label: 'người làm' }));
  assert.match(html, /12 người làm/);
  assert.match(html, /\+10/);
  assert.match(html, /AN/);
  assert.doesNotMatch(html, /NaN|undefined/);
});

test('AvatarStack handles an empty collection without a fabricated count', () => {
  assert.ok(fs.existsSync('components/ui/AvatarStack.tsx'), 'AvatarStack is implemented');
  const { AvatarStack } = require('../components/ui/AvatarStack.tsx');
  const html = render(h(AvatarStack, { avatars: [], label: 'người làm' }));
  assert.match(html, /0 người làm/);
  assert.doesNotMatch(html, /\+|NaN|undefined/);
});

test('levels and integrity flags have textual labels as well as color', () => {
  assert.ok(fs.existsSync('components/ui/LevelBadge.tsx'), 'LevelBadge is implemented');
  const { LevelBadge } = require('../components/ui/LevelBadge.tsx');
  for (const level of ['Easy', 'Medium', 'Hard']) {
    assert.match(render(h(LevelBadge, { level })), new RegExp(level));
  }
  assert.match(render(h(LevelBadge, { level: 'red', label: 'Cần kiểm tra' })), /Cần kiểm tra/);
});
