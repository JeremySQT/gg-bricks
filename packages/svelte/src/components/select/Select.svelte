<script lang="ts">
  import { getContext, tick, untrack } from 'svelte';
  import { floating } from '../../lib/overlay/index.js';
  import '../../lib/overlay/overlay.css';
  import type { SelectProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './select.css';

  // Shape shared by Field through the context key `ggb:field` (declared again here: no import between folders).
  interface FieldContext {
    readonly controlId: string;
    readonly describedBy: string | undefined;
    readonly required: boolean;
    readonly invalid: boolean;
    readonly disabled: boolean;
    readonly labelId: string;
    register(kind: 'text' | 'choice', id?: () => string): void;
  }

  let {
    value = $bindable(defaults.value),
    options,
    placeholder,
    label,
    size = defaults.size,
    open = $bindable(defaults.open),
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    name: formName,
    leading,
    onvaluechange,
    onopenchange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    ...rest
  }: SelectProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('text', () => id ?? field.controlId);

  // Fail identically on the server and in the browser rather than render an unnamed control or a broken list.
  const accessibleName = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('Select requires a non-empty label when it is not inside a Field.');
    return label;
  });
  const list = $derived.by(() => {
    if (!Array.isArray(options)) throw new Error('Select requires an options array.');
    for (const o of options)
      if (typeof o?.value !== 'string' || typeof o?.label !== 'string' || !o.label.trim())
        throw new Error('Every Select option requires a value and a non-empty label.');
    return options;
  });

  const uid = $props.id();
  const triggerId = $derived(id ?? field?.controlId ?? `${uid}-select`);
  const panelId = $derived(`${uid}-panel`);
  const listId = $derived(`${uid}-list`);
  const optionId = (index: number) => `${uid}-option-${index}`;

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const isReadonly = $derived(readonly && !isDisabled);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  const selectedIndex = $derived(list.findIndex((o) => o.value === value));
  const selected = $derived(selectedIndex >= 0 ? list[selectedIndex] : undefined);

  // Consecutive records with the same non-empty group are gathered under one heading.
  type Block = { group?: string; items: { option: (typeof list)[number]; index: number }[] };
  const blocks = $derived.by(() => {
    const out: Block[] = [];
    list.forEach((option, index) => {
      const group = option.group?.trim() || undefined;
      const last = out.at(-1);
      if (last && last.group === group && group !== undefined) last.items.push({ option, index });
      else out.push({ group, items: [{ option, index }] });
    });
    return out;
  });

  let panel = $state<HTMLDivElement | null>(null);
  let active = $state(-1);

  function setOpen(next: boolean) {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }

  const firstEnabled = () => list.findIndex((o) => !o.disabled);
  const lastEnabled = () => list.length - 1 - [...list].reverse().findIndex((o) => !o.disabled);
  const startIndex = () => (selectedIndex >= 0 ? selectedIndex : firstEnabled());

  function highlight(index: number) {
    if (index < 0 || index >= list.length) return;
    active = index;
    void tick().then(() =>
      panel?.querySelector<HTMLElement>(`#${CSS.escape(optionId(index))}`)?.scrollIntoView({ block: 'nearest' })
    );
  }

  // Opened by any means (trigger press, key, application): the highlight starts on the selected option, or on the
  // first enabled one, unless a key asked for another.
  // Opened by any means (trigger press, key, application): the panel takes the trigger's width and the room around
  // it, and the highlight starts on the selected option, or on the first enabled one, unless a key asked for another.
  let requested: number | null = null;
  $effect(() => {
    if (!open) {
      active = -1;
      return;
    }
    untrack(() => {
      const box = ref?.getBoundingClientRect();
      if (panel && box) {
        panel.style.setProperty('--_anchor-inline-size', `${box.width}px`);
        panel.style.setProperty('--_room', `${Math.max(box.top, innerHeight - box.bottom)}px`);
      }
      highlight(requested ?? startIndex());
      requested = null;
    });
  });

  function show(index?: number) {
    if (isDisabled || isReadonly) return;
    if (!open) {
      requested = index ?? null;
      setOpen(true);
    } else if (index !== undefined) highlight(index);
  }
  const hide = () => setOpen(false);

  function choose(index: number) {
    const option = list[index];
    if (!option || option.disabled) return;
    hide();
    ref?.focus();
    if (option.value !== value) {
      value = option.value;
      onvaluechange?.(option.value);
    }
  }

  // Typeahead: characters typed within half a second build a prefix; the next option whose label starts with it is
  // highlighted (from the current one, wrapping).
  let typed = '';
  let typedAt = 0;
  function match(char: string): number {
    const now = performance.now();
    typed = now - typedAt > 500 ? char : typed + char;
    typedAt = now;
    const from = active >= 0 ? active : selectedIndex;
    const order = [...list.keys()].map((i) => (from + 1 + i) % list.length);
    const prefix = typed.toLocaleLowerCase();
    return order.find((i) => list[i].label.toLocaleLowerCase().startsWith(prefix)) ?? -1;
  }

  const visibleCount = () => {
    const option = panel?.querySelector<HTMLElement>('.ggb-select__option');
    return option && panel ? Math.max(1, Math.floor(panel.clientHeight / option.offsetHeight)) : 10;
  };

  let consumed = false;
  function keydown(event: KeyboardEvent) {
    (rest.onkeydown as ((e: KeyboardEvent) => void) | undefined)?.(event);
    consumed = false;
    if (isDisabled || event.ctrlKey || event.metaKey || (event.altKey && event.key !== 'ArrowDown')) return;
    const isOpen = !!panel?.matches(':popover-open');
    const take = () => {
      event.preventDefault();
      consumed = true;
    };
    if (!isOpen) {
      if (isReadonly) return;
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        take();
        show();
      } else if (event.key === 'Home') {
        take();
        show(firstEnabled());
      } else if (event.key === 'End') {
        take();
        show(lastEnabled());
      } else if (event.key.length === 1 && event.key !== ' ') {
        const index = match(event.key);
        take();
        show(index >= 0 ? index : undefined);
      }
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        take();
        highlight(Math.min(list.length - 1, active + 1));
        break;
      case 'ArrowUp':
        take();
        highlight(Math.max(0, active - 1));
        break;
      case 'Home':
        take();
        highlight(0);
        break;
      case 'End':
        take();
        highlight(list.length - 1);
        break;
      case 'PageDown':
        take();
        highlight(Math.min(list.length - 1, active + visibleCount()));
        break;
      case 'PageUp':
        take();
        highlight(Math.max(0, active - visibleCount()));
        break;
      case 'Enter':
      case ' ':
        take();
        choose(active);
        break;
      case 'Escape':
        take();
        hide();
        break;
      case 'Tab':
        // Closes without changing the value; focus moves on as usual.
        hide();
        break;
      default:
        if (event.key.length === 1) {
          const index = match(event.key);
          take();
          if (index >= 0) highlight(index);
        }
    }
  }
  // A consumed Space must not activate the button on key release (which would toggle the list again).
  function keyup(event: KeyboardEvent) {
    (rest.onkeyup as ((e: KeyboardEvent) => void) | undefined)?.(event);
    if (consumed && (event.key === ' ' || event.key === 'Enter')) event.preventDefault();
  }

  function optionClick(event: MouseEvent) {
    const el = (event.target as Element).closest<HTMLElement>('.ggb-select__option');
    if (el) choose(Number(el.dataset.index));
  }
  function optionMove(event: PointerEvent) {
    const el = (event.target as Element).closest<HTMLElement>('.ggb-select__option');
    if (el && Number(el.dataset.index) !== active) active = Number(el.dataset.index);
  }
  // Presses in the list never take focus from the trigger.
  const keepFocus = (event: PointerEvent) => event.preventDefault();
