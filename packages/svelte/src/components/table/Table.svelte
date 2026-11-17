<script lang="ts">
  import type { TableProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './table.css';

  let {
    caption,
    hideCaption = defaults.hideCaption,
    columnLines = defaults.columnLines,
    children,
    ref = $bindable(null),
    class: className,
    ...rest
  }: TableProps = $props();

  // Fail identically on the server and in the browser rather than render an unnamed table.
  const name = $derived.by(() => {
    if (typeof caption !== 'string' || !caption.trim()) throw new Error('Table requires a non-empty caption.');
    return caption.trim();
  });

  // The scroll area is a stop in sequential focus, named by the caption, only while the table overflows it.
  let container = $state<HTMLDivElement | null>(null);
  let scrollable = $state(false);
  $effect(() => {
    const element = container;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const check = () => {
      scrollable = element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1;
    };
    const observer = new ResizeObserver(check);
    observer.observe(element);
    const table = element.firstElementChild;
    if (table) observer.observe(table);
    check();
    return () => observer.disconnect();
  });
</script>

<div
  {...rest}
  bind:this={ref}
  class={['ggb-table', className]}
  data-column-lines={columnLines ? '' : undefined}
  data-scrollable={scrollable ? '' : undefined}
>
  <!-- The visible caption repeats the native caption, which names the table; it is hidden from assistive technology. -->
  {#if !hideCaption}<div class="ggb-table__caption" aria-hidden="true">{name}</div>{/if}
  <div class="ggb-table__frame">
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div
      bind:this={container}
      class="ggb-table__container"
      role={scrollable ? 'region' : undefined}
      aria-label={scrollable ? name : undefined}
      tabindex={scrollable ? 0 : undefined}
    >
      <table class="ggb-table__table">
        <caption class="ggb-table__hidden">{name}</caption>
        {@render children()}
      </table>
    </div>
  </div>
</div>
