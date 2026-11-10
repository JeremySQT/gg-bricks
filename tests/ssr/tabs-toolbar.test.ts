import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: Record<string, string[]> = { tabs: [], toolbar: [] };
const tabs = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/TabsWith.svelte', props)).body;
const toolbar = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/ToolbarWith.svelte', props)).body;
after(async () => {
  for (const [id, list] of Object.entries(checks)) writeSsrReport(id, list);
  await closeServer();
});

/** The opening tag of the element with this id. */
const tag = (html: string, id: string) => html.match(new RegExp(`<[a-z]+[^>]* id="${id}"[^>]*>`))?.[0] ?? '';

test('Tabs: a named tab list; without a value the first enabled tab is selected and its panel shown', async () => {
  const html = await tabs({ label: 'Project' });
  const root = tag(html, 't');
  for (const a of [
    'class="ggb-tabs"',
    'data-size="md"',
    'data-orientation="horizontal"',
    'data-activation="automatic"'
  ])
    assert.ok(root.includes(a), a);
  assert.match(html, /class="ggb-tabs__list" aria-label="Project"[^>]* role="tablist" aria-orientation="horizontal"/);
  const activity = tag(html, 't-tab-activity');
  for (const a of ['role="tab"', 'aria-selected="true"', 'tabindex="0"', 'data-state="active"'])
    assert.ok(activity.includes(a), a);
  const locked = tag(html, 't-tab-locked');
  for (const a of ['aria-selected="false"', 'tabindex="-1"', 'disabled']) assert.ok(locked.includes(a), a);
  const panel = tag(html, 't-panel-activity');
  assert.ok(panel.includes('role="tabpanel"') && !panel.includes('hidden'), panel);
  assert.ok(tag(html, 't-panel-files').includes('hidden'));
  assert.equal(html.match(/aria-selected="true"/g)?.length, 1);
  checks.tabs.push('tablist named by label with its orientation; one selected tab (the first enabled without a value)');
  checks.tabs.push('only the selected tab is in the tab order; disabled tab disabled (Bits UI Tabs, ggbrick fallback)');
  checks.tabs.push('panels hidden unless selected, rendered selected on the server');
});

test('Tabs: a value selects its tab on the server; options are exposed; empty label and orphan trigger fail', async () => {
  const html = await tabs({ value: 'files', size: 'lg', orientation: 'vertical', activation: 'manual' });
  assert.ok(tag(html, 't-tab-files').includes('aria-selected="true"'));
  assert.ok(tag(html, 't-tab-activity').includes('aria-selected="false"'));
  const root = tag(html, 't');
  for (const a of ['data-size="lg"', 'data-orientation="vertical"', 'data-activation="manual"'])
    assert.ok(root.includes(a), a);
  assert.match(html, /role="tablist" aria-orientation="vertical"/);
  await assert.rejects(tabs({ triggerLabel: ' ' }), /non-empty label/);
  await assert.rejects(tabs({ lone: true }), /placed in the list of a Tabs/);
  checks.tabs.push('value selects its tab during server rendering; size, orientation and activation rendered');
  checks.tabs.push('a blank tab label and a trigger outside Tabs are rejected');
});

test('Toolbar: a named toolbar with its orientation; its size reaches every item and the menu trigger', async () => {
  const html = await toolbar({ size: 'lg' });
  assert.match(
    html,
    /<div class="ggb-toolbar" role="toolbar" aria-label="Actions" aria-orientation="horizontal" data-size="lg" data-orientation="horizontal">/
  );
  assert.match(html, /class="ggb-icon-button" [^>]*data-size="lg"[^>]*id="copy"|id="copy"[^>]*data-size="lg"/);
  assert.match(html, /id="share"[^>]*data-size="lg"|data-size="lg"[^>]*id="share"/);
  assert.match(html, /id="more-trigger"[^>]*data-size="lg"|data-size="lg"[^>]*id="more-trigger"/);
  assert.match(html, /class="ggb-toolbar__separator" role="separator" aria-orientation="vertical"/);
  const vertical = await toolbar({ orientation: 'vertical' });
  assert.match(vertical, /aria-orientation="vertical" data-size="md" data-orientation="vertical"/);
  assert.match(vertical, /role="separator" aria-orientation="horizontal"/);
  await assert.rejects(toolbar({ label: '' }), /non-empty label/);
  checks.toolbar.push(
    'role toolbar named by label, orientation exposed; size reaches IconButton, Button and Menu trigger'
  );
  checks.toolbar.push('separators perpendicular to the toolbar; a blank label is rejected');
});
