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

const out = 'reports/components/dialog/svelte';
const isOpen = (page: Page, id: string) => page.locator(`#${id}`).evaluate((d) => (d as HTMLDialogElement).open);

test.beforeEach(async ({ page }) => {
  await page.goto('/dialog/');
  await page.evaluate(() => document.fonts.ready);
});

test('a modal dialog named by its title and described; focus moves to the body, stays inside, returns on close', async ({
  page
}) => {
  await page.click('#open');
  expect(await isOpen(page, 'play')).toBe(true);
  const dialog = await accessible(page, '#play');
  expect(dialog.role).toBe('dialog');
  expect(dialog.name).toBe('Invite people to the project');
  expect(dialog.description).toBe('They receive an email with a link that expires in seven days.');
  expect(dialog.properties.modal).toBe(true);
  await expect(page.locator('#play-emails')).toBeFocused();
  // Sequential focus stays inside the dialog.
  for (let i = 0; i < 6; i++) await page.keyboard.press('Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('#play'))).toBe(true);
  // The page under the dialog does not scroll.
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'play')).toBe(false);
  await expect(page.locator('#open')).toBeFocused();
  await expect(page.getByTestId('changes')).toHaveText('Changes: 1');
  // Closing from the application (Cancel) emits nothing.
  await page.click('#open');
  await page.click('#play-cancel');
  expect(await isOpen(page, 'play')).toBe(false);
  await expect(page.getByTestId('changes')).toHaveText('Changes: 1');
});

test('the close button and a backdrop press ask to close when dismissible', async ({ page }) => {
  await page.click('#open');
  expect((await accessible(page, '#play .ggb-dialog__close button')).name).toBe('Close');
  await page.click('#play .ggb-dialog__close button');
  expect(await isOpen(page, 'play')).toBe(false);
  await page.click('#open');
  await page.mouse.click(10, 10);
  expect(await isOpen(page, 'play')).toBe(false);
});

test('an alert dialog ignores backdrop presses; a dialog that is not dismissible has no close button and ignores Escape', async ({
  page
}) => {
  await page.click('#delete');
  expect((await accessible(page, '#confirm')).role).toBe('alertdialog');
  await page.mouse.click(10, 10);
  expect(await isOpen(page, 'confirm')).toBe(true);
  await page.click('#confirm-delete');
  await expect(page.getByTestId('deleted')).toHaveText('Deleted: 1');
  await page.click('#terms');
  await expect(page.locator('#terms-dialog .ggb-dialog__close')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.mouse.click(10, 10);
  expect(await isOpen(page, 'terms-dialog')).toBe(true);
  await page.click('#terms-accept');
  await expect(page.getByTestId('accepted')).toHaveText('Accepted: true');
});

test('autofocus wins the initial focus; a nested dialog stacks above and Escape closes the innermost first', async ({
  page
}) => {
  await page.click('#edit');
  await expect(page.locator('#edit-title')).toBeFocused();
  await page.click('#edit-nested');
  expect(await isOpen(page, 'nested')).toBe(true);
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'nested')).toBe(false);
  expect(await isOpen(page, 'edit-dialog')).toBe(true);
  await page.keyboard.press('Escape');
  expect(await isOpen(page, 'edit-dialog')).toBe(false);
});

test('a long body scrolls between a fixed header and footer, with dividers; a short body has none', async ({
  page
}) => {
  await page.click('#open');
  await settle(page);
  await expect(page.locator('#play')).not.toHaveAttribute('data-scrolled', '');
  await page.keyboard.press('Escape');
  await page.check('#opt-long');
  await page.click('#open');
  await settle(page);
  await expect(page.locator('#play')).toHaveAttribute('data-scrolled', '');
  const m = await page.locator('#play').evaluate((d) => {
    const body = d.querySelector('.ggb-dialog__body') as HTMLElement;
    return {
      scrollable: body.scrollHeight > body.clientHeight,
      dialogBottom: d.getBoundingClientRect().bottom,
      footerBottom: d.querySelector('.ggb-dialog__footer')!.getBoundingClientRect().bottom,
      divider: getComputedStyle(body).borderTopStyle
    };
  });
  expect(m.scrollable).toBe(true);
  expect(m.footerBottom).toBeLessThanOrEqual(m.dialogBottom);
  expect(m.divider).toBe('solid');
});

test('computed values match the resolved tokens for every size in representative contexts; dark subtree', async ({
  page
}) => {
  const report = new ComputedReport();
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const size of ['sm', 'md', 'lg']) {
      await page.selectOption('#opt-size', size);
      await page.click('#open');
      await settle(page);
      const m = await page.locator('#play').evaluate((d) => {
        const s = getComputedStyle(d);
        return {
          surface: s.backgroundColor,
          content: s.color,
          width: d.getBoundingClientRect().width,
          padding: s.paddingTop,
          radius: s.borderTopLeftRadius,
          backdrop: getComputedStyle(d, '::backdrop').backgroundColor,
          title: getComputedStyle(d.querySelector('.ggb-dialog__title')!).fontSize,
          description: getComputedStyle(d.querySelector('.ggb-dialog__description')!).color
        };
      });
      expect(m.surface, `${context} ${size}`).toBe(rgb(tokens['color.surface.overlay']));
      expect(m.content).toBe(rgb(tokens['color.content.primary']));
      expect(m.width).toBe(px(tokens[`component.dialog.inline-size.${size}`]));
      expect(m.padding).toBe(`${px(tokens['space.layout.md'])}px`);
      expect(m.radius).toBe(`${px(tokens['radius.overlay'])}px`);
      expect(m.backdrop).toBe(rgb(tokens['color.surface.scrim']));
      expect(m.description).toBe(rgb(tokens['color.content.secondary']));
      report.add(context, { size }, 'open', m);
      await page.keyboard.press('Escape');
    }
  }
  report.write('dialog');
  await setContext(page, 'base', 'light', 'standard');
  await page.click('#dark');
  const dark = tokensFor('base-dark-standard');
  expect(await page.locator('#dark-dialog').evaluate((d) => getComputedStyle(d).backgroundColor)).toBe(
    rgb(dark['color.surface.overlay'])
  );
});

test('forced colors keep an edge on the panel', async ({ page }) => {
  await page.click('#open');
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.locator('#play').evaluate((d) => getComputedStyle(d).borderTopStyle)).toBe('solid');
  await capture(page, `${out}/forced-colors.png`);
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'dialog');
});
