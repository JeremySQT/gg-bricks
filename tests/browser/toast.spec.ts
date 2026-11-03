import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  auditAndCapture,
  capture,
  px,
  representative,
  rgb,
  setContext,
  settle,
  tokensFor
} from './helpers.ts';

const out = 'reports/components/toast/svelte';
const items = (page: Page) => page.locator('#region .ggb-toast__item');

test.beforeEach(async ({ page }) => {
  await page.goto('/toast/');
  await page.evaluate(() => document.fonts.ready);
});

test('a named notifications landmark in the top layer; toasts announced by role, newest nearest the edge', async ({
  page
}) => {
  await expect(page.locator('#region')).toHaveJSProperty('popover', 'manual');
  expect(await page.locator('#region').evaluate((r) => r.matches(':popover-open'))).toBe(true);
  expect((await accessible(page, '#region')).name).toBe('Notifications');
  await page.click('#send-saved');
  await page.click('#send-danger');
  await expect(items(page)).toHaveCount(2);
  await expect(items(page).nth(0)).toHaveAttribute('role', 'status');
  await expect(items(page).nth(1)).toHaveAttribute('role', 'alert');
  // Sending never moves focus.
  await expect(page.locator('#send-danger')).toBeFocused();
  const [older, newer] = await items(page).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().bottom));
  expect(newer).toBeGreaterThan(older);
  await settle(page);
  const viewport = page.viewportSize()!;
  const tokens = tokensFor('base-light-standard');
  const edge = px(tokens['space.layout.sm']);
  const box = (await items(page).nth(1).boundingBox())!;
  expect(viewport.height - (box.y + box.height)).toBeCloseTo(edge, 0);
  expect(viewport.width - (box.x + box.width)).toBeCloseTo(edge, 0);
  await page.selectOption('#opt-placement', 'top-start');
  await expect(page.locator('#region')).toHaveAttribute('data-placement', 'top-start');
  await expect(async () => expect((await items(page).nth(1).boundingBox())!.y).toBeCloseTo(edge, 0)).toPass();
  const top = (await items(page).nth(1).boundingBox())!;
  expect(top.y).toBeCloseTo(edge, 0);
  expect(top.x).toBeCloseTo(edge, 0);
  const [olderTop, newerTop] = await items(page).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().top));
  expect(newerTop).toBeLessThan(olderTop);
});

test('a toast leaves after its duration; the countdown pauses on hover and while focus is inside', async ({ page }) => {
  await page.fill('#opt-duration', '800');
  await page.click('#send-saved');
  await expect(items(page)).toHaveCount(1);
  await page.hover('#region .ggb-toast__item');
  await page.waitForTimeout(1200);
  await expect(items(page)).toHaveCount(1);
  await page.mouse.move(10, 10);
  await expect(items(page)).toHaveCount(0, { timeout: 3000 });
  await expect(page.getByTestId('log')).toContainText('Changes saved: dismissed');
  await page.click('#send-saved');
  await page.locator('#region .ggb-toast__dismiss button').focus();
  await page.waitForTimeout(1200);
  await expect(items(page)).toHaveCount(1);
  await page.focus('#send-saved');
  await expect(items(page)).toHaveCount(0, { timeout: 3000 });
});

test('a toast with an action stays; its action runs then the toast leaves; Escape and the dismiss button dismiss', async ({
  page
}) => {
  await page.fill('#opt-duration', '500');
  await page.click('#send-undo');
  await page.waitForTimeout(1000);
  await expect(items(page)).toHaveCount(1);
  await expect(page.locator('#region .ggb-toast__action button')).toHaveAttribute('data-size', 'sm');
  await page.click('#region .ggb-toast__action button');
  await expect(page.getByTestId('undone')).toHaveText('Undone: 1');
  await expect(items(page)).toHaveCount(0);
  await page.click('#send-warning');
  await page.locator('#region .ggb-toast__dismiss button').focus();
  await page.keyboard.press('Escape');
  await expect(items(page)).toHaveCount(0);
  await page.click('#send-warning');
  expect((await accessible(page, '#region .ggb-toast__dismiss button')).name).toBe('Dismiss');
  await page.click('#region .ggb-toast__dismiss button');
  await expect(items(page)).toHaveCount(0);
});

