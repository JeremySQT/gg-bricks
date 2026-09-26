<script lang="ts" module>
  // Local fixtures standing in for the Icon, Counter and Shortcut components (wave 1, not built yet).
  // Icons are simple 24px stroke drawings in currentColor; they are review fixtures, not shipped assets.
  export type FixtureIcon = 'plus' | 'arrow' | 'trash' | 'download' | 'check';
  export const iconPaths: Record<FixtureIcon, string> = {
    plus: 'M12 5v14M5 12h14',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
    check: 'M5 12.5l4.5 4.5L19 7.5'
  };
</script>

<script lang="ts">
  let { kind, value = '' }: { kind: 'icon' | 'counter' | 'shortcut'; value?: string } = $props();
</script>

{#if kind === 'icon'}
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
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
