<script lang="ts">
  import { Button } from '../../packages/svelte/src/index.js';
  import type { ButtonIntent, ButtonAppearance, ButtonSize } from '../../packages/svelte/src/index.js';
  let brand = $state('base'), theme = $state('light'), density = $state('standard');
  let loading = $state(false), disabled = $state(false), count = $state(3), activations = $state(0), submissions = $state(0);
  const intents: ButtonIntent[] = ['accent', 'neutral', 'danger'];
  const appearances: ButtonAppearance[] = ['solid', 'outline', 'ghost'];
  const sizes: ButtonSize[] = ['sm', 'md', 'lg'];
  const longLabel = 'Create a new item with a deliberately long action label';
</script>

{#snippet plus()}
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false"><path d="M10 3v14M3 10h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></svg>
{/snippet}
{#snippet counter()}<span class="counter">{count}</span>{/snippet}
{#snippet shortcut()}<kbd>⌘ K</kbd>{/snippet}

<div class="demo" data-ds-brand={brand} data-ds-appearance={theme} data-ds-density={density}>
  <main>
    <header>
      <p class="eyebrow">DESIGN SYSTEM / IMPLEMENTATION 01</p>
      <div class="heading"><h1>Button</h1><span class="version">Svelte + Bits UI</span></div>
      <p class="intro">One component. Shared tokens. Native behavior.<br />Explore the reference implementation across brands, themes and densities.</p>
    </header>
    <section class="controls" aria-label="Preview configuration">
      <label>Brand<select aria-label="Brand" bind:value={brand}><option value="base">Base</option><option value="brand-a">Brand A</option><option value="brand-b">Brand B</option></select></label>
      <label>Theme<select aria-label="Theme" bind:value={theme}><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <label>Density<select aria-label="Density" bind:value={density}><option value="compact">Compact</option><option value="standard">Standard</option><option value="comfortable">Comfortable</option></select></label>
    </section>

    <section aria-labelledby="variants-title">
      <div class="section-title"><h2 id="variants-title">Intent & appearance</h2><p>Content and icons inherit the same foreground.</p></div>
      <div class="matrix">
        <div class="matrix-row matrix-header"><span>INTENT</span>{#each appearances as appearance}<span>{appearance.toUpperCase()}</span>{/each}</div>
        {#each intents as intent}
          <div class="matrix-row"><strong>{intent}</strong>{#each appearances as appearance}<div><Button id={`matrix-${intent}-${appearance}`} {intent} {appearance} label="Button" leading={plus} trailing={shortcut} /></div>{/each}</div>
        {/each}
      </div>
    </section>

    <div class="columns">
      <section aria-labelledby="size-title"><h2 id="size-title">Sizes & targets</h2><p>The visible surface changes; the target stays at least 44 px.</p><div class="examples">{#each sizes as size}<div class="size-example"><Button id={`size-${size}`} {size} label="Button" leading={plus} /><small>{size}</small></div>{/each}</div></section>
      <section aria-labelledby="slots-title"><h2 id="slots-title">Composable content</h2><p>Icons, counters and shortcuts use inherited color.</p><div class="examples"><Button id="counter-button" label="Active filters" leading={plus} trailing={counter} onclick={() => count++} /><Button intent="neutral" appearance="outline" label="Command" trailing={shortcut} /></div></section>
    </div>

    <section aria-labelledby="behavior-title">
      <div class="section-title"><h2 id="behavior-title">Behavior playground</h2><p>Try mouse, keyboard, loading and disabled together.</p></div>
      <div class="toggles"><label><input type="checkbox" bind:checked={loading} /> Loading</label><label><input type="checkbox" bind:checked={disabled} /> Disabled</label></div>
      <div class="examples">
        <Button id="play-action" label="Save changes" {loading} {disabled} leading={plus} trailing={counter} onclick={() => activations++} />
        <Button id="play-navigation" label="New item" href="#new-item" {loading} {disabled} appearance="outline" />
        <output aria-live="polite" data-testid="activations">Activations: {activations}</output>
      </div>
      <p class="note">Loading preserves dimensions and focus. Activation is blocked until loading ends.</p>
    </section>

    <div class="columns">
      <section aria-labelledby="constraint-title"><h2 id="constraint-title">Constrained width</h2><p>A single line with ellipsis. The full accessible name remains available.</p><div class="constraint"><Button id="truncated" label={longLabel} leading={plus} trailing={shortcut} /></div></section>
      <section aria-labelledby="form-title"><h2 id="form-title">Native form semantics</h2><form onsubmit={(event) => { event.preventDefault(); submissions++; }}><label class="field-label">Item name<input aria-label="Item name" name="name" required value="Reference item" /></label><div class="examples"><Button id="submit" label="Create item" type="submit" {loading} {disabled} /><Button id="ordinary" label="Ordinary action" intent="neutral" appearance="ghost" /><output data-testid="submissions">Submissions: {submissions}</output></div></form></section>
    </div>
    <footer id="new-item"><strong>Reference implementation</strong><p>Tokens and component contract stay platform-independent. Figma-only context aliases are not shipped here.</p></footer>
  </main>
</div>

<style>
  :global(body) { margin: 0; font-family: Inter, sans-serif; }
  :global(*) { box-sizing: border-box; }
  .demo { min-height: 100vh; background: var(--color-surface-canvas); color: var(--color-content-primary); }
  main { max-width: 1120px; margin: auto; padding: 64px 40px; }
  header { padding-bottom: 32px; }
  .eyebrow { font-size: 11px; letter-spacing: .13em; font-weight: 600; color: var(--color-content-secondary); }
  .heading { display: flex; align-items: center; gap: 20px; }
  h1 { font-size: 56px; line-height: 1.1; letter-spacing: -.045em; margin: 16px 0; }
  .version { border: 1px solid var(--color-action-neutral-outline-default-border); border-radius: 6px; padding: 6px 9px; font-size: 12px; }
  .intro { font-size: 16px; line-height: 1.65; }
  p { color: var(--color-content-secondary); font-size: 13px; line-height: 1.6; }
  .controls { display: flex; gap: 24px; background: var(--color-surface-subtle); padding: 20px; border-radius: 8px; margin-bottom: 40px; }
  label { display: flex; gap: 8px; font-size: 13px; align-items: center; }
  .controls label { flex: 1; flex-direction: column; align-items: stretch; }
  select, input:not([type=checkbox]) { font: inherit; color: inherit; background: var(--color-surface-canvas); border: 1px solid var(--color-action-neutral-outline-default-border); border-radius: 5px; padding: 10px 12px; min-height: 44px; }
  section { margin-bottom: 36px; }
  h2 { font-size: 18px; letter-spacing: -.015em; margin: 0 0 8px; }
  .section-title { margin-bottom: 20px; }
  .section-title p { margin-top: 6px; }
  .matrix { border-top: 1px solid var(--color-action-neutral-outline-default-border); }
  .matrix-row { display: grid; grid-template-columns: 100px repeat(3, 1fr); align-items: center; gap: 20px; min-height: 76px; border-bottom: 1px solid var(--color-action-neutral-outline-default-border); }
  .matrix-row strong { font-size: 13px; font-weight: 600; text-transform: capitalize; }
  .matrix-header { min-height: 44px; font-size: 10px; letter-spacing: .08em; color: var(--color-content-secondary); }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .examples { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
  .size-example { display: grid; justify-items: center; gap: 10px; }
  small { color: var(--color-content-secondary); }
  .toggles { display: flex; gap: 24px; margin: 20px 0; }
  .toggles label { min-height: 44px; cursor: pointer; }
  .note { font-size: 12px; }
  output { font-size: 12px; color: var(--color-content-secondary); }
  .constraint { width: 230px; max-width: 100%; }
  .field-label { display: grid; margin: 16px 0; }
  footer { border-top: 1px solid var(--color-action-neutral-outline-default-border); padding-top: 28px; font-size: 12px; }
  :global(.ds-button__slot kbd), .counter { font-family: inherit; font-size: 12px; font-weight: 600; line-height: 1; color: inherit; }
  @media (max-width: 700px) {
    main { padding: 28px 18px; }
    h1 { font-size: 42px; }
    .heading { flex-wrap: wrap; gap: 8px; }
    .controls { flex-wrap: wrap; gap: 12px; }
    .controls label { flex: 1 1 120px; }
    .columns { grid-template-columns: 1fr; gap: 0; }
    .matrix-row { grid-template-columns: 60px repeat(3, minmax(0, 1fr)); gap: 8px; }
    .matrix-row :global(.ds-button__slot) { display: none; }
  }
</style>
