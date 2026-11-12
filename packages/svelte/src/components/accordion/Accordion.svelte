<script lang="ts">
  import { setContext } from 'svelte';
  import { Accordion as Primitive } from 'bits-ui';
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
    id,
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
    }
  });

  function set(next: string[]) {
    value = next;
    onvaluechange?.(next);
  }

  // Bits UI Accordion owns the expanded state, the triggers and the headings. Its arrow keys run over every trigger
  // below the root, nested accordions and collapsed (invisible) ones included; the contract keeps them to this
  // accordion's enabled triggers, so the keys are handled here first, in the capture phase (contract over Bits UI,
  // decision of 2026-11-03; covered by a browser test).
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
    event.stopPropagation();
    next?.focus();
  }
  function capture(node: HTMLElement) {
    node.addEventListener('keydown', keydown, true);
    return () => node.removeEventListener('keydown', keydown, true);
  }
</script>

{#if multiple}
  <Primitive.Root
    {...rest}
    bind:ref
    id={id ?? undefined}
    type="multiple"
    class={['ggb-accordion', className]}
    {value}
    onValueChange={(next) => set(next)}
    {@attach capture}
  >
    {@render children()}
  </Primitive.Root>
{:else}
  <Primitive.Root
    {...rest}
    bind:ref
    id={id ?? undefined}
    type="single"
    class={['ggb-accordion', className]}
    value={value[0] ?? ''}
    onValueChange={(next) => set(next ? [next] : [])}
    {@attach capture}
  >
    {@render children()}
  </Primitive.Root>
{/if}
