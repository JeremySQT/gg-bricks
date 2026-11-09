<script lang="ts">
  import { setContext } from 'svelte';
  import type { AccordionContext, AccordionProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './accordion.css';

  let {
    value = $bindable([...defaults.value]),
    multiple = defaults.multiple,
    headingLevel = defaults.headingLevel,
    children,
    onvaluechange,
    ref = $bindable(null),
    class: className,
    ...rest
  }: AccordionProps = $props();

  // Heading levels 2 to 6 (the contract); anything else falls back to the default.
  const level = $derived(
    Number.isInteger(headingLevel) && headingLevel >= 2 && headingLevel <= 6 ? headingLevel : defaults.headingLevel
  );

  setContext<AccordionContext>('ggb:accordion', {
    get headingLevel() {
      return level;
    },
    isExpanded: (v) => value.includes(v),
    toggle(v) {
      const open = value.includes(v);
      const next = open ? value.filter((x) => x !== v) : multiple ? [...value, v] : [v];
      value = next;
      onvaluechange?.(next);
    }
  });

  // Down and Up Arrow move between the enabled triggers of this accordion (not of a nested one), wrapping; Home and
  // End jump to the first and last (WAI-ARIA accordion pattern, optional keys).
  function keydown(event: KeyboardEvent) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey)
      return;
    const root = ref;
    const target = event.target as HTMLElement;
    if (!root || !target.matches('.ggb-accordion__trigger') || target.closest('.ggb-accordion') !== root) return;
    const triggers = [...root.querySelectorAll<HTMLButtonElement>('.ggb-accordion__trigger:not(:disabled)')].filter(
      (t) => t.closest('.ggb-accordion') === root
    );
    const index = triggers.indexOf(target as HTMLButtonElement);
    const next =
      event.key === 'ArrowDown'
        ? triggers[(index + 1) % triggers.length]
        : event.key === 'ArrowUp'
          ? triggers[(index - 1 + triggers.length) % triggers.length]
          : event.key === 'Home'
            ? triggers[0]
            : triggers.at(-1);
    event.preventDefault();
    next?.focus();
  }
</script>

<div {...rest} bind:this={ref} class={['ggb-accordion', className]} onkeydown={keydown}>
  {@render children()}
</div>
