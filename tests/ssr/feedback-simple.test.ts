// SSR checks of Spinner, Progress and Skeleton (wave 3 feedback components without interaction).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: Record<string, string[]> = { spinner: [], progress: [], skeleton: [] };
const render = async (file: string, props: Record<string, unknown>) => (await renderComponent(file, props)).body;
after(async () => {
  for (const [id, list] of Object.entries(checks)) writeSsrReport(id, list);
  await closeServer();
});

test('Spinner: decorative by default, a named polite status with a label; sizes', async () => {
  const file = 'components/spinner/Spinner.svelte';
  const plain = await render(file, {});
  assert.match(plain, /<span class="ggb-spinner" data-size="md" aria-hidden="true">/);
  assert.doesNotMatch(plain, /role="status"|ggb-spinner__label/);
  assert.match(
    plain,
    /<circle class="ggb-spinner__track" cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5"/
  );
  assert.match(plain, /<path class="ggb-spinner__indicator" d="M21 12a9 9 0 0 0-9-9"/);
  const named = await render(file, { label: 'Loading comments', size: 'xl' });
  assert.match(named, /<span class="ggb-spinner" data-size="xl" role="status" aria-label="Loading comments">/);
  assert.match(named, /<span class="ggb-spinner__label">Loading comments<\/span>/);
  assert.doesNotMatch(named, /class="ggb-spinner"[^>]*aria-hidden/);
  const blank = await render(file, { label: '   ' });
  assert.match(blank, /aria-hidden="true"/);
  checks.spinner.push('empty or blank label: hidden from assistive technology, no role');
  checks.spinner.push(
    'label: role status named by aria-label, with the same text visually hidden inside it as the announced content; ring of radius 9, stroke 2.5, quarter arc'
  );
});

test('Progress: a named progress bar with value, bounds, clamping and the percentage', async () => {
  const file = 'components/progress/Progress.svelte';
  const html = await render(file, { id: 'up', label: 'Uploading', value: 40, showValue: true });
  assert.match(html, /<div class="ggb-progress" data-intent="accent" data-size="md">/);
  assert.match(html, /<span class="ggb-progress__label" id="up-label">Uploading<\/span>/);
  assert.match(html, /<span class="ggb-progress__valueText" aria-hidden="true">40%<\/span>/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="40"/);
  assert.match(html, /aria-valuemax="100"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-labelledby="up-label"/);
  assert.match(html, /class="ggb-progress__indicator" style="inline-size: 40%;"/);
  const over = await render(file, { label: 'Done', value: 150, showValue: true });
  assert.match(over, /aria-valuenow="100"/);
  assert.match(over, />100%</);
  const under = await render(file, { label: 'Empty', value: -5 });
  assert.match(under, /aria-valuenow="0"/);
  assert.match(under, /class="ggb-progress__indicator"[^>]*hidden/);
  const steps = await render(file, {
    label: 'Step 3 of 5',
    value: 3,
    max: 5,
    showValue: true,
    intent: 'danger',
    size: 'lg'
  });
  assert.match(steps, /data-intent="danger" data-size="lg"/);
  assert.match(steps, />60%</);
  checks.progress.push('role progressbar named by the label, value, min 0 and max; percentage from value / max');
  checks.progress.push('value clamped between 0 and max; a fraction of 0 renders no indicator');
});

test('Progress: indeterminate exposes no value; hidden label keeps the name; a label is required', async () => {
  const file = 'components/progress/Progress.svelte';
  const html = await render(file, { id: 'p', label: 'Processing', indeterminate: true, showValue: true });
  assert.doesNotMatch(html, /aria-valuenow/);
  assert.match(html, /data-indeterminate=""/);
  assert.doesNotMatch(html, /ggb-progress__valueText/);
  const hidden = await render(file, { id: 'h', label: 'Uploading', showLabel: false });
  assert.match(hidden, /class="ggb-progress__label ggb-progress__label--hidden" id="h-label">Uploading</);
  assert.match(hidden, /aria-labelledby="h-label"/);
  await assert.rejects(render(file, { label: '' }), /non-empty label/);
  checks.progress.push('indeterminate: no current value, no percentage');
  checks.progress.push('showLabel false keeps the label as the visually hidden name; an empty label is rejected');
});

test('Skeleton: hidden from assistive technology; text lines, block and circle', async () => {
  const file = 'components/skeleton/Skeleton.svelte';
  const text = await render(file, { lines: 3, size: 'lg' });
  assert.match(text, /<div class="ggb-skeleton" data-shape="text" data-size="lg" aria-hidden="true">/);
  assert.equal(text.match(/class="ggb-skeleton__line"/g)?.length, 3);
  const one = await render(file, {});
  assert.equal(one.match(/class="ggb-skeleton__line"/g)?.length, 1);
  const zero = await render(file, { lines: 0 });
  assert.equal(zero.match(/class="ggb-skeleton__line"/g)?.length, 1);
  for (const shape of ['block', 'circle']) {
    const html = await render(file, { shape, lines: 4 });
    assert.match(html, new RegExp(`data-shape="${shape}"`));
    assert.doesNotMatch(html, /ggb-skeleton__line/);
  }
  checks.skeleton.push('aria-hidden on every shape; text renders lines (at least one); block and circle ignore lines');
});