test('at most max toasts are shown; the next one waits, then appears as one leaves', async ({ page }) => {
  await page.fill('#opt-duration', '0');
  for (const id of ['send-saved', 'send-info', 'send-warning', 'send-danger']) await page.click(`#${id}`);
  await expect(items(page)).toHaveCount(4);
  await expect(page.locator('#region .ggb-toast__item[data-queued]')).toHaveCount(1);
  await expect(page.locator('#region .ggb-toast__item:visible')).toHaveCount(3);
  await page.locator('#region .ggb-toast__item').first().locator('.ggb-toast__dismiss button').click();
  await expect(items(page)).toHaveCount(3);
  await expect(page.locator('#region .ggb-toast__item[data-queued]')).toHaveCount(0);
  await expect(page.locator('#region .ggb-toast__item:visible')).toHaveCount(3);
});

test('the region is raised above a modal dialog opened after it; the dialog makes it inert until it closes', async ({
  page
}) => {
  // Every top-layer entry raises the region again (toggle of the region to open after the dialog opened).
  await page.evaluate(() => {
    const w = window as unknown as { raised: number };
    w.raised = 0;
    document.querySelector('#region')!.addEventListener('toggle', (e) => {
      if ((e as ToggleEvent).newState === 'open') w.raised++;
    });
  });
  await page.click('#send-dialog');
  await page.click('#dialog-send');
  await expect(items(page)).toHaveCount(1);
  await expect(items(page).first()).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { raised: number }).raised)).toBeGreaterThan(0);
  // Platform limit, reported at the implementation gate: a modal dialog makes everything outside it inert, top layer
  // included, so the toast is seen above the dialog but cannot be pressed (nor announced) until the dialog closes.
  const box = (await items(page).first().boundingBox())!;
  const hit = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest('.ggb-toast__item') ?? null,
    [box.x + box.width / 2, box.y + 8]
  );
  expect(hit).toBeNull();
  await page.click('#dialog-close');
  const after = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest('.ggb-toast__item')?.id ?? null,
    [box.x + box.width / 2, box.y + 8]
  );
  expect(after).toBe(await items(page).first().getAttribute('id'));
});

test('computed values match the resolved tokens in representative contexts; entry from the edge', async ({ page }) => {
  await page.fill('#opt-duration', '0');
  await page.click('#send-danger');
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    const m = await items(page)
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          surface: s.backgroundColor,
          content: s.color,
          shadow: s.boxShadow,
          radius: s.borderTopLeftRadius,
          padding: s.paddingTop,
          width: el.getBoundingClientRect().width,
          icon: getComputedStyle(el.querySelector('.ggb-toast__icon')!).color,
          description: getComputedStyle(el.querySelector('.ggb-toast__description')!).color,
          transition: s.transitionDuration
        };
      });
    expect(m.surface, context).toBe(rgb(tokens['color.surface.overlay']));
    expect(m.content).toBe(rgb(tokens['color.content.primary']));
    expect(m.description).toBe(rgb(tokens['color.content.secondary']));
    expect(m.icon).toBe(rgb(tokens['color.status.danger.icon']));
    expect(m.radius).toBe(`${px(tokens['radius.overlay'])}px`);
    expect(m.padding).toBe(`${px(tokens['space.content.md'])}px`);
    expect(m.width).toBe(px(tokens['size.overlay.panel']));
    expect(m.shadow).toContain(
      `${rgb(tokens['color.elevation.border'])} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
    );
    report.add(context, { intent: 'danger' }, 'default', m);
  }
  report.write('toast');
});

test('forced colors keep the toast edge', async ({ page }) => {
  await page.fill('#opt-duration', '0');
  await page.click('#send-info');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(
    await items(page)
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopStyle)
  ).toBe('solid');
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await page.fill('#opt-duration', '0');
  await page.click('#send-undo');
  await page.click('#send-danger');
  await auditAndCapture(page, 'toast');
});
