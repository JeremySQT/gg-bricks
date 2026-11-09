<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { rovingFocus } from '../../lib/roving-focus/index.js';
  import type { TabsContext, TabsProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './tabs.css';

  let {
    value = $bindable(defaults.value),
    label,
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

  // Triggers register in source order (also during server rendering), so that the selected tab can fall back to the
  // first enabled one when value names no enabled tab (the contract: there is always exactly one selected tab).
  const registry = new SvelteMap<string, () => boolean>();
  // Before mounting (server rendering and hydration) a value not registered yet is trusted, since later triggers
  // register after the earlier ones render; the fallback applies to an empty value at once and to any other value
  // once every trigger is known.
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

  // The selected tab stays visible in a list that scrolls inline: the list scrolls, never the page.
  let listElement = $state<HTMLDivElement | null>(null);
  $effect(() => {
    const list = listElement;
    const shown = current();
    if (!list || orientation !== 'horizontal') return;
    const tab = [...list.querySelectorAll<HTMLElement>('.ggb-tabs__trigger')].find((t) => t.dataset.value === shown);
    if (!tab) return;
    // Measured on screen so that right-to-left text (negative scroll positions) needs no special case.
    const box = list.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    if (t.left < box.left) list.scrollLeft += t.left - box.left;
    else if (t.right > box.right) list.scrollLeft += t.right - box.right;
  });

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
</script>

<div
  {...rest}
  bind:this={ref}
  id={base}
  class={['ggb-tabs', className]}
  data-size={size}
  data-orientation={orientation}
  data-activation={activation}
>
  <div
    bind:this={listElement}
    class="ggb-tabs__list"
    role="tablist"
    aria-label={name}
    aria-orientation={orientation}
    {@attach rovingFocus({
      orientation: () => orientation,
      items: '.ggb-tabs__trigger',
      manageTabIndex: false,
      onMove: (item) => {
        if (activation === 'automatic' && item.dataset.value !== undefined) select(item.dataset.value);
      }
    })}
  >
    {@render list()}
  </div>
  <div class="ggb-tabs__panels">
    {@render children()}
  </div>
</div>
