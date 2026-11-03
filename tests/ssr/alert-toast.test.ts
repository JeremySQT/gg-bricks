import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: Record<string, string[]> = { alert: [], toast: [] };
const alert = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/AlertWith.svelte', props)).body;
const toast = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/ToastWith.svelte', props)).body;
after(async () => {
  for (const [id, list] of Object.entries(checks)) writeSsrReport(id, list);
  await closeServer();
});

test('Alert: intent, title, content, intrinsic glyph; not a live region by default', async () => {
  const html = await alert({ intent: 'danger', title: 'Not saved' });
  assert.match(html, /<div class="ggb-alert" data-intent="danger">/);
  assert.match(html, /<span class="ggb-alert__icon" aria-hidden="true">(<!--[^>]*-->)*<svg viewBox="0 0 256 256"/);
  assert.match(html, /<div class="ggb-alert__title">Not saved<\/div>/);
  assert.match(html, /<div class="ggb-alert__content">(<!--[^>]*-->)*The connection was lost.(<!--[^>]*-->)*<\/div>/);
  assert.doesNotMatch(html, /role=/);
  const glyphs = new Set<string>();
  for (const intent of ['neutral', 'info', 'success', 'warning', 'danger']) {
    const h = await alert({ intent });
    glyphs.add(/<path d="([^"]+)"/.exec(h)![1]);
  }
  assert.equal(glyphs.size, 4); // neutral and info share the info glyph
  checks.alert.push(
    'intent as data attribute; decorative intrinsic glyph (info, check-circle, warning, warning-circle)'
  );
  checks.alert.push('title and content rendered; no role unless live');
});

test('Alert: live announces assertively for danger and warning, politely otherwise', async () => {
  for (const [intent, role] of [
    ['danger', 'alert'],
    ['warning', 'alert'],
    ['success', 'status'],
    ['info', 'status'],
    ['neutral', 'status']
  ])
    assert.match(await alert({ intent, live: true }), new RegExp(`data-intent="${intent}" role="${role}"`));
  checks.alert.push('live: role alert for danger and warning, role status for the other intents');
});

test('Alert: dismissible shows a small ghost IconButton named by dismissLabel; actions are small; a message is required', async () => {
  const html = await alert({ dismissible: true, dismissLabel: 'Close the message', actions: true });
  assert.match(
    html,
    /class="ggb-alert__dismiss">(<!--[^>]*-->)*<button[^>]*class="ggb-icon-button"[^>]*data-intent="neutral"[^>]*data-appearance="ghost"[^>]*data-size="sm"/
  );
  assert.match(html, /aria-label="Close the message"/);
  assert.match(html, /class="ggb-button-group" data-size="sm"/);
  assert.match(html, /class="ggb-button"[^>]*data-size="sm"/);
  await assert.rejects(alert({ content: false, title: '' }), /title, a content or both/);
  checks.alert.push('dismiss button: IconButton sm ghost neutral, accessible name from dismissLabel');
  checks.alert.push(
    'the actions ButtonGroup and its buttons are small by default; an alert without title and content is rejected'
  );
});

test('Toast region: a manual popover landmark named by label, at its placement', async () => {
  const html = await toast({});
  assert.match(
    html,
    /<div role="region" class="ggb-toast" data-placement="bottom-end" aria-label="Notifications" popover="manual"/
  );
  const top = await toast({ placement: 'top-center', label: 'Alerts' });
  assert.match(top, /data-placement="top-center" aria-label="Alerts"/);
  checks.toast.push('region: role region named by label (a landmark), popover manual, placement attribute');
});

test('Toast: title, description, glyph, role per intent, dismiss button; the action is small', async () => {
  const html = await toast({
    items: [
      { title: 'Saved', intent: 'success' },
      { title: 'Upload failed', intent: 'danger', description: 'Too large.', actionLabel: 'Retry' }
    ]
  });
  assert.match(html, /<div id="t0" class="ggb-toast__item" data-intent="success" role="status" aria-atomic="true"/);
  assert.match(html, /<div id="t1" class="ggb-toast__item" data-intent="danger" role="alert" aria-atomic="true"/);
  assert.match(html, /<div class="ggb-toast__title">Saved<\/div>/);
  assert.match(html, /<div class="ggb-toast__description">Too large.<\/div>/);
  assert.equal(html.match(/class="ggb-toast__dismiss"/g)?.length, 2);
  assert.equal(html.match(/aria-label="Dismiss"/g)?.length, 2);
  assert.match(html, /<button[^>]*id="a1"[^>]*data-size="sm"/);
  assert.equal(html.match(/class="ggb-toast__action"/g)?.length, 1);
  await assert.rejects(toast({ items: [{ title: ' ' }] }), /non-empty title/);
  checks.toast.push('toast: role status (alert for danger), atomic; title, description, dismiss button named Dismiss');
  checks.toast.push('the action Button is small whatever it asks for; an empty title is rejected');
});
