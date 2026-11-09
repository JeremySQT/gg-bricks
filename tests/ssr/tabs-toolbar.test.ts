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

test('Tabs: a named tab list; without a value the first enabled tab is selected and its panel shown', async () => {
  const html = await tabs({ label: 'Project' });
  assert.match(
    html,
    /<div id="t" class="ggb-tabs" data-size="md" data-orientation="horizontal" data-activation="automatic">/
  );
  assert.match(html, /class="ggb-tabs__list" role="tablist" aria-label="Project" aria-orientation="horizontal"/);
  assert.match(
    html,
    /role="tab" id="t-tab-activity" aria-selected="true" aria-controls="t-panel-activity" tabindex="0"/
  );
  assert.match(
    html,
    /role="tab" id="t-tab-locked" aria-selected="false" aria-controls="t-panel-locked" tabindex="-1" disabled/
  );
  assert.match(html, /role="tabpanel" id="t-panel-activity" aria-labelledby="t-tab-activity" tabindex="0">/);
  assert.match(html, /role="tabpanel" id="t-panel-files" aria-labelledby="t-tab-files" tabindex="0" hidden/);
  assert.equal(html.match(/aria-selected="true"/g)?.length, 1);
  checks.tabs.push('tablist named by label with its orientation; one selected tab (the first enabled without a value)');
  checks.tabs.push('tabs control their panels; only the selected tab is in the tab order; disabled tab disabled');
  checks.tabs.push('panels labelled by their tab; hidden unless selected; a tab stop on the server');
});

test('Tabs: a value selects its tab on the server; options are exposed; empty label and orphan trigger fail', async () => {
  const html = await tabs({ value: 'files', size: 'lg', orientation: 'vertical', activation: 'manual' });
  assert.match(html, /id="t-tab-files" aria-selected="true"/);
  assert.match(html, /id="t-tab-activity" aria-selected="false"/);
  assert.match(html, /data-size="lg" data-orientation="vertical" data-activation="manual"/);
  assert.match(html, /role="tablist" aria-orientation="vertical"/);
  assert.doesNotMatch(html, /aria-label=/);
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
