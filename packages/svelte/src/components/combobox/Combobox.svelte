<script lang="ts">
  import { getContext, tick, untrack } from 'svelte';
  import { floating } from '../../lib/overlay/index.js';
  import '../../lib/overlay/overlay.css';
  import type { ComboboxProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './combobox.css';

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
    inputValue = $bindable(defaults.inputValue),
    options,
    filter = defaults.filter,
    placeholder,
    label,
    emptyLabel = defaults.emptyLabel,
    size = defaults.size,
    open = $bindable(defaults.open),
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    name: formName,
    leading,
    onvaluechange,
    oninputchange,
    onopenchange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    ...rest
  }: ComboboxProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('text', () => id ?? field.controlId);

  // Fail identically on the server and in the browser rather than render an unnamed control or a broken list.
  const accessibleName = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('Combobox requires a non-empty label when it is not inside a Field.');
    return label;
  });
  const list = $derived.by(() => {
    if (!Array.isArray(options)) throw new Error('Combobox requires an options array.');
    for (const o of options)
      if (typeof o?.value !== 'string' || typeof o?.label !== 'string' || !o.label.trim())
        throw new Error('Every Combobox option requires a value and a non-empty label.');
    return options;
  });

  const uid = $props.id();
  const inputId = $derived(id ?? field?.controlId ?? `${uid}-combobox`);
  const panelId = $derived(`${uid}-panel`);
  const listId = $derived(`${uid}-list`);
  const optionId = (index: number) => `${uid}-option-${index}`;

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const isReadonly = $derived(readonly && !isDisabled);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  // The selected option's label is remembered, so that Escape or leaving the field restores it even when a search on
  // a server (filter none) has replaced `options` with results that no longer include it.
  let remembered = { value: '', label: '' };
  const labelOf = (v: string) => {
    const option = list.find((o) => o.value === v);
    if (option) remembered = { value: option.value, label: option.label };
    return option?.label ?? (v && remembered.value === v ? remembered.label : '');
  };

  // Filtering applies only once the user typed since the list opened or the last choice.
  let filtering = $state(false);

  // The text follows the selected option when the value changes from the application or a choice (and at start).
  // Also at initialization, so that server rendering shows the selected label.
  let shownValue: string | undefined = untrack(() => value);
  untrack(() => {
    if (value && !inputValue) inputValue = labelOf(value);
  });
  $effect.pre(() => {
    const v = value;
    untrack(() => {
      if (v === shownValue) return;
      shownValue = v;
      if (v || !filtering) inputValue = labelOf(v);
    });
  });

  const fold = (text: string) =>
    text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase();
  const visible = $derived.by(() => {
    const all = list.map((option, index) => ({ option, index }));
    if (filter !== 'contains' || !filtering) return all;
    const query = fold(inputValue.trim());
    return query ? all.filter(({ option }) => fold(option.label).includes(query)) : all;
  });

  type Block = { group?: string; items: { option: (typeof list)[number]; index: number }[] };
  const blocks = $derived.by(() => {
    const out: Block[] = [];
    for (const item of visible) {
      const group = item.option.group?.trim() || undefined;
      const last = out.at(-1);
      if (last && last.group === group && group !== undefined) last.items.push(item);
      else out.push({ group, items: [item] });
    }
    return out;
  });

  let root = $state<HTMLDivElement | null>(null);
  let panel = $state<HTMLDivElement | null>(null);
  /** Position of the highlighted option in `visible`, or -1. */
  let active = $state(-1);
  const activeIndex = $derived(active >= 0 && active < visible.length ? visible[active].index : -1);

  function setOpen(next: boolean) {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }

  const enabledAt = (from: number, step: 1 | -1) => {
    for (let i = from; i >= 0 && i < visible.length; i += step) if (!visible[i].option.disabled) return i;
    return -1;
  };
  const selectedPosition = () => visible.findIndex(({ option }) => option.value === value && !!value);

  function highlight(position: number) {
    active = position;
    if (position < 0) return;
    void tick().then(() =>
      panel
        ?.querySelector<HTMLElement>(`#${CSS.escape(optionId(visible[position]?.index ?? -1))}`)
        ?.scrollIntoView({ block: 'nearest' })
    );
  }

  // Opened by any means (typing, a key, a press, the application): the panel takes the field's width and the room
  // around it; the highlight is the one a key or the text asked for.
  let requested: number | null = null;
  $effect(() => {
    if (!open) {
      active = -1;
      return;
    }
    untrack(() => {
      const box = root?.getBoundingClientRect();
      if (panel && box) {
        panel.style.setProperty('--_anchor-inline-size', `${box.width}px`);
        panel.style.setProperty('--_room', `${Math.max(box.top, innerHeight - box.bottom)}px`);
      }
      highlight(requested ?? -1);
      requested = null;
    });
  });
  function show(position: number | null = null) {
    if (isDisabled || isReadonly) return;
    if (!open) {
      requested = position;
      setOpen(true);
    } else if (position !== null) highlight(position);
  }
  const hide = () => setOpen(false);

  function choose(position: number) {
    const entry = visible[position];
    if (!entry || entry.option.disabled) return;
    filtering = false;
    inputValue = entry.option.label;
    remembered = { value: entry.option.value, label: entry.option.label };
    hide();
    if (entry.option.value !== value) {
      value = entry.option.value;
      shownValue = value;
      onvaluechange?.(value);
    }
  }

  // Focus leaving or a press outside: an empty text clears the value; any other text is restored.
  function settle() {
    hide();
    filtering = false;
    if (!inputValue.trim()) {
      inputValue = '';
      if (value) {
        value = '';
        shownValue = '';
        onvaluechange?.('');
      }
    } else inputValue = labelOf(value);
  }

  function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
    (rest.oninput as ((e: Event) => void) | undefined)?.(event);
    inputValue = event.currentTarget.value;
    filtering = true;
    oninputchange?.(inputValue);
    void tick().then(() => {
      const first = enabledAt(0, 1);
      if (!open) show(first);
      else highlight(first);
    });
  }

  const visibleCount = () => {
    const option = panel?.querySelector<HTMLElement>('.ggb-combobox__option');
    return option && panel ? Math.max(1, Math.floor(panel.clientHeight / option.offsetHeight)) : 10;
  };

  function keydown(event: KeyboardEvent) {
    (rest.onkeydown as ((e: KeyboardEvent) => void) | undefined)?.(event);
    if (isDisabled || isReadonly || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowDown' && event.altKey) {
      event.preventDefault();
      show(null);
      return;
    }
    if (event.altKey) return;
    const last = visible.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) {
          const s = selectedPosition();
          show(s >= 0 ? s : enabledAt(0, 1));
        } else highlight(Math.min(last, active + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) {
          const s = selectedPosition();
          show(s >= 0 ? s : enabledAt(last, -1));
        } else highlight(active < 0 ? last : Math.max(0, active - 1));
        break;
      case 'PageDown':
        if (!open) return;
        event.preventDefault();
        highlight(Math.min(last, Math.max(0, active) + visibleCount()));
        break;
      case 'PageUp':
        if (!open) return;
        event.preventDefault();
        highlight(Math.max(0, active - visibleCount()));
        break;
      case 'Enter':
        if (open && active >= 0) {
          event.preventDefault();
          choose(active);
        }
        break;
      case 'Escape':
        if (open) {
          event.preventDefault();
          hide();
          filtering = false;
          inputValue = labelOf(value);
        }
        break;
    }
  }

  function focusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && root?.contains(next)) return;
    settle();
  }
  // A press outside the combobox while the list is open (the panel is a manual popover: no light dismiss).
  $effect(() => {
    if (!open) return;
    const press = (event: PointerEvent) => {
      if (root && !root.contains(event.target as Node)) settle();
    };
    document.addEventListener('pointerdown', press, true);
    return () => document.removeEventListener('pointerdown', press, true);
  });

  function fieldPointerdown(event: PointerEvent) {
    if (isDisabled || !ref) return;
    const target = event.target as Element;
    const onIndicator = !!target.closest('.ggb-combobox__indicator');
    if (target !== ref) {
      event.preventDefault();
      ref.focus();
    }
    if (isReadonly) return;
    if (onIndicator) {
      if (open) hide();
      else {
        const s = selectedPosition();
        show(s >= 0 ? s : -1);
      }
    } else if (!open) {
      const s = selectedPosition();
      show(s >= 0 ? s : -1);
    }
  }

  function optionClick(event: MouseEvent) {
    const el = (event.target as Element).closest<HTMLElement>('.ggb-combobox__option');
    if (el) choose(Number(el.dataset.position));
  }
  function optionMove(event: PointerEvent) {
    const el = (event.target as Element).closest<HTMLElement>('.ggb-combobox__option');
    if (el && Number(el.dataset.position) !== active) active = Number(el.dataset.position);
  }
  const keepFocus = (event: PointerEvent) => event.preventDefault();
