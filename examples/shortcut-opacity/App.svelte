<script lang="ts">
  // Shortcut attenuation lab (temporary, removed after the decision): the plain shortcut beside a label at
  // 100 %, 85 % and 70 % opacity, and at regular weight, inside every Button intent × appearance and in a menu,
  // in light and dark, for the three brands.
  import { Button, Shortcut } from '../../packages/svelte/src/index.ts';
  import type { ButtonAppearance, ButtonIntent } from '../../packages/svelte/src/index.ts';

  const brands = ['base', 'brick', 'orchid'];
  const densities = ['compact', 'standard', 'comfortable'];
  const intents: ButtonIntent[] = ['accent', 'neutral', 'danger'];
  const appearances: ButtonAppearance[] = ['solid', 'outline', 'ghost'];
  const variants = [
    { id: 'o100', title: '100 % (actuel)', note: 'Aucune atténuation.' },
    { id: 'o85', title: '85 %', note: '30 combinaisons sur 198 sous 4.5:1 (pire 4.28).' },
    { id: 'o70', title: '70 %', note: '81 combinaisons sur 198 sous 4.5:1 (pire 3.27).' },
    { id: 'w400', title: 'Graisse 400', note: 'Regular au lieu de medium, 100 % : aucune perte de contraste.' }
  ];
  const labels: Record<string, string> = { accent: 'Save', neutral: 'Cancel', danger: 'Delete' };
  let brand = $state('base');
  let density = $state('standard');
  let platform = $state<'mac' | 'other'>('mac');
</script>

{#snippet hintAccent()}<Shortcut keys="Mod+S" {platform} />{/snippet}
{#snippet hintNeutral()}<Shortcut keys="Escape" {platform} />{/snippet}
{#snippet hintDanger()}<Shortcut keys="Mod+Backspace" {platform} />{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance="light" data-ggb-density={density}>
  <header class="hero">
    <p class="eyebrow">ggbrick · lab</p>
    <h1>Shortcut beside a label</h1>
    <p class="lede">
      Quatre traitements du raccourci dans les boutons et dans un menu. Les boutons sont réels : survolez, pressez.
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
        >Platform <select bind:value={platform}
          ><option value="mac">mac</option><option value="other">other</option></select
        ></label
      >
    </div>
  </header>

  {#each ['light', 'dark'] as mode (mode)}
    <section class="mode" data-ggb-appearance={mode}>
      <h2>{mode}</h2>
      <div class="columns">
        {#each variants as v (v.id)}
          <div class={`column ${v.id}`}>
            <p class="panel-title">{v.title}</p>
            <p class="note">{v.note}</p>
            <div class="buttons">
              {#each appearances as a (a)}
                <div class="row">
                  {#each intents as i (i)}
                    <Button
                      label={labels[i]}
                      intent={i}
                      appearance={a}
                      trailing={i === 'accent' ? hintAccent : i === 'neutral' ? hintNeutral : hintDanger}
                    />
                  {/each}
                </div>
              {/each}
            </div>
            <ul class="menu">
              {#each [['Undo', 'Mod+Z'], ['Redo', 'Mod+Shift+Z'], ['Find in file', 'Mod+F'], ['Command palette', 'Mod+Shift+P']] as [text, k] (text)}
                <li><span>{text}</span><Shortcut keys={k} {platform} /></li>
              {/each}
            </ul>
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
    max-width: 1400px;
    margin: 0 auto var(--ggb-space-layout-lg);
  }
  h1 {
    font: var(--ggb-typography-display-sm);
    margin: var(--ggb-space-content-sm) 0;
  }
  h2 {
    font: var(--ggb-typography-heading-md);
    margin: 0 0 var(--ggb-space-content-md);
    text-transform: capitalize;
  }
  p {
    color: var(--ggb-color-content-secondary);
    margin: 0 0 var(--ggb-space-content-md);
  }
  .eyebrow,
  .panel-title {
    font: var(--ggb-typography-label-sm);
    letter-spacing: var(--ggb-typography-label-sm-letterSpacing);
    text-transform: uppercase;
    color: var(--ggb-color-content-tertiary);
    margin: 0 0 var(--ggb-space-content-xs);
  }
  .note {
    font: var(--ggb-typography-caption-md);
    min-block-size: 2.4em;
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
  .mode {
    padding: var(--ggb-space-layout-md);
    background: var(--ggb-color-surface-canvas);
    color: var(--ggb-color-content-primary);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .columns {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--ggb-space-layout-sm);
  }
  .column {
    padding: var(--ggb-space-content-lg);
    background: var(--ggb-color-surface-default);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
  }
  .buttons {
    display: grid;
    gap: var(--ggb-space-content-sm);
    margin-block-end: var(--ggb-space-content-lg);
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-sm);
  }
  .menu {
    list-style: none;
    margin: 0;
    padding: var(--ggb-space-content-xs);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-default);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-raised);
    box-shadow: var(--ggb-shadow-raised);
    font: var(--ggb-typography-label-md);
  }
  .menu li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--ggb-space-content-lg);
    padding: var(--ggb-space-content-xs) var(--ggb-space-content-sm);
    border-radius: var(--ggb-radius-control);
  }
  .menu li:hover {
    background: var(--ggb-color-surface-muted);
  }
  .o85 :global(.ggb-shortcut) {
    opacity: 0.85;
  }
  .o70 :global(.ggb-shortcut) {
    opacity: 0.7;
  }
  .w400 :global(.ggb-shortcut) {
    font-weight: 400;
  }
  @media (max-width: 1100px) {
    .columns {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
