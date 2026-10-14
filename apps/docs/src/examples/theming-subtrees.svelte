<script lang="ts">
  import { Button } from '@ggbrick/svelte';
</script>

{#snippet buttons()}
  <Button label="Save" />
  <Button label="Cancel" intent="neutral" appearance="outline" />
{/snippet}

<!-- Inherits the context of the page. -->
<section class="panel">
  <p>Page context</p>
  {@render buttons()}
</section>

<!-- Density alone: a dense toolbar inside the same page. -->
<section class="panel" data-ggb-density="compact">
  <p>Compact density</p>
  {@render buttons()}
</section>

<!-- Appearance alone: a dark panel. -->
<section class="panel" data-ggb-appearance="dark">
  <p>Dark appearance</p>
  {@render buttons()}
</section>

<!-- Appearance alone: a light panel. -->
<section class="panel" data-ggb-appearance="light">
  <p>Light appearance</p>
  {@render buttons()}
</section>

<!-- A brand switch restates appearance and density on the same element. -->
<section class="panel" data-ggb-brand="orchid" data-ggb-appearance="light" data-ggb-density="comfortable">
  <p>Orchid, light, comfortable</p>
  {@render buttons()}
</section>

<style>
  .panel {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ggb-space-content-sm);
    padding: var(--ggb-space-layout-sm);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
  }
  p {
    flex-basis: 100%;
    margin: 0;
    color: var(--ggb-color-content-secondary);
    font: var(--ggb-typography-caption-md);
  }
</style>