</script>

{#snippet check()}
  <!-- Phosphor Icons 2.1.1 (MIT), check, regular weight: shown on the selected option, decorative. -->
  <svg class="ggb-combobox__option-check" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path
      d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"
    /></svg
  >
{/snippet}

{#snippet optionItem(option: (typeof list)[number], index: number)}
  {@const isSelected = !!value && option.value === value}
  {@const position = visible.findIndex((v) => v.index === index)}
  <div
    class="ggb-combobox__option"
    role="option"
    id={optionId(index)}
    aria-selected={isSelected}
    aria-disabled={option.disabled ? 'true' : undefined}
    data-position={position}
    data-value={option.value}
    data-selected={isSelected ? '' : undefined}
    data-highlighted={index === activeIndex ? '' : undefined}
    data-disabled={option.disabled ? '' : undefined}
  >
    <span class="ggb-combobox__option-label">{option.label}</span>
    {@render check()}
  </div>
{/snippet}

<div
  bind:this={root}
  class={['ggb-combobox', className]}
  data-size={size}
  data-disabled={isDisabled ? '' : undefined}
  data-readonly={isReadonly ? '' : undefined}
  data-invalid={isInvalid ? '' : undefined}
  data-open={open ? '' : undefined}
  onfocusout={focusOut}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="ggb-combobox__field" onpointerdown={fieldPointerdown}>
    {#if leading}<span class="ggb-combobox__leading" aria-hidden="true">{@render leading()}</span>{/if}
    <input
      {...rest}
      bind:this={ref}
      id={inputId}
      class="ggb-combobox__input"
      type="text"
      role="combobox"
      autocomplete="off"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls={listId}
      aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
      aria-label={accessibleName}
      aria-labelledby={field?.labelId}
      aria-describedby={describedByIds}
      aria-invalid={isInvalid ? 'true' : undefined}
      value={inputValue}
      {placeholder}
      disabled={isDisabled}
      readonly={isReadonly}
      required={isRequired}
      oninput={handleInput}
      onkeydown={keydown}
    />
    <span class="ggb-combobox__indicator" aria-hidden="true">
      <!-- Phosphor Icons 2.1.1 (MIT), caret-down, regular weight: decorative; a press toggles the list. -->
      <svg viewBox="0 0 256 256" fill="currentColor" focusable="false"
        ><path
          d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"
        /></svg
      >
    </span>
  </div>
  {#if formName}<input type="hidden" name={formName} {value} disabled={isDisabled} />{/if}
  <div
    bind:this={panel}
    id={panelId}
    class="ggb-combobox__panel ggb-overlay"
    popover="manual"
    role="presentation"
    onpointerdown={keepFocus}
    onclick={optionClick}
    onpointermove={optionMove}
    {@attach floating({
      anchor: () => root,
      open: () => open,
      onOpenChange: setOpen,
      side: 'bottom',
      align: 'start',
      mode: 'manual'
    })}
  >
    <div
      class="ggb-combobox__list"
      role="listbox"
      id={listId}
      aria-labelledby={field?.labelId}
      aria-label={accessibleName}
    >
      {#each blocks as block, b (b)}
        {#if block.group}
          <div class="ggb-combobox__group" role="group" aria-labelledby={`${uid}-group-${b}`}>
            <div class="ggb-combobox__group-heading" id={`${uid}-group-${b}`} role="presentation">{block.group}</div>
            {#each block.items as { option, index } (index)}{@render optionItem(option, index)}{/each}
          </div>
        {:else}
          {#each block.items as { option, index } (index)}{@render optionItem(option, index)}{/each}
        {/if}
      {/each}
    </div>
    <div class="ggb-combobox__empty" role="status">{open && visible.length === 0 ? emptyLabel : ''}</div>
  </div>
</div>
