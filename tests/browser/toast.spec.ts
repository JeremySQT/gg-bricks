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

test('a set duration: the toast leaves after it; the countdown pauses on hover and while focus is inside', async ({
  page
}) => {
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

test('default countdowns: 5 s, 8 s with an action (time to undo), none for danger; a set duration wins', async ({
  page
}) => {
  await page.clock.install();
  await page.goto('/toast/');
  await page.click('#send-saved');
  await page.click('#send-undo');
  await page.click('#send-danger');
  await page.mouse.move(5, 5);
  await expect(items(page)).toHaveCount(3);
  await page.clock.runFor(5500);
  await expect(items(page)).toHaveCount(2);
  await expect(page.getByTestId('log')).toContainText('Changes saved: dismissed');
  await page.clock.runFor(3000);
  await expect(items(page)).toHaveCount(1);
  await expect(page.getByTestId('log')).toContainText('Report deleted: dismissed');
  await page.clock.runFor(60000);
  await expect(items(page)).toHaveCount(1);
  await expect(items(page).first()).toHaveAttribute('data-intent', 'danger');
  await page.fill('#opt-duration', '0');
  await page.click('#send-saved');
  await page.clock.runFor(60000);
  await expect(items(page)).toHaveCount(2);
});

test('the action runs then the toast leaves; Escape and the dismiss button dismiss; closable hides the button', async ({
  page
}) => {
  await page.fill('#opt-duration', '0');
  await page.click('#send-undo');
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
  // closable false removes the button when the toast has a countdown; a toast without one keeps it.
  await page.uncheck('#opt-closable');
  await page.click('#send-warning');
  await expect(page.locator('#region .ggb-toast__dismiss')).toHaveCount(1);
  await page.fill('#opt-duration', '4000');
  await page.click('#send-saved');
  await expect(page.locator('#region .ggb-toast__item').nth(1).locator('.ggb-toast__dismiss')).toHaveCount(0);
});

test('layout: one line centered without a description; with one, the action goes under the text', async ({ page }) => {
  await page.fill('#opt-duration', '0');
  await page.click('#send-saved');
  await page.click('#send-undo');
  await settle(page);
  const single = await items(page)
    .nth(0)
    .evaluate((el) => {
      const mid = (s: string) => {
        const r = el.querySelector(s)!.getBoundingClientRect();
        return r.top + r.height / 2;
      };
      const own = el.getBoundingClientRect();
      return {
        layout: el.dataset.layout,
        box: own.top + own.height / 2,
        icon: mid('.ggb-toast__icon svg'),
        title: mid('.ggb-toast__title'),
        dismiss: mid('.ggb-toast__dismiss .ggb-icon-button__container')
      };
    });
  expect(single.layout).toBe('single');
  expect(single.icon).toBeCloseTo(single.box, 0);
  expect(single.title).toBeCloseTo(single.box, 0);
  expect(single.dismiss).toBeCloseTo(single.box, 0);
  const multi = await items(page)
    .nth(1)
    .evaluate((el) => {
      const r = (s: string) => el.querySelector(s)!.getBoundingClientRect();
      return {
        layout: el.dataset.layout,
        icon: r('.ggb-toast__icon svg').top + r('.ggb-toast__icon svg').height / 2,
        title: r('.ggb-toast__title').top + r('.ggb-toast__title').height / 2,
        description: r('.ggb-toast__description').bottom,
        action: r('.ggb-toast__action').top,
        actionLeft: r('.ggb-toast__action').left,
        textLeft: r('.ggb-toast__title').left
      };
    });
  expect(multi.layout).toBe('multi');
  expect(multi.icon).toBeCloseTo(multi.title, 0);
  expect(multi.action).toBeGreaterThan(multi.description);
  expect(multi.actionLeft).toBeCloseTo(multi.textLeft, 0);
});

test('intense: tinted by the intent like an Alert; the secondary action keeps its own neutral colors', async ({
  page
}) => {
  await page.fill('#opt-duration', '0');
  await page.selectOption('#opt-appearance', 'intense');
  await page.click('#send-danger');
  await settle(page);
  const tokens = tokensFor('base-light-standard');
  const m = await items(page)
    .first()
    .evaluate((el) => ({
      surface: getComputedStyle(el).backgroundColor,
      content: getComputedStyle(el).color,
      description: getComputedStyle(el.querySelector('.ggb-toast__description')!).color,
      action: getComputedStyle(el.querySelector('.ggb-toast__action .ggb-button__container')!).color
    }));
  expect(m.surface).toBe(rgb(tokens['color.status.danger.surface']));
  expect(m.content).toBe(rgb(tokens['color.status.danger.content']));
  expect(m.description).toBe(rgb(tokens['color.status.danger.content']));
  expect(m.action).toBe(rgb(tokens['color.action.neutral.outline.default.content']));
});

test('at most max toasts are shown; the next one waits, then appears as one leaves', async ({ page }) => {
  await page.fill('#opt-duration', '0');
  for (const id of ['send-saved', 'send-info', 'send-warning', 'send-danger'])
    await page.locator(`#${id}`).evaluate((b) => (b as HTMLElement).click());
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
