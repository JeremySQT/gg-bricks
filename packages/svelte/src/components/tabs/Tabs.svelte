<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { Tabs as Primitive } from 'bits-ui';
  import IconButton from '../icon-button/IconButton.svelte';
  import type { TabsContext, TabsProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './tabs.css';

  let {
    value = $bindable(defaults.value),
    label,
    appearance = defaults.appearance,
    size = defaults.size,
    orientation = defaults.orientation,
    activation = defaults.activation,
    list,
    children,
    onvaluechange,
    id,
    ref = $bindable(null),
    class: className,
    ...rest
  }: TabsProps = $props();

  const uid = $props.id();
  const base = $derived(id ?? uid);
  const name = $derived(typeof label === 'string' && label.trim() ? label : undefined);

  // Bits UI Tabs owns the roles, ids, roving focus (arrows reversed in right-to-left text, disabled tabs skipped,
  // wrapping) and the activation modes. ggbrick adds the contract's fallback: there is always exactly one selected
  // tab, the first enabled one when value names no enabled tab. Triggers register in source order (also during server
  // rendering); before mounting a value not registered yet is trusted, since later triggers register after the earlier
  // ones render.
  const registry = new SvelteMap<string, () => boolean>();
  let mounted = $state(false);
  onMount(() => {
    mounted = true;
  });
  // A function, not $derived: during server rendering a derived value is computed once, before the later triggers
  // register; in the browser the reads of the registry and of value are tracked wherever it is called.
  const current = () => {
    const entries = [...registry];
    const match = entries.find(([v, disabled]) => v === value && !disabled());
    if (match) return match[0];
    if (!mounted && value) return value;
    return entries.find(([, disabled]) => !disabled())?.[0] ?? value;
  };

  function select(v: string) {
    if (v === current()) return;
    value = v;
    onvaluechange?.(v);
  }

  const slug = (v: string) => encodeURIComponent(v).replace(/%/g, '_');
  setContext<TabsContext>('ggb:tabs', {
    get selected() {
      return current();
    },
    get size() {
      return size;
    },
    get orientation() {
      return orientation;
    },
    register(v, disabled) {
      registry.set(v, disabled);
      return () => registry.delete(v);
    },
    select: (v) => select(v),
    tabId: (v) => `${base}-tab-${slug(v)}`,
    panelId: (v) => `${base}-panel-${slug(v)}`
  });

  // Overflow of a horizontal list: the list scrolls without a scrollbar; each edge with hidden tabs fades and shows a
  // scroll button. The selected tab stays visible: the list scrolls, never the page.
  let listElement = $state<HTMLElement | null>(null);
  let overflowStart = $state(false);
  let overflowEnd = $state(false);
  const measure = () => {
    const list = listElement;
    if (!list || orientation !== 'horizontal') {
      overflowStart = overflowEnd = false;
      return;
    }
    const scrolled = Math.abs(list.scrollLeft);
    overflowStart = scrolled > 1;
    overflowEnd = scrolled + list.clientWidth < list.scrollWidth - 1;
  };
  $effect(() => {
    const list = listElement;
    void orientation;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const child of list.children) observer.observe(child);
    list.addEventListener('scroll', measure, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      list.removeEventListener('scroll', measure);
    };
  });
  $effect(() => {
    const list = listElement;
    const shown = current();
    if (!list || orientation !== 'horizontal') return;
    const tab = [...list.querySelectorAll<HTMLElement>('.ggb-tabs__trigger')].find((t) => t.dataset.value === shown);
    if (!tab) return;
    // Measured on screen so that right-to-left text (negative scroll positions) needs no special case.
    // The tab clears the fade and the scroll button of the edge (its scroll margin, the fade size).
    const box = list.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    const margin = parseFloat(getComputedStyle(tab).scrollMarginInlineStart) || 0;
    if (t.left - margin < box.left) list.scrollLeft += t.left - margin - box.left;
    else if (t.right + margin > box.right) list.scrollLeft += t.right + margin - box.right;
  });
  function scrollTowards(edge: 'start' | 'end') {
    const list = listElement;
    if (!list) return;
    const rtl = getComputedStyle(list).direction === 'rtl';
    const forward = (edge === 'end') !== rtl;
    list.scrollBy({ left: (forward ? 1 : -1) * list.clientWidth * 0.8, behavior: 'smooth' });
  }

  const caret = {
    // Phosphor Icons 2.1.1 (MIT), caret-left and caret-right, regular weight; mirrored in right-to-left text.
    start: 'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
    end: 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z'
  };
</script>

{#snippet scrollButton(edge: 'start' | 'end')}
  <span class={`ggb-tabs__scroll ggb-tabs__scroll--${edge}`}>
    <IconButton
      label={edge === 'start' ? 'Scroll tabs back' : 'Scroll tabs forward'}
      {size}
      intent="neutral"
      appearance="ghost"
      tabindex={-1}
      aria-hidden="true"
      onactivate={() => scrollTowards(edge)}
    >
      {#snippet icon()}
        <svg
          class="ggb-tabs__scroll-icon"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"><path d={caret[edge]} /></svg
        >
      {/snippet}
    </IconButton>
  </span>
{/snippet}

<Primitive.Root
  {...rest}
  bind:ref
  id={base}
  class={['ggb-tabs', className]}
  value={current()}
  onValueChange={select}
  {orientation}
  activationMode={activation}
  loop
  data-appearance={appearance}
  data-size={size}
  data-activation={activation}
>
  <div
    class="ggb-tabs__bar"
    data-overflow-start={overflowStart ? '' : undefined}
    data-overflow-end={overflowEnd ? '' : undefined}
  >
    <Primitive.List bind:ref={listElement} class="ggb-tabs__list" aria-label={name}>
      {@render list()}
    </Primitive.List>
    {#if overflowStart}{@render scrollButton('start')}{/if}
    {#if overflowEnd}{@render scrollButton('end')}{/if}
  </div>
  <div class="ggb-tabs__panels">
    {@render children()}
  </div>
</Primitive.Root>
