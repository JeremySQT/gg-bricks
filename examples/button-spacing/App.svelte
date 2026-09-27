<script lang="ts">
  // Spacing exploration for the Button implementation review (2026-09-27). Each variant overrides
  // the Button's horizontal spacing with page-scoped CSS; the component itself is unchanged.
  // Under each button: offset of the label center from the button center, in px (0 = centered).
  import { Button } from '../../packages/svelte/src/index.ts';
  import type { ButtonAppearance, ButtonIntent, ButtonSize } from '../../packages/svelte/src/index.ts';
  import Fixture from '../button/Fixtures.svelte';
  import { onMount, tick } from 'svelte';

  const variants = [
    {
      id: 'a',
      name: 'A · Current',
      text: 'Uniform padding on both sides (sm 12, md 16, lg 20), gap between items (6, 8, 10).'
    },
    {
      id: 'f',
      name: 'F · Thirds (new)',
      text: 'The side spacing (sm 12, md 16, lg 20) is split in three: two thirds as edge padding, one third as label margin (sm 8 + 4, md 10.7 + 5.3, lg 13.3 + 6.7). Without slots nothing changes; an icon sits at two thirds from the edge and one third from the label.'
    },
    {
      id: 'g',
      name: 'G · Thirds + reserved space (new)',
      text: 'F, plus the symmetric reservation of D: the side without content reserves the same width as the other side, so the label is exactly centered.'
    },
    {
      id: 'b',
      name: 'B · Split padding, same totals',
      text: 'Your proposal with the current tokens: edge padding = padding − gap (6, 8, 10), label margin = gap (6, 8, 10). Without slots nothing changes (12, 16, 20); an icon moves closer to the edge.'
    },
    {
      id: 'c',
      name: 'C · Split padding, wider (12 + 12)',
      text: 'Your numbers: edge padding and label margin of equal size (sm 8 + 8, md 12 + 12, lg 16 + 16). Without slots the label has 16, 24, 32 on each side.'
    },
    {
      id: 'd',
      name: 'D · Reserved symmetric space',
      text: 'Current padding and gap; the side without content reserves the same width as the other side, so the label is always exactly centered. Buttons with a single slot get wider.'
    },
    {
      id: 'e',
      name: 'E · Split padding + reserved space (B + D)',
      text: 'Edge padding = padding − gap, label margin = gap, and symmetric reservation: centered label, icon closer to the edge.'
    }
  ];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  const cases = ['label', 'leading', 'trailing', 'counter', 'both'] as const;
  const caseNames: Record<(typeof cases)[number], string> = {
    label: 'Label only',
    leading: 'Leading icon',
    trailing: 'Trailing icon',
    counter: 'Counter',
    both: 'Icon + shortcut'
  };
  let mode = $state('light');
  let intent = $state<ButtonIntent>('danger');
  let appearance = $state<ButtonAppearance>('outline');
  let guides = $state(true);
  let offsets = $state<Record<string, number>>({});

  async function measure() {
    await tick();
    await document.fonts.ready;
    const next: Record<string, number> = {};
    for (const el of document.querySelectorAll<HTMLElement>('[data-measure]')) {
      const c = el.querySelector('.ggb-button__container')!.getBoundingClientRect();
      const l = el.querySelector('.ggb-button__label')!.getBoundingClientRect();
      next[el.dataset.measure!] = Math.round((l.left + l.width / 2 - (c.left + c.width / 2)) * 10) / 10;
    }
    offsets = next;
  }
  onMount(measure);
  $effect(() => {
    void [intent, appearance, mode];
    measure();
  });
</script>

