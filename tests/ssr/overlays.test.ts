import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { renderComponent, closeServer, writeSsrReport } from './helpers.ts';

const checks: Record<string, string[]> = { tooltip: [], popover: [], dialog: [], menu: [] };
const render = async (props: Record<string, unknown>) =>
  (await renderComponent('../../../tests/ssr/fixtures/Overlays.svelte', props)).body;
after(async () => {
  for (const [id, list] of Object.entries(checks)) writeSsrReport(id, list);
  await closeServer();
});

test('Tooltip: a manual popover with the tooltip role next to its trigger; a label is required', async () => {
  const html = await render({ kind: 'tooltip', id: 't' });
  assert.match(html, /<span class="ggb-tooltip-trigger" role="none">/);
  assert.match(
    html,
    /<span id="t" class="ggb-tooltip ggb-overlay" role="tooltip" popover="manual" data-side="top" data-align="center">Copy the link<\/span>/
  );
  assert.match(html, /id="copy"/);
  await assert.rejects(render({ kind: 'tooltip', label: ' ' }), /non-empty label/);
  checks.tooltip.push(
    'tooltip role, popover manual, side and align attributes, rendered after the trigger; empty label rejected'
  );
});

test('Popover: the trigger gets the popup attributes; the panel is a named non-modal dialog in an auto popover', async () => {
  const html = await render({ kind: 'popover', side: 'top', align: 'end' });
  assert.match(
    html,
    /id="filters-trigger" popovertarget="filters" aria-haspopup="dialog" aria-expanded="false" aria-controls="filters"/
  );
  assert.match(
    html,
    /<div id="filters" class="ggb-popover ggb-overlay" role="dialog" aria-label="Filters" tabindex="-1" popover="auto"/
  );
  assert.doesNotMatch(html, /aria-modal/);
  await assert.rejects(render({ kind: 'popover', label: '' }), /non-empty label/);
  checks.popover.push('trigger: popovertarget, aria-haspopup dialog, aria-expanded, aria-controls');
  checks.popover.push('panel: role dialog named by label, popover auto, not modal; empty label rejected');
});

test('Dialog: a dialog element named by its title, described, sized; alert, dismissible and the footer group', async () => {
  const html = await render({ kind: 'dialog', description: 'It cannot be undone.', size: 'sm' });
  assert.match(
    html,
    /<dialog id="d" class="ggb-dialog ggb-overlay" data-size="sm" aria-labelledby="d-title" aria-describedby="d-description" tabindex="-1"/
  );
  assert.match(
    html,
    /<div class="ggb-dialog__title" id="d-title" role="heading" aria-level="2">Delete this project\?<\/div>/
  );
  assert.match(html, /<div class="ggb-dialog__description" id="d-description">It cannot be undone.<\/div>/);
  assert.match(html, /aria-label="Close"/);
  // A ButtonGroup around the declaration does not size the buttons of the dialog.
  assert.match(html, /<button[^>]*id="ok"[^>]*data-size="md"/);
  assert.match(html, /class="ggb-icon-button"[^>]*data-size="sm"/);
  const alert = await render({ kind: 'dialog', alert: true, dismissible: false });
  assert.match(alert, /role="alertdialog"/);
  assert.doesNotMatch(alert, /ggb-dialog__close/);
  assert.doesNotMatch(alert, /aria-describedby/);
  await assert.rejects(render({ kind: 'dialog', title: '' }), /non-empty title/);
  checks.dialog.push('native dialog named by the title (heading role) and described by the description; data-size');
  checks.dialog.push(
    'close button named Close when dismissible, absent otherwise; alert dialog role; the footer keeps its own size'
  );
});

test('Menu: menu button attributes, menu named by its trigger, items, link items, disabled, separator and group', async () => {
  const html = await render({ kind: 'menu' });
  assert.match(html, /id="m-trigger" popovertarget="m" aria-haspopup="menu" aria-expanded="false" aria-controls="m"/);
  assert.match(
    html,
    /<div id="m" class="ggb-menu ggb-overlay" role="menu" aria-labelledby="m-trigger" tabindex="-1" popover="auto"/
  );
  assert.match(
    html,
    /<div id="edit" class="ggb-menu__item" role="menuitem" tabindex="-1" data-intent="neutral" data-value="Edit" data-label="Edit">/
  );
  assert.match(
    html,
    /<a id="open" class="ggb-menu__item" role="menuitem" tabindex="-1" href="\/report" data-intent="neutral" data-value="open-tab"/
  );
  // A disabled link item is not a link.
  assert.match(html, /<div id="archive" class="ggb-menu__item" role="menuitem" tabindex="-1" aria-disabled="true"/);
  assert.doesNotMatch(html, /href="\/archive"/);
  assert.match(html, /<div class="ggb-menu__separator" role="separator">/);
  assert.match(html, /<div class="ggb-menu__group" role="group" aria-labelledby="[^"]+-heading">/);
  assert.match(html, /data-intent="danger"/);
  const named = await render({ kind: 'menu', label: 'Report actions' });
  assert.match(named, /role="menu" aria-label="Report actions" tabindex/);
  checks.menu.push('trigger: popovertarget, aria-haspopup menu, aria-expanded; menu named by the trigger or by label');
  checks.menu.push(
    'items: menuitem role, value defaulting to the label, link items as anchors, disabled items never links'
  );
  checks.menu.push('separator role; group named by its heading; danger intent');
});
