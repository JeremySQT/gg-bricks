<script lang="ts">
  import { getContext } from 'svelte';
  import type { TimeInputProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import { layoutOf, partsOf, rangeOf, stepPart, typeDigit, valueOf, type Part, type Parts } from './time.js';
  import './tokens.generated.css';
  import './time-input.css';

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
    // min and max are informative (the application owns invalid): taken out of the attributes, not used.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    min: _min,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    max: _max,
    locale = defaults.locale,
    hourCycle = defaults.hourCycle,
    seconds = defaults.seconds,
    label,
    size = defaults.size,
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    name,
    onvaluechange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    onpointerdown,
    ...rest
  }: TimeInputProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('choice');

  const uid = $props.id();
  const nameId = `ggb-time-input-${uid}-name`;
  const partId = (part: string) => `ggb-time-input-${uid}-${part}`;

  // Fail identically on the server and in the browser rather than render a field without a name.
  const accessibleName = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('TimeInput requires a non-empty label when it is not inside a Field.');
    return label;
  });
  const labelledBy = $derived(field ? field.labelId : nameId);

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isReadonly = $derived(readonly && !isDisabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  const layout = $derived(layoutOf(locale, hourCycle, seconds));
  const editable = $derived(layout.items.flatMap((item) => ('part' in item ? [item.part] : [])));

  // The parts follow the value; while the user types an incomplete time they hold what was typed and value stays
  // empty. A value set by the application (different from the last one this component emitted) replaces them.
  let parts = $state<Parts>({ hour: null, minute: null, second: null, dayPeriod: null });
  let synced = $state<string | undefined>(undefined);
  let syncedTwelve = $state<boolean | undefined>(undefined);
  $effect.pre(() => {
    const v = value;
    const twelve = layout.twelve;
    if (v === synced && twelve === syncedTwelve) return;
    parts = partsOf(v, twelve);
    synced = v;
    syncedTwelve = twelve;
  });
  // On the server, and before the effect has run, the parts are those of the value.
  const shown = $derived(synced === value && syncedTwelve === layout.twelve ? parts : partsOf(value, layout.twelve));
  const current = $derived(valueOf(shown, layout.twelve, seconds));

  function update(next: Parts) {
    parts = next;
    const text = valueOf(next, layout.twelve, seconds);
    synced = text;
    syncedTwelve = layout.twelve;
    if (text === value) return;
    value = text;
    onvaluechange?.(text);
  }

  // Names of the parts in the locale, from the platform (no string to translate); English when it has none.
  const english: Record<Part, string> = { hour: 'hour', minute: 'minute', second: 'second', dayPeriod: 'AM/PM' };
  const partNames = $derived.by(() => {
    let names: Intl.DisplayNames | undefined;
    try {
      names = new Intl.DisplayNames(locale, { type: 'dateTimeField' });
    } catch {
      names = undefined;
    }
    return Object.fromEntries(
      (Object.keys(english) as Part[]).map((part) => [part, names?.of(part) ?? english[part]])
    ) as Record<Part, string>;
  });
  // Digits of the locale (Arabic-Indic in ar-EG), two per part.
  const format = $derived.by(() => {
    try {
      return new Intl.NumberFormat(locale, { useGrouping: false, minimumIntegerDigits: 2 });
    } catch {
      return new Intl.NumberFormat('en', { useGrouping: false, minimumIntegerDigits: 2 });
    }
  });
  const localDigits = $derived(Array.from({ length: 10 }, (_, d) => format.format(d).slice(-1)));
  const textOf = (part: Part, p: Parts): string | null => {
    if (part === 'dayPeriod') return p.dayPeriod === null ? null : p.dayPeriod === 'am' ? layout.am : layout.pm;
    const n = p[part];
    return n === null ? null : format.format(n);
  };
  const valueNow = (part: Part, p: Parts): number | undefined =>
    part === 'dayPeriod' ? (p.dayPeriod === null ? undefined : p.dayPeriod === 'am' ? 0 : 1) : (p[part] ?? undefined);

  // Typing: the digits typed in the focused part since it took focus.
  let buffer = '';
  const segmentElements = () => [...(ref?.querySelectorAll<HTMLElement>('.ggb-time-input__segment[data-part]') ?? [])];
  function focusPart(from: HTMLElement, direction: 'next' | 'previous' | 'left' | 'right') {
    const all = segmentElements();
    const i = all.indexOf(from);
    let target: HTMLElement | undefined;
    if (direction === 'next') target = all[i + 1];
    else if (direction === 'previous') target = all[i - 1];
    else {
      // Left and Right follow what is on screen: the nearest part on that side, whatever the reading direction.
      const x = from.getBoundingClientRect().left;
      target = all
        .filter((el) => el !== from)
        .map((el) => ({ el, dx: el.getBoundingClientRect().left - x }))
        .filter(({ dx }) => (direction === 'left' ? dx < 0 : dx > 0))
        .sort((a, b) => Math.abs(a.dx) - Math.abs(b.dx))[0]?.el;
    }
    target?.focus();
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }, part: Part) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        if (isReadonly) return;
        buffer = '';
        update(stepPart(parts, part, event.key === 'ArrowUp' ? 1 : -1, layout.twelve));
        return;
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        focusPart(event.currentTarget, event.key === 'ArrowLeft' ? 'left' : 'right');
        return;
      case 'Enter':
        // As in a text input, Enter submits the enclosing form.
        event.preventDefault();
        event.currentTarget.closest('form')?.requestSubmit();
        return;
    }
  }

  // Text entry arrives as input events (mobile keyboards send no usable key): the component applies it to the part
  // and never lets the browser edit the text.
  function handleBeforeinput(event: InputEvent & { currentTarget: HTMLElement }, part: Part) {
    event.preventDefault();
    if (isReadonly || isDisabled) return;
    const el = event.currentTarget;
    if (event.inputType.startsWith('delete')) {
      buffer = '';
      if (parts[part] !== null) update({ ...parts, [part]: null });
      else focusPart(el, 'previous');
      return;
    }
    for (const ch of event.data ?? '') {
      if (part === 'dayPeriod') {
        const c = ch.toLowerCase();
        if (c === 'a' || c === layout.am.charAt(0).toLowerCase()) update({ ...parts, dayPeriod: 'am' });
        else if (c === 'p' || c === layout.pm.charAt(0).toLowerCase()) update({ ...parts, dayPeriod: 'pm' });
        continue;
      }
      const digit = /^\d$/.test(ch) ? Number(ch) : localDigits.indexOf(ch);
      if (digit < 0) continue;
      const typed = typeDigit(part, buffer, digit, layout.twelve);
      buffer = typed.buffer;
      update({ ...parts, [part]: typed.value });
      if (typed.complete) {
        focusPart(el, 'next');
        return;
      }
    }
  }

  // A press on the container outside the parts focuses the first part (a press on a part focuses that part).
  function handlePointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onpointerdown?.(event);
    if (event.defaultPrevented || isDisabled) return;
    if ((event.target as Element).closest('.ggb-time-input__segment[data-part]')) return;
    const first = segmentElements()[0];
    if (!first) return;
    event.preventDefault();
    first.focus();
  }