{#snippet trash()}<Fixture kind="icon" value="trash" />{/snippet}
{#snippet arrow()}<Fixture kind="icon" value="arrow" />{/snippet}
{#snippet download()}<Fixture kind="icon" value="download" />{/snippet}
{#snippet counter()}<Fixture kind="counter" value="8" />{/snippet}
{#snippet shortcut()}<Fixture kind="shortcut" value="⌘S" />{/snippet}

<div class="page" class:guides data-ggb-brand="base" data-ggb-appearance={mode} data-ggb-density="standard">
  <header>
    <p class="eyebrow">ggbrick · button spacing test</p>
    <h1>Label balance</h1>
    <p>
      Seven ways to distribute the horizontal spacing when leading or trailing content is present. The number under each
      button is the distance between the label center and the button center (0 = perfectly centered). The dashed line
      marks the button center.
    </p>
    <div class="controls">
      <label>Mode <select bind:value={mode}><option>light</option><option>dark</option></select></label>
      <label
        >Intent <select bind:value={intent}
          ><option>accent</option><option>neutral</option><option>danger</option></select
        ></label
      >
      <label
        >Appearance <select bind:value={appearance}
          ><option>solid</option><option>outline</option><option>ghost</option></select
        ></label
      >
      <label class="check"><input type="checkbox" bind:checked={guides} /> Center guides</label>
    </div>
  </header>

  {#each variants as v (v.id)}
    <section class={`variant variant-${v.id}`}>
      <h2>{v.name}</h2>
      <p>{v.text}</p>
      <div class="table">
        <span></span>
        {#each cases as k (k)}<span class="head">{caseNames[k]}</span>{/each}
        {#each sizes as s (s)}
          <span class="head">{s}</span>
          {#each cases as k (k)}
            {@const key = `${v.id}-${s}-${k}`}
            <div class="cell" data-measure={key}>
              <Button
                label={k === 'counter' ? 'Inbox' : 'Delete'}
                size={s}
                {intent}
                {appearance}
                leading={k === 'leading' ? trash : k === 'both' ? download : undefined}
                trailing={k === 'trailing' ? arrow : k === 'counter' ? counter : k === 'both' ? shortcut : undefined}
              />
              <small class:off={Math.abs(offsets[key] ?? 0) >= 1}>{offsets[key] ?? '…'} px</small>
            </div>
          {/each}
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  :global(body) {
    margin: 0;
  }
  .page {
    min-height: 100vh;
    padding: var(--ggb-space-layout-lg);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
  }
  header,
  section {
    max-width: 1100px;
    margin: 0 auto var(--ggb-space-layout-lg);
  }
  h1 {
    font: var(--ggb-typography-heading-xl);
    margin: 0 0 var(--ggb-space-content-sm);
  }
  h2 {
    font: var(--ggb-typography-heading-md);
    margin: 0 0 var(--ggb-space-content-xs);
    padding-top: var(--ggb-space-layout-sm);
    border-top: 1px solid var(--ggb-color-border-subtle);
  }
  p {
    color: var(--ggb-color-content-secondary);
    max-width: 80ch;
    margin: 0 0 var(--ggb-space-content-md);
  }
  .eyebrow,
  .head {
    font: var(--ggb-typography-label-sm);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-lg);
    align-items: center;
    padding: var(--ggb-space-content-md);
    background: var(--ggb-color-surface-subtle);
    border-radius: var(--ggb-radius-container);
    font: var(--ggb-typography-label-md);
  }
  select {
    font: inherit;
    min-height: 36px;
    color: var(--ggb-color-field-default-content);
    background: var(--ggb-color-field-default-surface);
    border: 1px solid var(--ggb-color-field-default-border);
    border-radius: var(--ggb-radius-control);
  }
  .table {
    display: grid;
    grid-template-columns: max-content repeat(5, minmax(0, 1fr));
    gap: var(--ggb-space-content-md) var(--ggb-space-content-lg);
    align-items: center;
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    border: 1px solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
    overflow-x: auto;
  }
  .cell {
    display: grid;
    justify-items: start;
    gap: 2px;
  }
  small {
    font: var(--ggb-typography-code-sm);
    color: var(--ggb-color-content-tertiary);
  }
  small.off {
    color: var(--ggb-color-action-danger-ghost-default-content);
  }
  .guides :global(.ggb-button__container)::after {
    content: '';
    position: absolute;
    inset-block: -4px;
    left: 50%;
    border-left: 1px dashed var(--ggb-color-border-strong);
    pointer-events: none;
  }

  /* F and G: edge padding = 2/3 of the side spacing, label margin = 1/3, no flex gap. */
  .variant-f :global(.ggb-button__container),
  .variant-g :global(.ggb-button__container) {
    gap: 0;
    padding-inline: calc(var(--ggb-button-paddingInline) * 2 / 3);
  }
  .variant-f :global(.ggb-button__label),
  .variant-g :global(.ggb-button__label) {
    margin-inline: calc(var(--ggb-button-paddingInline) / 3);
  }
  .variant-g :global(.ggb-button__container) {
    display: inline-grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, max-content) minmax(0, 1fr);
  }
  .variant-g :global(.ggb-button__leading) {
    grid-column: 1;
    justify-self: end;
  }
  .variant-g :global(.ggb-button__label) {
    grid-column: 2;
  }
  .variant-g :global(.ggb-button__trailing) {
    grid-column: 3;
    justify-self: start;
  }

  /* B: edge padding = padding − gap, label margin = gap, no flex gap. */
  .variant-b :global(.ggb-button__container),
  .variant-e :global(.ggb-button__container) {
    gap: 0;
    padding-inline: calc(var(--ggb-button-paddingInline) - var(--ggb-button-gap));
  }
  .variant-b :global(.ggb-button__label),
  .variant-e :global(.ggb-button__label) {
    margin-inline: var(--ggb-button-gap);
  }

  /* C: equal edge padding and label margin (sm 8 + 8, md 12 + 12, lg 16 + 16). */
  .variant-c :global(.ggb-button[data-size='sm']) {
    --x: 8px;
  }
  .variant-c :global(.ggb-button[data-size='md']) {
    --x: 12px;
  }
  .variant-c :global(.ggb-button[data-size='lg']) {
    --x: 16px;
  }
  .variant-c :global(.ggb-button__container) {
    gap: 0;
    padding-inline: var(--x);
  }
  .variant-c :global(.ggb-button__label) {
    margin-inline: var(--x);
  }

  /* D and E: three columns, the two side columns always share the same width. */
  .variant-d :global(.ggb-button__container),
  .variant-e :global(.ggb-button__container) {
    display: inline-grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, max-content) minmax(0, 1fr);
    column-gap: 0;
  }
  .variant-d :global(.ggb-button__leading),
  .variant-e :global(.ggb-button__leading) {
    grid-column: 1;
    justify-self: end;
  }
  .variant-d :global(.ggb-button__label),
  .variant-e :global(.ggb-button__label) {
    grid-column: 2;
  }
  .variant-d :global(.ggb-button__trailing),
  .variant-e :global(.ggb-button__trailing) {
    grid-column: 3;
    justify-self: start;
  }
  .variant-d :global(.ggb-button__leading) {
    margin-inline-end: var(--ggb-button-gap);
  }
  .variant-d :global(.ggb-button__trailing) {
    margin-inline-start: var(--ggb-button-gap);
  }
</style>
