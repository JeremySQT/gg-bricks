import { test, expect, type Page } from '@playwright/test';
import {
  ComputedReport,
  accessible,
  allContexts,
  auditAndCapture,
  capture,
  px,
  representative,
  rgb,
  setContext,
  settle,
  tokensFor
} from './helpers.ts';

const out = 'reports/components/alert/svelte';
const intents = ['neutral', 'info', 'success', 'warning', 'danger'];

async function measure(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const s = getComputedStyle(el);
    const icon = el.querySelector('.ggb-alert__icon') as HTMLElement;
    const svg = icon.querySelector('svg') as SVGElement;
    const title = el.querySelector('.ggb-alert__title') as HTMLElement | null;
    return {
      surface: s.backgroundColor,
      content: s.color,
      edge: s.boxShadow,
      radius: s.borderTopLeftRadius,
      padding: s.paddingTop,
      gap: s.columnGap,
      fontSize: s.fontSize,
      iconColor: getComputedStyle(icon).color,
      iconSize: svg.getBoundingClientRect().width,
      titleSize: title ? getComputedStyle(title).fontSize : null,
      titleWeight: title ? getComputedStyle(title).fontWeight : null
    };
  });
}
const font = (tokens: ReturnType<typeof tokensFor>, path: string) =>
  `${(tokens[path].$value as { fontSize: { value: number } }).fontSize.value}px`;

test.beforeEach(async ({ page }) => {
  await page.goto('/alert/');
  await page.evaluate(() => document.fonts.ready);
});

test('dismiss emits once and the application removes the alert; the dismiss button is named; actions work', async ({
  page
}) => {
  const dismiss = page.locator('#play .ggb-alert__dismiss button');
  expect((await accessible(page, '#play .ggb-alert__dismiss button')).name).toBe('Dismiss');
  await page.click('#play-choose');
  await expect(page.getByTestId('choose')).toHaveText('Choose: 1');
  await dismiss.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#play')).toHaveCount(0);
  await expect(page.getByTestId('dismissals')).toHaveText('Dismissals: 1');
  await page.click('#play-restore');
  await page.uncheck('#opt-dismissible');
  await expect(page.locator('#play .ggb-alert__dismiss')).toHaveCount(0);
});

test('not a live region by default; live is assertive for danger and warning, polite otherwise', async ({ page }) => {
  await expect(page.locator('#play')).not.toHaveAttribute('role');
  await page.check('#opt-live');
  await expect(page.locator('#play')).toHaveAttribute('role', 'alert');
  await page.selectOption('#opt-intent', 'success');
  await expect(page.locator('#play')).toHaveAttribute('role', 'status');
  await page.click('#save');
  await expect(page.locator('#save-error')).toHaveAttribute('role', 'alert');
  await expect(page.locator('#save')).toBeFocused();
});

test('icon and dismiss sit on the first line; actions are small and under the content', async ({ page }) => {
  const m = await page.locator('#play').evaluate((el) => {
    const title = el.querySelector('.ggb-alert__title')!.getBoundingClientRect();
    const icon = el.querySelector('.ggb-alert__icon svg')!.getBoundingClientRect();
    const dismiss = el.querySelector('.ggb-alert__dismiss .ggb-icon-button__container')!.getBoundingClientRect();
    const content = el.querySelector('.ggb-alert__content')!.getBoundingClientRect();
    const actions = el.querySelector('.ggb-alert__actions')!.getBoundingClientRect();
    const mid = (r: DOMRect) => r.top + r.height / 2;
    return {
      title: mid(title),
      icon: mid(icon),
      dismiss: mid(dismiss),
      contentBottom: content.bottom,
      actionsTop: actions.top
    };
  });
  expect(m.icon).toBeCloseTo(m.title, 0);
  expect(m.dismiss).toBeCloseTo(m.title, 0);
  expect(m.actionsTop).toBeGreaterThan(m.contentBottom);
  await expect(page.locator('#play-choose')).toHaveAttribute('data-size', 'sm');
});