</script>

<div
  {...rest}
  bind:this={ref}
  {id}
  class={['ggb-time-input', className]}
  role="group"
  data-size={size}
  data-disabled={isDisabled ? '' : undefined}
  data-readonly={isReadonly ? '' : undefined}
  data-invalid={isInvalid ? '' : undefined}
  data-complete={current ? '' : undefined}
  aria-labelledby={labelledBy}
  aria-describedby={describedByIds}
  aria-disabled={isDisabled ? 'true' : undefined}
  onpointerdown={handlePointerdown}
>
  <span class="ggb-time-input__segments"
    >{#each layout.items as item, i (i)}{#if 'part' in item}{@const part = item.part}{@const t = textOf(
          part,
          shown
        )}{@const range = rangeOf(part, layout.twelve)}<span
          class="ggb-time-input__segment"
          data-part={part}
          data-empty={t === null ? '' : undefined}
          role="spinbutton"
          tabindex={isDisabled ? undefined : 0}
          contenteditable={isDisabled || isReadonly ? undefined : 'true'}
          spellcheck="false"
          autocapitalize="off"
          inputmode={part === 'dayPeriod' ? 'text' : 'numeric'}
          enterkeyhint="next"
          aria-labelledby={`${labelledBy} ${partId(part)}`}
          aria-describedby={part === editable[0] ? describedByIds : undefined}
          aria-valuemin={range[0]}
          aria-valuemax={range[1]}
          aria-valuenow={valueNow(part, shown)}
          aria-valuetext={t ?? undefined}
          aria-invalid={isInvalid ? 'true' : undefined}
          aria-required={isRequired ? 'true' : undefined}
          aria-readonly={isReadonly ? 'true' : undefined}
          aria-disabled={isDisabled ? 'true' : undefined}
          onfocus={() => (buffer = '')}
          onkeydown={(event) => handleKeydown(event, part)}
          onbeforeinput={(event) => handleBeforeinput(event, part)}>{t ?? '––'}</span
        >{:else}<span class="ggb-time-input__literal" aria-hidden="true">{item.literal}</span>{/if}{/each}</span
  >
  {#if accessibleName}<span id={nameId} hidden>{accessibleName}</span>{/if}
  {#each editable as part (part)}<span id={partId(part)} hidden>{partNames[part]}</span>{/each}
  {#if name}
    <input type="hidden" {name} value={current} disabled={isDisabled} />
  {/if}
</div>
