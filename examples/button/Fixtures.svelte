<script lang="ts" module>
  // Local fixtures standing in for the Icon, Counter and Shortcut components (wave 1, not built yet).
  // Icons are Phosphor Icons 2.1.1, regular weight (MIT, https://phosphoricons.com), the reference set:
  // 256-unit grid, filled paths in currentColor, drawing inset 32 units (1/8) from each side.
  export type FixtureIcon = 'plus' | 'arrow' | 'trash' | 'download' | 'check';
  export const iconPaths: Record<FixtureIcon, string> = {
    plus: 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
    arrow:
      'M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z',
    trash:
      'M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z',
    download:
      'M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z',
    check:
      'M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z'
  };
</script>

<script lang="ts">
  let { kind, value = '' }: { kind: 'icon' | 'counter' | 'shortcut'; value?: string } = $props();
</script>

{#if kind === 'icon'}
  <svg viewBox="0 0 256 256" fill="currentColor">
    <path d={iconPaths[value as FixtureIcon] ?? iconPaths.plus} />
  </svg>
{:else if kind === 'counter'}
  <span class="counter" data-testid="fixture-counter">{value}</span>
{:else}
  <kbd class="shortcut" data-testid="fixture-shortcut">{value}</kbd>
{/if}

<style>
  /* Fixture styling only: inherits the button content color, as Counter and Shortcut will. */
  .counter {
    display: inline-grid;
    place-items: center;
    min-inline-size: 1.5em;
    padding-inline: 0.4em;
    border-radius: var(--ggb-radius-full);
    box-shadow: inset 0 0 0 1px currentColor;
    font-size: 0.85em;
    line-height: 1.5;
    font-variant-numeric: tabular-nums;
  }
  .shortcut {
    font: inherit;
    font-size: 0.85em;
    letter-spacing: 0.02em;
  }
</style>