test('accent and neutral buttons take the action family of the alert intent; links inherit', async ({ page }) => {
  for (const intent of ['neutral', 'info', 'success', 'warning', 'danger']) {
    await page.selectOption('#opt-intent', intent);
    await settle(page);
    const tokens = tokensFor('base-light-standard');
    const m = await page.locator('#play').evaluate((el) => {
      const choose = el.querySelector('#play-choose .ggb-button__container') as HTMLElement;
      const later = el.querySelector('#play-later .ggb-button__container') as HTMLElement;
      const link = el.querySelector('.ggb-link') as HTMLElement;
      return {
        choose: getComputedStyle(choose).backgroundColor,
        chooseContent: getComputedStyle(choose).color,
        later: getComputedStyle(later).color,
        link: getComputedStyle(link).color,
        linkTone: link.dataset.tone,
        content: getComputedStyle(el).color
      };
    });
    expect(m.choose, intent).toBe(rgb(tokens[`color.action.${intent}.solid.default.surface`]));
    expect(m.chooseContent).toBe(rgb(tokens[`color.action.${intent}.solid.default.content`]));
    expect(m.later).toBe(rgb(tokens[`color.action.${intent}.ghost.default.content`]));
    expect(m.linkTone).toBe('inherit');
    expect(m.link).toBe(m.content);
  }
});

test('accent outline and ghost buttons take the intent family too, in every context', async ({ page }) => {
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const intent of ['neutral', 'info', 'success', 'warning', 'danger'])
      for (const appearance of ['solid', 'outline', 'ghost']) {
        const color = await page
          .locator(`#act-${intent}-${appearance} .ggb-button__container`)
          .evaluate((c) => getComputedStyle(c).color);
        expect(color, `${context} ${intent} ${appearance}`).toBe(
          rgb(tokens[`color.action.${intent}.${appearance}.default.content`])
        );
      }
  }
});

test('an alert with actions has actionsPaddingEnd under them; without actions the padding is even', async ({
  page
}) => {
  for (const [brand, mode, density] of representative) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    const pad = (sel: string) =>
      page.locator(sel).evaluate((el) => {
        const s = getComputedStyle(el);
        return { top: s.paddingTop, bottom: s.paddingBottom };
      });
    expect(await pad('#act-info'), context).toEqual({
      top: `${px(tokens['space.content.md'])}px`,
      bottom: `${px(tokens['space.content.lg'])}px`
    });
    expect(await pad('#al-info')).toEqual({
      top: `${px(tokens['space.content.md'])}px`,
      bottom: `${px(tokens['space.content.md'])}px`
    });
  }
  // The review page passes the actions only when they are shown: no empty actions row, the padding is even again.
  await page.uncheck('#opt-actions');
  await expect(page.locator('#play .ggb-alert__actions')).toHaveCount(0);
  const play = await page.locator('#play').evaluate((el) => {
    const c = getComputedStyle(el);
    return c.paddingTop === c.paddingBottom;
  });
  expect(play).toBe(true);
});

test('computed values match the resolved tokens for every intent and context', async ({ page }) => {
  test.setTimeout(300_000);
  const report = new ComputedReport();
  for (const [brand, mode, density] of allContexts) {
    const context = `${brand}-${mode}-${density}`;
    const tokens = tokensFor(context);
    await setContext(page, brand, mode, density);
    for (const intent of intents) {
      const m = await measure(page, `#al-${intent}`);
      expect(m.surface, `${context} ${intent}`).toBe(rgb(tokens[`color.status.${intent}.surface`]));
      expect(m.content).toBe(rgb(tokens[`color.status.${intent}.content`]));
      expect(m.edge).toBe(
        `${rgb(tokens[`color.status.${intent}.border`])} 0px 0px 0px ${px(tokens['border.width.default'])}px inset`
      );
      expect(m.iconColor).toBe(rgb(tokens[`color.status.${intent}.icon`]));
      expect(m.radius).toBe(`${px(tokens['radius.container'])}px`);
      expect(m.padding).toBe(`${px(tokens['space.content.md'])}px`);
      expect(m.gap).toBe(`${px(tokens['space.content.sm'])}px`);
      expect(m.iconSize).toBe(px(tokens['size.icon.md']));
      expect(m.fontSize).toBe(font(tokens, 'typography.body.sm'));
      expect(m.titleSize).toBe(font(tokens, 'typography.label.md'));
      report.add(context, { intent }, 'default', m);
    }
  }
  report.write('alert');
});

test('forced colors keep the edge', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  expect(await page.locator('#al-info').evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
  await capture(page, `${out}/forced-colors.png`, { fullPage: true });
});

test('automated accessibility audit and screenshots in light and dark, desktop and mobile', async ({ page }) => {
  await auditAndCapture(page, 'alert');
});
