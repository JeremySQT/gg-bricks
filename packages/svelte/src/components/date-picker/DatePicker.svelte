<script lang="ts">
  import { getContext, tick } from 'svelte';
  import { DatePicker } from 'bits-ui';
  import { CalendarDate, getLocalTimeZone, parseDate, today, type DateValue } from '@internationalized/date';
  import IconButton from '../icon-button/IconButton.svelte';
  import { floating } from '../../lib/overlay/index.js';
  import '../../lib/overlay/overlay.css';
  import type { DatePickerProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './date-picker.css';

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
    min,
    max,
    locale = defaults.locale,
    label,
    size = defaults.size,
    open = $bindable(defaults.open),
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    invalid = defaults.invalid,
    required = defaults.required,
    name,
    openLabel = defaults.openLabel,
    previousLabel = defaults.previousLabel,
    nextLabel = defaults.nextLabel,
    onvaluechange,
    onopenchange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    onpointerdown,
    ...rest
  }: DatePickerProps = $props();

  const field = getContext<FieldContext | undefined>('ggb:field');
  field?.register('choice');

  const uid = $props.id();
  const nameId = `ggb-date-picker-${uid}-name`;
  const panelId = `ggb-date-picker-${uid}-panel`;
  const headingId = `ggb-date-picker-${uid}-heading`;
  const partId = (part: string) => `ggb-date-picker-${uid}-${part}`;

  // Fail identically on the server and in the browser rather than render a field without a name.
  const accessibleName = $derived.by(() => {
    if (field) return undefined;
    if (typeof label !== 'string' || !label.trim())
      throw new Error('DatePicker requires a non-empty label when it is not inside a Field.');
    return label;
  });
  const labelledBy = $derived(field ? field.labelId : nameId);

  const isDisabled = $derived(disabled || !!field?.disabled);
  const isReadonly = $derived(readonly && !isDisabled);
  const isInvalid = $derived(invalid || !!field?.invalid);
  const isRequired = $derived(required || !!field?.required);
  const describedByIds = $derived([field?.describedBy, describedBy].filter(Boolean).join(' ') || undefined);

  // ISO strings outside, Bits UI dates inside. An invalid date shows as empty.
  const toDate = (text: string | undefined): CalendarDate | undefined => {
    if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined;
    try {
      const d = parseDate(text);
      return d.toString() === text ? d : undefined;
    } catch {
      return undefined;
    }
  };
  const date = $derived(toDate(value));
  const minDate = $derived(toDate(min));
  const maxDate = $derived(toDate(max));

  // Gregorian calendar whatever the locale's default (a Thai locale would show Buddhist years otherwise).
  const calendarLocale = $derived.by(() => {
    try {
      return new Intl.Locale(locale, { calendar: 'gregory' }).toString();
    } catch {
      return 'en-u-ca-gregory';
    }
  });
  // First day of the week of the locale; Monday where the platform does not tell (Bits UI would use Sunday).
  const weekStartsOn = $derived.by(() => {
    try {
      const l = new Intl.Locale(locale) as Intl.Locale & {
        getWeekInfo?: () => { firstDay: number };
        weekInfo?: { firstDay: number };
      };
      const first = (l.getWeekInfo?.() ?? l.weekInfo)?.firstDay;
      return (first === undefined ? 1 : first % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    } catch {
      return 1;
    }
  });

  // While Backspace empties a part in several steps, the intermediate dates are not values.
  let clearing = false;
  function handleValueChange(next: DateValue | undefined) {
    if (clearing) return;
    const text = next ? next.toString().slice(0, 10) : '';
    if (text === value) return;
    value = text;
    onvaluechange?.(text);
  }

  // The displayed month. Deterministic on the server (it only bounds the empty parts); the current month once
  // mounted, from the device clock, so that Up on an empty year starts at the current year.
  const clampDate = (d: CalendarDate) =>
    minDate && d.compare(minDate) < 0 ? minDate : maxDate && d.compare(maxDate) > 0 ? maxDate : d;
  // eslint-disable-next-line svelte/prefer-writable-derived -- the effect below must not run on the server
  let placeholder = $state<DateValue>(new CalendarDate(2000, 1, 1));
  // An effect, not a derived value: it must not run on the server, whose clock and time zone are not the user's.
  $effect(() => {
    placeholder = date ?? clampDate(today(getLocalTimeZone()));
  });

  // Open state: the button toggles the panel natively (popovertarget); Bits UI closes it when a day is chosen.
  let panel = $state<HTMLElement | null>(null);
  let field_ = $state<HTMLElement | null>(null);
  let button = $state<HTMLButtonElement | null>(null);
  let rendered = $state(false);
  function setOpen(next: boolean) {
    if (next && (isDisabled || isReadonly)) return;
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }
  // The calendar is rendered on the client before it is first shown, so that it never appears empty: as soon as the
  // user shows an intent (pointer over or focus in the field) or the application opens it.
  const prepare = () => {
    if (!rendered) rendered = true;
  };
  $effect(() => {
    if (open) prepare();
  });
  async function opened(isOpen: boolean) {
    if (isOpen) {
      placeholder = date ?? clampDate(today(getLocalTimeZone()));
      rendered = true;
    }
    setOpen(isOpen);
    if (!isOpen || !panel) return;
    await tick();
    const active = document.activeElement;
    if (!panel.matches(':popover-open') || (active && active !== document.body && active !== button)) return;
    focusDay();
  }
  function focusDay() {
    const days = panel?.querySelectorAll<HTMLElement>('[data-bits-day]:not([data-disabled])');
    const target =
      panel?.querySelector<HTMLElement>('[data-bits-day][data-selected]:not([data-disabled])') ??
      panel?.querySelector<HTMLElement>('[data-bits-day][data-today]:not([data-disabled])') ??
      days?.[0];
    target?.focus();
  }
  // Focus leaving the panel and the field closes it; focus stays where it went.
  function focusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (!next || panel?.contains(next) || field_?.contains(next)) return;
    if (panel?.matches(':popover-open')) panel.hidePopover();
    else setOpen(false);
  }
  // When the calendar closes with focus inside it (a day chosen), focus returns to the button.
  $effect(() => {
    if (!open && panel?.contains(document.activeElement)) button?.focus();
  });

  // Keyboard in the grid, handled here before Bits UI (whose keys are the arrows, Enter and Space only, and ignore the
  // reading direction): arrows by day and week, Page Up and Page Down by month, with Shift by year, Home and End to
  // the week's ends; focus never leaves min..max.
  async function gridKeydown(event: KeyboardEvent) {
    const day = (event.target as HTMLElement).closest<HTMLElement>('[data-bits-day]');
    if (!day || event.altKey || event.ctrlKey || event.metaKey) return;
    const current = toDate(day.dataset.value?.slice(0, 10));
    if (!current) return;
    const rtl = getComputedStyle(day).direction === 'rtl';
    const weekday = (d: CalendarDate) => (d.toDate('UTC').getUTCDay() - weekStartsOn + 7) % 7;
    let next: CalendarDate;
    switch (event.key) {
      case 'ArrowLeft':
        next = current.add({ days: rtl ? 1 : -1 });
        break;
      case 'ArrowRight':
        next = current.add({ days: rtl ? -1 : 1 });
        break;
      case 'ArrowUp':
        next = current.subtract({ weeks: 1 });
        break;
      case 'ArrowDown':
        next = current.add({ weeks: 1 });
        break;
      case 'PageUp':
        next = event.shiftKey ? current.subtract({ years: 1 }) : current.subtract({ months: 1 });
        break;
      case 'PageDown':
        next = event.shiftKey ? current.add({ years: 1 }) : current.add({ months: 1 });
        break;
      case 'Home':
        next = current.subtract({ days: weekday(current) });
        break;
      case 'End':
        next = current.add({ days: 6 - weekday(current) });
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!day.hasAttribute('data-disabled')) day.click();
        return;
      default:
        return;
    }
    event.preventDefault();
    next = clampDate(next);
    if (next.compare(current) === 0) return;
    placeholder = next;
    // Bits UI rebuilds the grid of another month after the placeholder changes: wait for the day to exist.
    for (let i = 0; i < 10; i++) {
      await tick();
      const target = panel?.querySelector<HTMLElement>(`[data-bits-day][data-value^="${next.toString()}"]`);
      if (target) return target.focus();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  const showMonth = (months: number) => {
    const p = placeholder as CalendarDate;
    placeholder = p.add({ months });
  };
  const monthBefore = $derived((placeholder as CalendarDate).set({ day: 1 }).subtract({ days: 1 }));
  const monthAfter = $derived((placeholder as CalendarDate).set({ day: 1 }).add({ months: 1 }));
  const previousDisabled = $derived(!!minDate && monthBefore.compare(minDate) < 0);
  const nextDisabled = $derived(!!maxDate && monthAfter.compare(maxDate) > 0);

  const heading = $derived(
    new Intl.DateTimeFormat(calendarLocale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
      (placeholder as CalendarDate).toDate('UTC')
    )
  );
  const dayNumber = $derived(new Intl.NumberFormat(calendarLocale, { useGrouping: false }));
  const weekdayName = (d: DateValue, style: 'long' | 'short' | 'narrow') =>
    new Intl.DateTimeFormat(calendarLocale, { weekday: style, timeZone: 'UTC' }).format(d.toDate('UTC'));
  // Short names, narrow ones where the locale's short names are long (Arabic short names are full names).
  const weekdayStyle = $derived.by(() => {
    const week = Array.from({ length: 7 }, (_, i) => new CalendarDate(2026, 1, 4 + i));
    return week.some((d) => weekdayName(d, 'short').length > 4) ? 'narrow' : 'short';
  });

  // Names of the parts in the locale, from the platform (no string to translate); English when it has none.
  const english: Record<string, string> = { day: 'day', month: 'month', year: 'year' };
  const partNames = $derived.by(() => {
    let names: Intl.DisplayNames | undefined;
    try {
      names = new Intl.DisplayNames(locale, { type: 'dateTimeField' });
    } catch {
      names = undefined;
    }
    return Object.fromEntries(
      Object.keys(english).map((p) => [p, names?.of(p as Intl.DateTimeFormatPart['type']) ?? english[p]])
    ) as Record<string, string>;
  });
  const editableParts = ['day', 'month', 'year'];
  // Bits UI writes some parts with Latin digits whatever the locale (the year in ar-EG); shown in the locale's digits
  // (display only: typing and the value are unchanged).
  const localDigits = $derived(Array.from({ length: 10 }, (_, d) => dayNumber.format(d)));
  const display = (text: string) => text.replace(/[0-9]/g, (d) => localDigits[Number(d)] ?? d);

  // Bits UI writes English names, "Empty" and its own description on the parts and marks a date outside min..max
  // invalid by itself; the contract names each part by the field name and the part name in the locale, describes the
  // first part by the Field description, exposes an empty part without a value, and leaves invalid to the
  // application. These attributes replace the primitive's (bits-ui 2.19.3, date-field.svelte.js).
  // Backspace clears the whole part (Bits UI removes one digit at a time): its handler runs as many times as it
  // needs to empty the part, never once more (which would move to the previous part).
  function backspacesToClear(text: string): number {
    let s = text;
    let n = 0;
    while (s !== '' && n < 5) {
      n++;
      s = s.length === 1 || (s.length === 2 && s.startsWith('0')) ? '' : String(Number.parseInt(s.slice(0, -1)));
    }
    return n;
  }
  function segmentProps(
    props: Record<string, unknown>,
    part: string,
    first: boolean,
    text: string
  ): Record<string, unknown> {
    if (!editableParts.includes(part))
      return { ...props, 'aria-hidden': 'true', 'aria-invalid': undefined, 'data-invalid': undefined };
    const empty = props['aria-valuetext'] === 'Empty';
    return {
      ...props,
      'aria-labelledby': `${labelledBy} ${partId(part)}`,
      'aria-label': undefined,
      'aria-describedby': first ? describedByIds : undefined,
      'aria-invalid': isInvalid ? 'true' : undefined,
      'aria-required': isRequired ? 'true' : undefined,
      'aria-valuenow': empty ? undefined : props['aria-valuenow'],
      'aria-valuetext': empty ? undefined : props['aria-valuetext'],
      'data-invalid': undefined,
      'data-empty': empty ? '' : undefined,
      onkeydown: (event: KeyboardEvent) => {
        const bits = props.onkeydown as ((e: KeyboardEvent) => void) | undefined;
        const clears = event.key === 'Backspace' && !empty && !isReadonly && !isDisabled ? backspacesToClear(text) : 1;
        clearing = clears > 1;
        for (let i = 0; i < clears; i++) {
          if (i === clears - 1) clearing = false;
          bits?.(event);
        }
      }
    };
  }

  // A press on the field outside the parts and the button focuses the first part.
  function handlePointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
    onpointerdown?.(event);
    if (event.defaultPrevented || isDisabled) return;
    const target = event.target as Element;
    if (target.closest('[data-segment]:not([data-segment="literal"]), .ggb-date-picker__button')) return;
    const first = event.currentTarget.querySelector<HTMLElement>('[data-segment]:not([data-segment="literal"])');
    if (!first) return;
    event.preventDefault();
    first.focus();
  }
