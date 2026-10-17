<script lang="ts">
  // Review of two adjustments asked at the implementation gate of IconButton, Link and Badge (2026-10-17):
  // the Link glyph as a subtle complement rather than in the link color, and Badge descenders cut by the
  // label clip. Variants are page-level overrides of the real components; the chosen one goes into the
  // contract and the component, and this page is then removed.
  import { Badge, Icon, Link } from '../../packages/svelte/src/index.ts';
  import type { BadgeIntent } from '../../packages/svelte/src/index.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');

  const linkVariants = [
    { id: 'a', title: 'A · Current', note: 'Glyph and meta in the link color.' },
    {
      id: 'b',
      title: 'B · Glyph at 70 %',
      note: 'Glyph in the link color at opacity.muted (70 %), like a plain Shortcut beside its label. Works with tone inherit too. Meta unchanged.'
    },
    {
      id: 'c',
      title: 'C · Neutral glyph',
      note: 'Glyph in color.content.tertiary (grey) with the accent tone; with tone inherit it keeps the context color at 70 %. Meta unchanged.'
    },
    {
      id: 'd',
      title: 'D · Neutral glyph and meta',
      note: 'As C, and the meta (PDF, 2.4 MB) in color.content.secondary: the link reads as the underlined words only.'
    }
  ];

  const intents: BadgeIntent[] = ['neutral', 'accent', 'info', 'success', 'warning', 'danger'];
  const words: Record<BadgeIntent, string> = {
    neutral: 'Draft copy',
    accent: 'Beta',
    info: 'Pending',
    success: 'Shipping',
    warning: 'Delayed',
    danger: 'Expiring'
  };
  const badgeVariants = [
    {
      id: 'before',
      title: 'Before · as Safari draws it',
      note: 'The label is clipped vertically at the trimmed baseline: g, p, y lose their descenders. Chromium hid it with overflow-clip-margin, which Safari does not support.'
    },
    {
      id: 'fixed',
      title: 'A · Fixed, mixed case (recommended)',
      note: 'The label is clipped horizontally only (the ellipsis needs nothing more): descenders show in every browser. No contract change.'
    },
    {
      id: 'caps',
      title: 'B · All caps, indicator typography',
      note: 'Uppercase with a little letter spacing (0.04 em): no descenders at all, a more “label” look. Long labels read less easily.'
    },
    {
      id: 'overline',
      title: 'C · All caps, overline typography',
      note: 'Uppercase with typography.overline (600, +0.5 px): the existing role for small caps labels; it has sm and md only, lg would reuse md.'
    }
  ];
</script>

