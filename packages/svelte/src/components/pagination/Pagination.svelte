<script lang="ts">
  import { setContext, tick } from 'svelte';
  import IconButton from '../icon-button/IconButton.svelte';
  import { entries } from './pages.js';
  import type { PaginationProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './pagination.css';

  let {
    page = $bindable(defaults.page),
    pageCount = defaults.pageCount,
    siblingCount = defaults.siblingCount,
    href,
    showEdges = defaults.showEdges,
    size = defaults.size,
    label = defaults.label,
    previousLabel = defaults.previousLabel,
    nextLabel = defaults.nextLabel,
    firstLabel = defaults.firstLabel,
    lastLabel = defaults.lastLabel,
    onpagechange,
    ref = $bindable(null),
    class: className,
    ...rest
  }: PaginationProps = $props();

  // The pagination's own buttons are not sized by a ButtonGroup or Toolbar around it.
  setContext('ggb:button-group', undefined);

  const count = $derived(Math.max(1, Math.floor(Number(pageCount) || 1)));
  const current = $derived(Math.min(count, Math.max(1, Math.floor(Number(page) || 1))));
  const siblings = $derived(Math.max(0, Math.floor(Number(siblingCount) || 0)));
  const items = $derived(entries(current, count, siblings));
  const link = (n: number) => (href === undefined ? undefined : href.replaceAll('{page}', String(n)));

  async function go(target: number, control: HTMLElement | null) {
    if (target < 1 || target > count || target === current) return;
    page = target;
    onpagechange?.(target);
    // Focus stays on the activated control when it remains usable; otherwise it moves to the new current page.
    await tick();
    if (!control || !control.isConnected || control.matches(':disabled, [aria-disabled="true"]'))
      ref?.querySelector<HTMLElement>('.ggb-pagination__item[aria-current="page"]')?.focus();
  }

  const caret = {
    // Phosphor Icons 2.1.1 (MIT), caret-left, caret-right, caret-double-left and caret-double-right, regular weight;
    // mirrored in right-to-left text.
    first:
      'M205.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L131.31,128ZM51.31,128l74.35-74.34a8,8,0,0,0-11.32-11.32l-80,80a8,8,0,0,0,0,11.32l80,80a8,8,0,0,0,11.32-11.32Z',
    last: 'M141.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L124.69,128,50.34,53.66A8,8,0,0,1,61.66,42.34l80,80A8,8,0,0,1,141.66,133.66Zm80-11.32-80-80a8,8,0,0,0-11.32,11.32L204.69,128l-74.35,74.34a8,8,0,0,0,11.32,11.32l80-80A8,8,0,0,0,221.66,122.34Z',
    start: 'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
    end: 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z'
  };
</script>

{#snippet chevron(d: string)}
  <svg class="ggb-pagination__chevron" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path {d} /></svg
  >
{/snippet}

{#snippet edge(direction: 'first' | 'last')}
  {@const target = direction === 'first' ? 1 : count}
  <li class="ggb-pagination__control">
    <IconButton
      label={direction === 'first' ? firstLabel : lastLabel}
      {size}
      intent="neutral"
      appearance="ghost"
      disabled={current === target}
      href={current !== target ? link(target) : undefined}
      data-direction={direction}
      onactivate={(event) => go(target, event.currentTarget as HTMLElement)}
    >
      {#snippet icon()}{@render chevron(caret[direction])}{/snippet}
    </IconButton>
  </li>
{/snippet}

<nav {...rest} bind:this={ref} class={['ggb-pagination', className]} aria-label={label} data-size={size}>
  <ul class="ggb-pagination__list">
    {#if showEdges}{@render edge('first')}{/if}
    <li class="ggb-pagination__control">
      <IconButton
        label={previousLabel}
        {size}
        intent="neutral"
        appearance="ghost"
        disabled={current <= 1}
        href={current > 1 ? link(current - 1) : undefined}
        data-direction="previous"
        onactivate={(event) => go(current - 1, event.currentTarget as HTMLElement)}
      >
        {#snippet icon()}{@render chevron(caret.start)}{/snippet}
      </IconButton>
    </li>
    {#each items as entry (entry.kind === 'page' ? `p${entry.page}` : `e${entry.key}`)}
      <li class="ggb-pagination__entry">
        {#if entry.kind === 'ellipsis'}
          <span class="ggb-pagination__ellipsis" aria-hidden="true">…</span>
        {:else if link(entry.page) !== undefined}
          <a
            class="ggb-pagination__item"
            href={link(entry.page)}
            aria-current={entry.page === current ? 'page' : undefined}
            data-page={entry.page}
            onclick={(event) => go(entry.page, event.currentTarget)}>{entry.page}</a
          >
        {:else}
          <button
            type="button"
            class="ggb-pagination__item"
            aria-current={entry.page === current ? 'page' : undefined}
            data-page={entry.page}
            onclick={(event) => go(entry.page, event.currentTarget)}>{entry.page}</button
          >
        {/if}
      </li>
    {/each}
    <li class="ggb-pagination__control">
      <IconButton
        label={nextLabel}
        {size}
        intent="neutral"
        appearance="ghost"
        disabled={current >= count}
        href={current < count ? link(current + 1) : undefined}
        data-direction="next"
        onactivate={(event) => go(current + 1, event.currentTarget as HTMLElement)}
      >
        {#snippet icon()}{@render chevron(caret.end)}{/snippet}
      </IconButton>
    </li>
    {#if showEdges}{@render edge('last')}{/if}
  </ul>
</nav>
