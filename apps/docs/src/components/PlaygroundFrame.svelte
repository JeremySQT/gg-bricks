<script lang="ts">
  // The playground card that opens a component page: the component centered on the default surface, the key
  // options as selects in the four corners. Each corner receives a list of controls.
  import type { Snippet } from 'svelte';

  export interface Control {
    label: string;
    options: readonly string[];
    value: string;
    onchange: (value: string) => void;
  }

  interface Props {
    corners: { topStart?: Control[]; topEnd?: Control[]; bottomStart?: Control[]; bottomEnd?: Control[] };
    children: Snippet;
  }
  let { corners, children }: Props = $props();
  const positions = ['topStart', 'topEnd', 'bottomStart', 'bottomEnd'] as const;
  const id = $props.id();
</script>

<section class="ggb-docs-playground not-content" aria-label="Playground">
  {#each positions as position (position)}
    {#if corners[position]?.length}
      <div class="corner {position}">
        {#each corners[position] ?? [] as control, i (control.label)}
          <label>
            <span>{control.label}</span>
            <select
              id="{id}-{position}-{i}"
              value={control.value}
              onchange={(e) => control.onchange((e.currentTarget as HTMLSelectElement).value)}
            >
              {#each control.options as option (option)}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>
        {/each}
      </div>
    {/if}
  {/each}
  <div class="stage">
    {@render children()}
  </div>
</section>

<style>
  .ggb-docs-playground {
    display: grid;
    grid-template-areas:
      'top-start . top-end'
      'stage stage stage'
      'bottom-start . bottom-end';
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto minmax(10rem, 1fr) auto;
    gap: var(--ggb-space-content-md);
    margin-block: 1.5rem 2rem;
    padding: var(--ggb-space-layout-sm);
    border: var(--ggb-border-width-default) solid var(--ggb-color-border-subtle);
    border-radius: var(--ggb-radius-container);
    background: var(--ggb-color-surface-default);
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
  }
  .stage {
    grid-area: stage;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: var(--ggb-space-content-md);
    padding: var(--ggb-space-layout-md);
  }
  .corner {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ggb-space-content-sm);
  }
  .topStart {
    grid-area: top-start;
  }
  .topEnd {
    grid-area: top-end;
    justify-content: end;
  }
  .bottomStart {
    grid-area: bottom-start;
  }
  .bottomEnd {
    grid-area: bottom-end;
    justify-content: end;
  }
  label {
    display: grid;
    gap: 0.125rem;
    color: var(--ggb-color-content-secondary);
    font: var(--ggb-typography-caption-md);
  }
  select {
    min-block-size: var(--ggb-size-control-sm);
    padding-inline: var(--ggb-space-control-padding-inline-sm);
    border: var(--ggb-border-width-default) solid var(--ggb-color-field-default-border);
    border-radius: var(--ggb-radius-control);
    background: var(--ggb-color-field-default-surface);
    color: var(--ggb-color-field-default-content);
    font: var(--ggb-typography-label-sm);
  }
  select:focus-visible {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
  @media (max-width: 40rem) {
    .ggb-docs-playground {
      grid-template-areas: 'top-start' 'top-end' 'stage' 'bottom-start' 'bottom-end';
      grid-template-columns: 1fr;
    }
    .topEnd,
    .bottomEnd {
      justify-content: start;
    }
  }
</style>
