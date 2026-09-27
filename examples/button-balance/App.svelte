<script lang="ts">
  // Button balance lab (implementation review, 2026-09-27). Page-scoped overrides of the Button spacing,
  // vertical text alignment, icon compensation and truncation; the component itself is unchanged.
  // Under each button: visible gaps (ink to ink) from edge to edge, and the vertical offset of the
  // capital-letter center from the button center and from the icon center.
  import { Button } from '../../packages/svelte/src/index.ts';
  import type { ButtonAppearance, ButtonIntent, ButtonSize } from '../../packages/svelte/src/index.ts';
  import Fixture from '../button/Fixtures.svelte';
  import { tick } from 'svelte';

  type Spacing = Record<ButtonSize, { edge: number; label: number; slot: number }>;
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  const primitives = [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24];
  const current: Spacing = {
    sm: { edge: 8, label: 4, slot: 0 },
    md: { edge: 12, label: 6, slot: 0 },
    lg: { edge: 16, label: 8, slot: 0 }
  };
  const proposal: Spacing = {
    sm: { edge: 8, label: 4, slot: 0 },
    md: { edge: 12, label: 6, slot: 0 },
    lg: { edge: 16, label: 10, slot: 0 }
  };
  // B: the edge padding is the existing control padding (12, 16, 20); leading and trailing carry their own
  // margin on both sides (2), the label a smaller one. md is the user's example: 16 + 4 + 2.
  const proposalB: Spacing = {
    sm: { edge: 12, label: 2, slot: 2 },
    md: { edge: 16, label: 4, slot: 2 },
    lg: { edge: 20, label: 8, slot: 2 }
  };
  const truncWidth: Record<ButtonSize, number> = { sm: 150, md: 190, lg: 230 };

  let spacing = $state<Spacing>(structuredClone(proposal));
  let trim = $state(true);
  let compensate = $state(true);
  let tight = $state(true);
  let zoom = $state(2);
  let mode = $state('light');
  let intent = $state<ButtonIntent>('accent');
  let appearance = $state<ButtonAppearance>('solid');
  let preset = $state('proposal');
  let readings = $state<Record<string, { h: string; v: string }>>({});

  function applyPreset(name: string) {
    preset = name;
    if (name === 'current') {
      spacing = structuredClone(current);
      trim = false;
      tight = false;
    } else if (name === 'proposal' || name === 'proposalB') {
      spacing = structuredClone(name === 'proposal' ? proposal : proposalB);
      trim = true;
      tight = true;
    }
    compensate = true;
  }

  const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
  const ctx = document.createElement('canvas').getContext('2d')!;
  function textInk(el: Element, text: string) {
    const cs = getComputedStyle(el);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    (ctx as unknown as { letterSpacing: string }).letterSpacing =
      cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    const m = ctx.measureText(text);
    return { left: -m.actualBoundingBoxLeft, right: m.actualBoundingBoxRight, advance: m.width };
  }
  /** The prefix the browser keeps before the ellipsis: the longest one whose width plus "…" fits. */
  function visibleText(label: HTMLElement, full: string, available: number) {
    if (textInk(label, full).advance <= available + 0.5) return full;
    let lo = 0;
    let hi = full.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (textInk(label, full.slice(0, mid) + '…').advance <= available + 0.01) lo = mid;
      else hi = mid - 1;
    }
    return full.slice(0, lo) + '…';
  }

  async function refresh() {
    await tick();
    await document.fonts.ready;
    await frame();
    const labels = [...document.querySelectorAll<HTMLElement>('.lab .ggb-button__label')];
    for (const l of labels) {
      l.style.maxInlineSize = '';
      delete l.dataset.shown;
    }
    await frame();
    if (tight)
      for (const l of labels) {
        if (l.scrollWidth <= l.clientWidth) continue;
        const shown = visibleText(l, l.textContent ?? '', l.clientWidth);
        l.dataset.shown = shown;
        l.style.maxInlineSize = `${Math.ceil(textInk(l, shown).advance * 4) / 4 + 0.25}px`;
      }
    await frame();
    const next: typeof readings = {};
    for (const probe of document.querySelectorAll<HTMLElement>('.lab [data-probe]')) {
      const c = probe.querySelector('.ggb-button__container')!.getBoundingClientRect();
      const r = (e: Element) => {
        const b = e.getBoundingClientRect();
        return {
          left: (b.left - c.left) / zoom,
          right: (b.right - c.left) / zoom,
          top: (b.top - c.top) / zoom,
          bottom: (b.bottom - c.top) / zoom
        };
      };
      const label = probe.querySelector<HTMLElement>('.ggb-button__label')!;
      const lb = r(label);
      const text = label.dataset.shown ?? visibleText(label, label.textContent ?? '', lb.right - lb.left);
      const ink = textInk(label, text);
      const segments: [number, number][] = [];
      const lead = probe.querySelector('.ggb-button__leading');
      if (lead) {
        const e = lead.querySelector('path') ?? lead.firstElementChild!;
        segments.push([r(e).left, r(e).right]);
      }
      segments.push([lb.left + ink.left, lb.left + ink.right]);
      const trail = probe.querySelector('.ggb-button__trailing');
      if (trail) {
        const path = trail.querySelector('path');
        const kbd = trail.querySelector('kbd');
        if (path) segments.push([r(path).left, r(path).right]);
        else if (kbd) {
          const k = r(kbd);
          const ki = textInk(kbd, kbd.textContent ?? '');
          segments.push([k.left + ki.left, k.left + ki.right]);
        } else {
          const e = r(trail.firstElementChild!);
          segments.push([e.left, e.right]);
        }
      }
      const width = c.width / zoom;
      const gaps = [segments[0][0]];
      for (let i = 1; i < segments.length; i++) gaps.push(segments[i][0] - segments[i - 1][1]);
      gaps.push(width - segments.at(-1)![1]);
      // Vertical: baseline from a zero-size inline-block probe, cap height from the font.
      const marker = document.createElement('span');
      marker.style.cssText = 'display:inline-block;inline-size:0;block-size:0;vertical-align:baseline';
      label.append(marker);
      const baseline = r(marker).top;
      marker.remove();
      const cap = (() => {
        const cs = getComputedStyle(label);
        ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        return ctx.measureText('H').actualBoundingBoxAscent;
      })();
      // With text-box trim the label box is exactly cap top to baseline; otherwise estimate from font metrics.
      const capCenter = trim ? (lb.top + lb.bottom) / 2 : baseline - cap / 2;
      const height = c.height / zoom;
      let v = `text ${trim ? '' : '≈'}${fmt(capCenter - height / 2)}`;
      const icon = probe.querySelector('.ggb-button__leading path, .ggb-button__trailing path');
      if (icon) {
        const ib = r(icon);
        v += ` · vs icon ${fmt(capCenter - (ib.top + ib.bottom) / 2)}`;
      }
      next[probe.dataset.probe!] = { h: gaps.map((g) => g.toFixed(1)).join(' · '), v };
    }
    readings = next;
  }
  const fmt = (x: number) => (Math.abs(x) < 0.05 ? '0' : (x > 0 ? '+' : '') + x.toFixed(2));

  $effect(() => {
    void [JSON.stringify(spacing), trim, compensate, tight, zoom, intent, appearance, mode];
    refresh();
  });