</script>

{#snippet check()}
  <!-- Phosphor Icons 2.1.1 (MIT), check, regular weight: shown on the selected option, decorative. -->
  <svg class="ggb-select__option-check" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path
      d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"
    /></svg
  >
{/snippet}

{#snippet optionItem(option: (typeof list)[number], index: number)}
  {@const isSelected = index === selectedIndex}
  <div
    class="ggb-select__option"
    role="option"
    id={optionId(index)}
    aria-selected={isSelected}
    aria-disabled={option.disabled ? 'true' : undefined}
    data-index={index}
    data-value={option.value}
    data-selected={isSelected ? '' : undefined}
    data-highlighted={index === active ? '' : undefined}
    data-disabled={option.disabled ? '' : undefined}
  >
    <span class="ggb-select__option-label">{option.label}</span>
    {@render check()}
  </div>
{/snippet}

<div
  class={['ggb-select', className]}
  data-size={size}
  data-disabled={isDisabled ? '' : undefined}
  data-readonly={isReadonly ? '' : undefined}
  data-invalid={isInvalid ? '' : undefined}
  data-open={open ? '' : undefined}
>
  <button
    {...rest}
    bind:this={ref}
    type="button"
    id={triggerId}
    class="ggb-select__trigger"
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-controls={listId}
    aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
    aria-label={accessibleName}
    aria-labelledby={field?.labelId}
    aria-describedby={describedByIds}
    aria-invalid={isInvalid ? 'true' : undefined}
    aria-required={isRequired ? 'true' : undefined}
    aria-readonly={isReadonly ? 'true' : undefined}
    disabled={isDisabled}
    popovertarget={isReadonly ? undefined : panelId}
    onkeydown={keydown}
    onkeyup={keyup}
  >
    {#if leading}<span class="ggb-select__leading" aria-hidden="true">{@render leading()}</span>{/if}
    <span class="ggb-select__value" data-placeholder={selected ? undefined : ''}
      >{selected?.label ?? placeholder ?? ''}</span
    >
    <!-- Phosphor Icons 2.1.1 (MIT), caret-down, regular weight: decorative. -->
    <svg class="ggb-select__indicator" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
      ><path
        d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
      /></svg
    >
  </button>
  {#if formName}<input type="hidden" name={formName} {value} disabled={isDisabled} />{/if}
  <div
    bind:this={panel}
    id={panelId}
    class="ggb-select__panel ggb-overlay"
    popover="auto"
    onpointerdown={keepFocus}
    onclick={optionClick}
    onpointermove={optionMove}
    role="presentation"
    {@attach floating({ anchor: () => ref, open: () => open, onOpenChange: setOpen, side: 'bottom', align: 'start' })}
  >
    <div
      class="ggb-select__list"
      role="listbox"
      id={listId}
      aria-labelledby={field?.labelId}
      aria-label={accessibleName}
    >
      {#each blocks as block, b (b)}
        {#if block.group}
          <div class="ggb-select__group" role="group" aria-labelledby={`${uid}-group-${b}`}>
            <div class="ggb-select__group-heading" id={`${uid}-group-${b}`} role="presentation">{block.group}</div>
            {#each block.items as { option, index } (index)}{@render optionItem(option, index)}{/each}
          </div>
        {:else}
          {#each block.items as { option, index } (index)}{@render optionItem(option, index)}{/each}
        {/if}
      {/each}
    </div>
  </div>
</div>
