<script lang="ts">
  // Counter review lab (temporary, removed after the decision): vertical centering of the digits, current
  // versus cap-height trimmed, zoomed with a centre line; and the border opacity at 70 (current), 80, 85, 90
  // and 100 %, alone and inside Buttons, in light and dark.
  import { Button, Counter } from '../../packages/svelte/src/index.ts';
  import type { CounterSize } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const densities = ['compact', 'standard', 'comfortable'];
  const sizes: CounterSize[] = ['sm', 'md', 'lg'];
  const values = [8, 42, 100];
  const opacities = [
    { id: 'o70', pct: 70, title: '70 % (actuel)' },
    { id: 'o80', pct: 80, title: '80 %' },
    { id: 'o85', pct: 85, title: '85 %' },
    { id: 'o90', pct: 90, title: '90 %' },
    { id: 'o100', pct: 100, title: '100 %' }
  ];
  let brand = $state('base');
  let density = $state('standard');
  let zoom = $state(4);
</script>

{#snippet counterMd()}<Counter value={8} size="md" />{/snippet}
{#snippet counterSm()}<Counter value={8} size="sm" />{/snippet}
{#snippet counterLg()}<Counter value={42} size="lg" />{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance="light" data-ggb-density={density}>
  <header class="hero">
    <p class="eyebrow">ggbrick · lab</p>
    <h1>Counter : centrage et contour</h1>
    <p class="lede">
      Deux réglages à trancher. Le centrage vertical des chiffres (actuel contre corrigé) et l'opacité du contour. Les
      compteurs sont le vrai composant ; seules les règles de laboratoire changent.
    </p>
    <div class="controls" role="group" aria-label="Context">
      <label
        >Brand <select bind:value={brand}
          >{#each brands as b (b)}<option value={b}>{b}</option>{/each}</select
        ></label
      >
      <label
        >Density <select bind:value={density}
          >{#each densities as d (d)}<option value={d}>{d}</option>{/each}</select
        ></label
      >
      <label
        >Zoom <select bind:value={zoom}
          ><option value={2}>×2</option><option value={4}>×4</option><option value={6}>×6</option></select
        ></label
      >
    </div>
  </header>

  <section class="block">
    <h2>1. Centrage vertical des chiffres</h2>
    <p>
      Mesure dans Chromium avec Inter : l'encre des chiffres est 0,7 à 0,9 px trop haute dans la boîte (taille md : 3,25
      px au-dessus, 4,8 px au-dessous). La correction coupe la boîte du texte à la hauteur des capitales (<code
        >text-box: trim-both cap alphabetic</code
      >, comme le label du Button) et redonne la hauteur de la ligne par un padding vertical symétrique, donc la boîte
      garde la même hauteur pour un et deux chiffres. La ligne rouge marque le milieu de la boîte.
    </p>
    <div class="columns two">
      {#each [['Actuel', 'current'], ['Corrigé (cap trim)', 'fix']] as [title, cls] (cls)}
        <div class={`column ${cls}`}>
          <p class="panel-title">{title}</p>
          <div class="zoomed" style:zoom>
            {#each sizes as s (s)}
              <div class="zrow">
                {#each values as v (v)}
                  <span class="guide"><Counter value={v} size={s} /></span>
                {/each}
              </div>
            {/each}
          </div>
          <p class="panel-title">Taille réelle</p>
          <div class="real">
            {#each sizes as s (s)}
              <span class="inline">Inbox <Counter value={8} size={s} /> <Counter value={42} size={s} /></span>
            {/each}
            <Button label="Inbox" intent="neutral" appearance="outline" trailing={counterMd} />
            <Button label="Inbox" size="sm" trailing={counterSm} />
            <Button label="Alerts" size="lg" intent="neutral" appearance="ghost" trailing={counterLg} />
          </div>
        </div>
      {/each}
    </div>
  </section>

  {#each ['light', 'dark'] as mode (mode)}
    <section class="block mode" data-ggb-appearance={mode}>
      <h2>2. Opacité du contour · {mode}</h2>
      <div class="columns five">
        {#each opacities as o (o.id)}
          <div class={`column fix ${o.id}`}>
            <p class="panel-title">{o.title}</p>
            <div class="real">
              {#each sizes as s (s)}
                <span class="inline"
                  >Inbox <Counter value={8} size={s} />
                  <Counter value={42} size={s} />
                  <Counter value={120} size={s} /></span
                >
              {/each}
              <Button label="Inbox" intent="neutral" appearance="outline" trailing={counterMd} />
              <Button label="Inbox" intent="neutral" appearance="ghost" trailing={counterMd} />
              <Button label="Inbox" intent="accent" trailing={counterMd} />
              <Button label="Inbox" intent="neutral" trailing={counterMd} />
              <div class="zoomed small" style:zoom={2}>
                <span class="guide"><Counter value={8} size="md" /></span><span class="guide"
                  ><Counter value={42} size="md" /></span
                >
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  :global(body) {
    margin: 0;
  }
  :global(*) {
    box-sizing: border-box;
  }
  .page {
    min-height: 100vh;
    padding: var(--ggb-space-layout-xl) var(--ggb-space-layout-lg);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
  }
  header,
  section {
    max-width: 1500px;
    margin: 0 auto var(--ggb-space-layout-lg);
  }
  h1 {
    font: var(--ggb-typography-display-sm);
    margin: var(--ggb-space-content-sm) 0;
  }
  h2 {
    font: var(--ggb-typography-heading-md);
    margin: 0 0 var(--ggb-space-content-md);
  }
  p {
    color: var(--ggb-color-content-secondary);
    margin: 0 0 var(--ggb-space-content-md);
    max-width: 80ch;
  }
  code {
    font: var(--ggb-typography-code-sm);
  }
  .eyebrow,
  .panel-title {
    font: var(--ggb-typography-label-sm);
    letter-spacing: var(--ggb-typography-label-sm-letterSpacing);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
    margin: 0 0 var(--ggb-space-content-xs);
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-subtle);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .controls label {
    display: flex;
    gap: var(--ggb-space-content-sm);
    align-items: center;
    font: var(--ggb-typography-label-md);
  }
  select {
    font: inherit;
    color: var(--ggb-color-field-default-content);
    background: var(--ggb-color-field-default-surface);
    border: var(--ggb-border-width-default) solid var(--ggb-color-field-default-border);
    border-radius: var(--ggb-radius-control);
    min-height: var(--ggb-size-control-md);
  }
  .block {
    padding: var(--ggb-space-layout-md);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .columns {
    display: grid;
    gap: var(--ggb-space-layout-sm);
  }
  .columns.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .columns.five {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  .column {
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .zoomed {
    display: grid;
    gap: 6px;
    margin-block-end: var(--ggb-space-content-lg);
    width: max-content;
  }
  .zoomed.small {
    display: flex;
    gap: 8px;
    margin-block-end: 0;
  }
  .zrow {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  /* Centre guide: a 0.25 px red line through the middle of the counter box. */
  .guide {
    position: relative;
    display: inline-flex;
  }
  .guide::after {
    content: '';
    position: absolute;
    inset: 50% -3px auto -3px;
    border-top: 0.25px solid #e5002b;
    pointer-events: none;
  }
  .real {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-md);
    align-items: center;
  }
  .inline {
    display: inline-flex;
    gap: var(--ggb-space-content-xs);
    align-items: center;
  }
  /* Lab rule: cap-height centering (the candidate fix). */
  .fix :global(.ggb-counter__value) {
    text-box: trim-both cap alphabetic;
  }
  .fix :global(.ggb-counter) {
    padding-block: calc((1lh - 1cap) / 2);
  }
  /* Lab rule: border opacity candidates (the role opacity.muted gives 0.7 today). */
  .o80 :global(.ggb-counter) {
    --ggb-counter-borderOpacity: 0.8;
  }
  .o85 :global(.ggb-counter) {
    --ggb-counter-borderOpacity: 0.85;
  }
  .o90 :global(.ggb-counter) {
    --ggb-counter-borderOpacity: 0.9;
  }
  .o100 :global(.ggb-counter) {
    --ggb-counter-borderOpacity: 1;
  }
  @media (max-width: 1100px) {
    .columns.five,
    .columns.two {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