{#snippet icon(name: string)}<Icon><path d={glyphs[name]} /></Icon>{/snippet}
{#snippet check()}{@render icon('check')}{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review · adjustments</p>
    <h1>Link glyph and Badge descenders</h1>
    <p class="lede">
      Two points from the review, side by side on the real components. Pick a Link variant and a Badge variant; switch
      brand, mode and density to compare.
    </p>
    <div class="controls" role="group" aria-label="Context">
      <label
        >Brand <select id="ctx-brand" bind:value={brand}
          >{#each brands as b (b)}<option value={b}>{b}</option>{/each}</select
        ></label
      >
      <label
        >Mode <select id="ctx-mode" bind:value={mode}
          >{#each modes as m (m)}<option value={m}>{m}</option>{/each}</select
        ></label
      >
      <label
        >Density <select id="ctx-density" bind:value={density}
          >{#each densities as d (d)}<option value={d}>{d}</option>{/each}</select
        ></label
      >
    </div>
  </header>

  <section id="link" aria-labelledby="link-title">
    <h2 id="link-title">Link: the glyph as a subtle complement</h2>
    <div class="variants">
      {#each linkVariants as v (v.id)}
        <div class={`panel link-${v.id}`} data-testid={`link-${v.id}`}>
          <p class="panel-title">{v.title}</p>
          <p class="note">{v.note}</p>
          <p class="text body-md">
            Download the <Link
              label="annual report"
              href="#link"
              destination="file"
              fileType="pdf"
              fileSize="2.4 MB"
            />, read the <Link label="Svelte documentation" href="https://svelte.dev" destination="external" /> or write to
            <Link label="support@example.com" href="mailto:support@example.com" destination="email" />.
          </p>
          <div class="stack body-sm">
            <Link label="Call support" href="tel:+33123456789" destination="phone" />
            <Link label="Printable invoice" href="#link" destination="print" />
            <Link label="Budget" href="#link" destination="file" fileType="xlsx" fileSize="320 kB" />
          </div>
          <div
            class="message"
            style:background="var(--ggb-color-status-danger-surface)"
            style:color="var(--ggb-color-status-danger-content)"
          >
            Payment failed. <Link
              tone="inherit"
              label="Billing help"
              href="https://example.com"
              destination="external"
            />
          </div>
          <div class="message inverse">
            Report ready. <Link
              tone="inherit"
              label="Report"
              href="#link"
              destination="file"
              fileType="pdf"
              fileSize="1 MB"
            />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section id="badge" aria-labelledby="badge-title">
    <h2 id="badge-title">Badge: descenders</h2>
    <div class="variants">
      {#each badgeVariants as v (v.id)}
        <div class={`panel badge-${v.id}`} data-testid={`badge-${v.id}`}>
          <p class="panel-title">{v.title}</p>
          <p class="note">{v.note}</p>
          {#each ['sm', 'md', 'lg'] as size (size)}
            <div class="row badges">
              {#each intents as i (i)}
                <Badge intent={i} size={size as 'sm' | 'md' | 'lg'} label={words[i]} />
              {/each}
            </div>
          {/each}
          <div class="row badges">
            {#each intents as i (i)}
              <Badge intent={i} appearance="strong" label={words[i]} />
            {/each}
          </div>
          <div class="row badges">
            <Badge intent="success" label="Shipping today" leading={check} />
            <Badge intent="warning" appearance="strong" label="Pending payment" />
            <span class="cell"><Badge intent="info" label="Waiting for a reply" /></span>
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .variants {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(26rem, 1fr));
    gap: var(--ggb-space-layout-sm);
  }
  .page p.note {
    font: var(--ggb-typography-body-sm);
    color: var(--ggb-color-content-secondary);
    margin-block-end: var(--ggb-space-content-md);
  }
  .body-md {
    font: var(--ggb-typography-body-md);
  }
  .body-sm {
    font: var(--ggb-typography-body-sm);
  }
  .stack {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-sm) var(--ggb-space-content-lg);
    margin-block-end: var(--ggb-space-content-md);
  }
  .message {
    padding: var(--ggb-space-content-sm) var(--ggb-space-content-md);
    border-radius: var(--ggb-radius-container);
    margin-block-start: var(--ggb-space-content-sm);
    font: var(--ggb-typography-body-sm);
  }
  .inverse {
    background: var(--ggb-color-surface-inverse);
    color: var(--ggb-color-content-inverse);
  }
  .badges {
    margin-block-end: var(--ggb-space-content-sm);
    gap: var(--ggb-space-content-sm);
  }
  .cell {
    display: flex;
    inline-size: 7em;
  }

  /* Link variants (page-level overrides of the real component). */
  .link-b :global(.ggb-link__indicator),
  .link-c :global(.ggb-link[data-tone='inherit'] .ggb-link__indicator),
  .link-d :global(.ggb-link[data-tone='inherit'] .ggb-link__indicator) {
    opacity: var(--ggb-opacity-muted);
  }
  .link-c :global(.ggb-link[data-tone='accent'] .ggb-link__indicator),
  .link-d :global(.ggb-link[data-tone='accent'] .ggb-link__indicator) {
    fill: var(--ggb-color-content-tertiary);
  }
  .link-d :global(.ggb-link[data-tone='accent'] .ggb-link__meta) {
    color: var(--ggb-color-content-secondary);
  }

  /* Badge variants. */
  .badge-before :global(.ggb-badge__label) {
    overflow: hidden;
  }
  .badge-caps :global(.ggb-badge__label) {
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .badge-overline :global(.ggb-badge[data-size='sm']) {
    font: var(--ggb-typography-overline-sm);
    letter-spacing: var(--ggb-typography-overline-sm-letterSpacing);
  }
  .badge-overline :global(.ggb-badge:not([data-size='sm'])) {
    font: var(--ggb-typography-overline-md);
    letter-spacing: var(--ggb-typography-overline-md-letterSpacing);
  }
  .badge-overline :global(.ggb-badge__label) {
    text-transform: uppercase;
  }
</style>