</script>

{#snippet plus()}<Fixture kind="icon" value="plus" />{/snippet}
{#snippet arrow()}<Fixture kind="icon" value="arrow" />{/snippet}
{#snippet download()}<Fixture kind="icon" value="download" />{/snippet}
{#snippet counter()}<Fixture kind="counter" value="8" />{/snippet}
{#snippet shortcut()}<Fixture kind="shortcut" value="⌘S" />{/snippet}

<div class="page" data-ggb-brand="base" data-ggb-appearance={mode} data-ggb-density="standard">
  <header>
    <p class="eyebrow">ggbrick · button balance lab</p>
    <h1>Visual balance</h1>
    <p>
      Adjust the spacing per size and the alignment options, then judge by eye (use the zoom). Under each button:
      <b>↔</b> the visible gaps from edge to edge (drawing to drawing, in px) and <b>↕</b> the vertical offset of the capital
      letters' center from the button center and from the icon center (0 = centered; negative = text too high).
    </p>
  </header>

  <div class="panel controls">
    <div class="row">
      <span class="k">Preset</span>
      <button class="chip" class:on={preset === 'current'} onclick={() => applyPreset('current')}
        >Current (review v4)</button
      >
      <button class="chip" class:on={preset === 'proposal'} onclick={() => applyPreset('proposal')}>Proposal</button>
      <button class="chip" class:on={preset === 'proposalB'} onclick={() => applyPreset('proposalB')}
        >Proposal B (slot margin)</button
      >
    </div>
    <div class="grid3">
      {#each sizes as s (s)}
        <fieldset>
          <legend>{s}</legend>
          <label
            >Edge <select bind:value={spacing[s].edge} onchange={() => (preset = 'custom')}
              >{#each primitives as v (v)}<option value={v}>{v}</option>{/each}</select
            ></label
          >
          <label
            >Label <select bind:value={spacing[s].label} onchange={() => (preset = 'custom')}
              >{#each primitives as v (v)}<option value={v}>{v}</option>{/each}</select
            ></label
          >
          <label
            >Slot <select bind:value={spacing[s].slot} onchange={() => (preset = 'custom')}
              >{#each primitives as v (v)}<option value={v}>{v}</option>{/each}</select
            ></label
          >
          <small
            >Box spacing: edge → slot {spacing[s].edge + spacing[s].slot} · slot → label {spacing[s].slot +
              spacing[s].label} · no slot {spacing[s].edge + spacing[s].label}</small
          >
        </fieldset>
      {/each}
    </div>
    <div class="row">
      <label class="check"
        ><input type="checkbox" bind:checked={trim} onchange={() => (preset = 'custom')} /> Center on capital letters (text-box
        trim)</label
      >
      <label class="check"
        ><input type="checkbox" bind:checked={compensate} onchange={() => (preset = 'custom')} /> Icon optical compensation
        (1/8)</label
      >
      <label class="check"
        ><input type="checkbox" bind:checked={tight} onchange={() => (preset = 'custom')} /> Tight ellipsis (label box fits
        the visible text)</label
      >
    </div>
    <div class="row">
      <label
        >Zoom <select bind:value={zoom}
          ><option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option></select
        ></label
      >
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
    </div>
  </div>

  <div
    class="lab"
    class:trim
    class:nocomp={!compensate}
    style:--sm-edge={`${spacing.sm.edge}px`}
    style:--sm-label={`${spacing.sm.label}px`}
    style:--md-edge={`${spacing.md.edge}px`}
    style:--md-label={`${spacing.md.label}px`}
    style:--lg-edge={`${spacing.lg.edge}px`}
    style:--lg-label={`${spacing.lg.label}px`}
    style:--sm-slot={`${spacing.sm.slot}px`}
    style:--md-slot={`${spacing.md.slot}px`}
    style:--lg-slot={`${spacing.lg.slot}px`}
  >
    {#each sizes as s (s)}
      <section class="panel">
        <h2>Size {s}</h2>
        <div class="stage" style:zoom>
          {#snippet probe(key: string, label: string, leading?: typeof plus, trailing?: typeof plus, width?: number)}
            <div class="probe" data-probe={key}>
              <div class="holder" style:inline-size={width ? `${width}px` : undefined}>
                <Button {label} size={s} {intent} {appearance} {leading} {trailing} />
              </div>
              <small>↔ {readings[key]?.h ?? '…'}</small>
              <small>↕ {readings[key]?.v ?? '…'}</small>
            </div>
          {/snippet}
          {@render probe(`${s}-label`, 'Save')}
          {@render probe(`${s}-leading`, 'New project', plus)}
          {@render probe(`${s}-trailing`, 'Continue', undefined, arrow)}
          {@render probe(`${s}-counter`, 'Inbox', undefined, counter)}
          {@render probe(`${s}-shortcut`, 'Save', undefined, shortcut)}
          {@render probe(`${s}-both`, `Size ${s}`, plus, counter)}
          {@render probe(`${s}-download`, 'Download', download, shortcut)}
          {@render probe(`${s}-truncated`, 'Create a new item with a long label', plus, counter, truncWidth[s])}
        </div>
      </section>
    {/each}
  </div>
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
  .panel {
    max-width: 1200px;
    margin: 0 auto var(--ggb-space-layout-sm);
  }
  h1 {
    font: var(--ggb-typography-heading-xl);
    margin: 0 0 var(--ggb-space-content-sm);
  }
  h2 {
    font: var(--ggb-typography-heading-sm);
    margin: 0 0 var(--ggb-space-content-md);
  }
  p {
    color: var(--ggb-color-content-secondary);
    max-width: 90ch;
  }
  .eyebrow,
  legend,
  .k {
    font: var(--ggb-typography-label-sm);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
  }
  .panel {
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    border: 1px solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .controls {
    display: grid;
    gap: var(--ggb-space-content-md);
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--ggb-color-surface-subtle);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-md) var(--ggb-space-content-lg);
    align-items: center;
    font: var(--ggb-typography-label-md);
  }
  .grid3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--ggb-space-content-md);
  }
  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-sm) var(--ggb-space-content-md);
    align-items: center;
    margin: 0;
    border: 1px solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-control);
    font: var(--ggb-typography-label-md);
  }
  select {
    font: inherit;
    min-height: 32px;
    color: var(--ggb-color-field-default-content);
    background: var(--ggb-color-field-default-surface);
    border: 1px solid var(--ggb-color-field-default-border);
    border-radius: var(--ggb-radius-control);
  }
  .chip {
    font: var(--ggb-typography-label-md);
    min-height: 32px;
    padding-inline: 12px;
    border-radius: var(--ggb-radius-full);
    border: 1px solid var(--ggb-color-border-default);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
    cursor: pointer;
  }
  .chip.on {
    background: var(--ggb-color-content-primary);
    color: var(--ggb-color-surface-default);
  }
  .stage {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: flex-start;
  }
  .probe {
    display: grid;
    gap: 1px;
    justify-items: start;
  }
  .holder {
    display: flex;
  }
  small {
    font: var(--ggb-typography-code-sm);
    font-size: 9px;
    color: var(--ggb-color-content-tertiary);
    white-space: nowrap;
  }

  /* Page-scoped overrides of the Button. */
  .lab :global(.ggb-button[data-size='sm']) {
    --ggb-button-edgeInline: var(--sm-edge);
    --ggb-button-labelInline: var(--sm-label);
    --slot: var(--sm-slot);
  }
  .lab :global(.ggb-button[data-size='md']) {
    --ggb-button-edgeInline: var(--md-edge);
    --ggb-button-labelInline: var(--md-label);
    --slot: var(--md-slot);
  }
  .lab :global(.ggb-button[data-size='lg']) {
    --ggb-button-edgeInline: var(--lg-edge);
    --ggb-button-labelInline: var(--lg-label);
    --slot: var(--lg-slot);
  }
  /* Trimmed to cap height and baseline; the clip margin keeps descenders visible while the ellipsis still works. */
  .lab :global(.ggb-button__leading),
  .lab :global(.ggb-button__trailing) {
    margin-inline: var(--slot);
  }
  .lab.trim :global(.ggb-button__label) {
    text-box: trim-both cap alphabetic;
    overflow: clip;
    overflow-clip-margin: 0.3em;
  }
  .lab.nocomp :global(.ggb-button__leading > svg),
  .lab.nocomp :global(.ggb-button__trailing > svg) {
    margin-inline: 0;
  }
</style>
