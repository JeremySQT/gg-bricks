import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: string[] = [];
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('components/button/Button.svelte', props)).body;
after(async () => {
  writeSsrReport('button', checks);
  await closeServer();
});

test('renders a native button with defaults, anatomy and the label as content', async () => {
  const html = await render({ label: 'Save changes' });
  assert.match(html, /^(<!--[^>]*-->)*<button\b/);
  assert.match(html, /type="button"/);
  assert.match(html, /class="ggb-button"/);
  assert.match(html, /data-intent="accent"/);
  assert.match(html, /data-appearance="solid"/);
  assert.match(html, /data-size="md"/);
  assert.match(html, /<span class="ggb-button__container">/);
  // Hydration markers (<!--…-->) may surround the text.
  assert.match(html, /<span class="ggb-button__label">(<!--[^>]*-->)*Save changes(<!--[^>]*-->)*<\/span>/);
  assert.doesNotMatch(html, /data-disabled|data-loading|aria-busy|aria-disabled|ggb-button__loadingIndicator/);
  checks.push('default button: element, type, class, enum data attributes, anatomy, label');
});

test('reflects every enum option as a data attribute', async () => {
  for (const intent of ['accent', 'neutral', 'danger'])
    for (const appearance of ['solid', 'outline', 'ghost'])
      for (const size of ['sm', 'md', 'lg']) {
        const html = await render({ label: 'A', intent, appearance, size });
        assert.match(
          html,
          new RegExp(`data-intent="${intent}"[^>]*data-appearance="${appearance}"[^>]*data-size="${size}"`)
        );
      }
  checks.push('27 intent x appearance x size combinations');
});

test('disabled is native, loading stays focusable and busy, disabled wins over loading', async () => {
  const disabled = await render({ label: 'Save', disabled: true });
  assert.match(disabled, /\sdisabled(=""|\s|>)/);
  assert.match(disabled, /data-disabled=""/);
  assert.match(disabled, /aria-disabled="true"/);

  const loading = await render({ label: 'Save', loading: true });
  assert.doesNotMatch(loading, /\sdisabled(=""|\s|>)/);
  assert.match(loading, /aria-busy="true"/);
  assert.match(loading, /aria-disabled="true"/);
  assert.match(loading, /ggb-button__loadingIndicator/);
  assert.match(loading, /ggb-button__label">(<!--[^>]*-->)*Save(<!--[^>]*-->)*</);

  const both = await render({ label: 'Save', loading: true, disabled: true });
  assert.match(both, /data-disabled=""/);
  assert.match(both, /data-loading=""/);
  assert.doesNotMatch(both, /aria-busy/);
  assert.match(both, /ggb-button__loadingIndicator/);
  checks.push('disabled, loading and their combination');
});

test('href renders a link; disabled removes the destination', async () => {
  const link = await render({ label: 'Create project', href: '/projects/new' });
  assert.match(link, /<a\b[^>]*href="\/projects\/new"/);
  assert.doesNotMatch(link, /type=/);
  const disabled = await render({ label: 'Create project', href: '/projects/new', disabled: true });
  assert.match(disabled, /<a\b/);
  assert.doesNotMatch(disabled, /href=/);
  assert.match(disabled, /aria-disabled="true"/);
  assert.match(disabled, /tabindex="-1"/);
  const loading = await render({ label: 'Create project', href: '/projects/new', loading: true });
  assert.match(loading, /href="\/projects\/new"/);
  assert.match(loading, /aria-busy="true"/);
  checks.push('link role, disabled link without href, loading link kept focusable');
});

test('passes submit type, extra classes and native attributes through', async () => {
  const html = await render({ label: 'Send', type: 'submit', class: 'wide', id: 'send', 'data-testid': 'x' });
  assert.match(html, /type="submit"/);
  assert.match(html, /class="ggb-button wide"/);
  assert.match(html, /id="send"/);
  assert.match(html, /data-testid="x"/);
  checks.push('type submit, class merge, native attributes');
});

test('rejects a missing, empty or blank label', async () => {
  for (const label of [undefined, '', '   ']) await assert.rejects(() => render({ label }), /non-empty label/);
  checks.push('invalid label rejected on the server');
});