</script>

{#snippet calendarIcon()}
  <!-- Phosphor Icons 2.1.1 (MIT), calendar-blank, regular weight: the calendar button, named by openLabel. -->
  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path
      d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z"
    /></svg
  >
{/snippet}
{#snippet caretStart()}
  <!-- Phosphor Icons 2.1.1 (MIT), caret-left, regular weight: previous month (mirrored in right to left). -->
  <svg class="ggb-date-picker__caret" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path
      d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"
    /></svg
  >
{/snippet}
{#snippet caretEnd()}
  <!-- Phosphor Icons 2.1.1 (MIT), caret-right, regular weight: next month (mirrored in right to left). -->
  <svg class="ggb-date-picker__caret" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
    ><path
      d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
    /></svg
  >
{/snippet}

<div class="ggb-date-picker" data-size={size}>
  <DatePicker.Root
    value={date}
    onValueChange={handleValueChange}
    bind:placeholder
    {open}
    onOpenChange={setOpen}
    locale={calendarLocale}
    minValue={minDate}
    maxValue={maxDate}
    disabled={isDisabled}
    readonly={isReadonly}
    required={isRequired}
    granularity="day"
    {weekStartsOn}
    weekdayFormat="short"
    fixedWeeks
    disableDaysOutsideMonth
    preventDeselect
    closeOnDateSelect={false}
  >
    <DatePicker.Input>
      {#snippet child({ props, segments })}
        {@const firstEditable = segments.findIndex((s) => editableParts.includes(s.part))}
        <div
          {...rest}
          {...props}
          bind:this={field_}
          {id}
          class={['ggb-date-picker__field', className]}
          data-disabled={isDisabled ? '' : undefined}
          data-readonly={isReadonly ? '' : undefined}
          data-invalid={isInvalid ? '' : undefined}
          data-complete={date ? '' : undefined}
          aria-labelledby={labelledBy}
          aria-describedby={describedByIds}
          onpointerdown={handlePointerdown}
          onpointerenter={prepare}
          onfocusin={prepare}
          {@attach (node) => {
            ref = node;
          }}
        >
          <span class="ggb-date-picker__segments"
            >{#each segments as { part, value: text }, i (i)}<DatePicker.Segment {part}
                >{#snippet child({ props: segment })}<span
                    {...segmentProps(segment, part, i === firstEditable, text)}
                    class="ggb-date-picker__segment">{display(text)}</span
                  >{/snippet}</DatePicker.Segment
              >{/each}</span
          >
          <button
            bind:this={button}
            type="button"
            class="ggb-date-picker__button"
            popovertarget={panelId}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={openLabel}
            disabled={isDisabled || isReadonly}>{@render calendarIcon()}</button
          >
          {#if accessibleName}<span id={nameId} hidden>{accessibleName}</span>{/if}
          {#each editableParts as part (part)}<span id={partId(part)} hidden>{partNames[part]}</span>{/each}
          {#if name}
            <input type="hidden" {name} value={date ? date.toString() : ''} disabled={isDisabled} />
          {/if}
        </div>
      {/snippet}
    </DatePicker.Input>

    <div
      bind:this={panel}
      id={panelId}
      class="ggb-date-picker__panel ggb-overlay"
      role="dialog"
      aria-labelledby={headingId}
      tabindex="-1"
      popover="auto"
      onfocusout={focusOut}
      ontoggle={(event) => {
        // The browser coalesces the toggle events of a panel closed and opened again in the same task (a press
        // outside, then at once on the button: open to open), or opened and closed again (two quick presses on the
        // button: closed to closed); lib/overlay then sees no change. Both changes are reported here.
        const toggle = event as ToggleEvent;
        if (toggle.oldState === 'open' && toggle.newState === 'open' && open) {
          setOpen(false);
          void opened(true);
        } else if (
          toggle.oldState === 'closed' &&
          toggle.newState === 'closed' &&
          !open &&
          !isDisabled &&
          !isReadonly
        ) {
          setOpen(true);
          setOpen(false);
        }
      }}
      {@attach floating({ anchor: () => field_, open: () => open, onOpenChange: opened })}
    >
      {#if rendered}
        <DatePicker.Calendar onkeydown={gridKeydown}>
          {#snippet child({ props, months })}
            <div {...props} role={undefined} aria-label={undefined} class="ggb-date-picker__calendar">
              <div class="ggb-date-picker__header">
                <IconButton
                  size="sm"
                  intent="neutral"
                  appearance="ghost"
                  label={previousLabel}
                  icon={caretStart}
                  disabled={previousDisabled}
                  onactivate={() => showMonth(-1)}
                />
                <div id={headingId} class="ggb-date-picker__heading" aria-live="polite">{heading}</div>
                <IconButton
                  size="sm"
                  intent="neutral"
                  appearance="ghost"
                  label={nextLabel}
                  icon={caretEnd}
                  disabled={nextDisabled}
                  onactivate={() => showMonth(1)}
                />
              </div>
              {#each months as month (month.value.toString())}
                <DatePicker.Grid class="ggb-date-picker__grid" aria-labelledby={headingId}>
                  <DatePicker.GridHead>
                    <DatePicker.GridRow class="ggb-date-picker__weekdays">
                      {#each month.weeks[0] as d (d.toString())}
                        <DatePicker.HeadCell class="ggb-date-picker__weekday" aria-label={weekdayName(d, 'long')}
                          >{weekdayName(d, weekdayStyle)}</DatePicker.HeadCell
                        >
                      {/each}
                    </DatePicker.GridRow>
                  </DatePicker.GridHead>
                  <DatePicker.GridBody>
                    {#each month.weeks as week, w (w)}
                      <DatePicker.GridRow>
                        {#each week as d (d.toString())}
                          <DatePicker.Cell date={d} month={month.value} class="ggb-date-picker__cell">
                            {#if d.month === month.value.month}
                              <DatePicker.Day>
                                {#snippet child({ props: dayProps })}
                                  <span
                                    {...dayProps}
                                    class="ggb-date-picker__day"
                                    onclick={(event) => {
                                      (dayProps.onclick as ((e: MouseEvent) => void) | undefined)?.(event);
                                      // Choosing a day closes the calendar, also when it was already the value.
                                      if (dayProps['data-disabled'] === undefined) setOpen(false);
                                    }}>{dayNumber.format(d.day)}</span
                                  >
                                {/snippet}
                              </DatePicker.Day>
                            {/if}
                          </DatePicker.Cell>
                        {/each}
                      </DatePicker.GridRow>
                    {/each}
                  </DatePicker.GridBody>
                </DatePicker.Grid>
              {/each}
            </div>
          {/snippet}
        </DatePicker.Calendar>
      {/if}
    </div>
  </DatePicker.Root>
</div>
