# Combobox

## Overview

A combobox lets the user choose one value from a long list by typing to narrow it: a country among hundreds, a person to assign, a project, a city found by a search on a server. It looks like an InputText; the value is always one of the options, never the free text typed.

## Anatomy

| #   | Part          | Required | Role                                                                                                                                                                                |
| --- | ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Container     | yes      | The field that holds the icon, the text and the indicator; it looks like an InputText of the same size and fills the width it is given.                                             |
| 2   | Leading       | no       | One decorative icon before the text, such as a magnifying glass; a press on it focuses the input and opens the list.                                                                |
| 3   | Input         | yes      | The text the user types to narrow the list, or the selected option's label, on one line; the placeholder shows while it is empty.                                                   |
| 4   | Indicator     | yes      | A downward chevron at the end; a press on it opens or closes the list and keeps focus in the input; it is not a separate tab stop.                                                  |
| 5   | Panel         | yes      | The surface under the field that holds the matching options, at least as wide as the field; it scrolls when they do not fit.                                                        |
| 6   | Option        | yes      | One per matching record of `options`: its label on one line, shortened with an ellipsis, and a check mark on the selected option. A disabled option is listed but cannot be chosen. |
| —   | Group heading | no       | A heading above consecutive options that share a `group`; it is never highlighted or chosen, and hidden when none of its options match.                                             |
| —   | Empty label   | state    | Shown in the panel instead of the options when nothing matches, and announced politely.                                                                                             |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/combobox.json`.

## When to use

- One value from a list long enough that typing is faster than scrolling: a country, a city, a time zone.
- A person, a project or a customer found by part of the name, in a list the browser filters.
- Options searched on a server as the user types, with `filter="none"`.

## When not to use

- A short list of known options that needs no search: Select; under five options, RadioGroup.
- Free text, with or without suggestions, or a value that may be missing from the list: InputText; creatable options are not built in.
- Several values shown as tags: MultiSelect (planned).
- A list of actions rather than a value: Menu.

## Best practices

| Guidance | Topic       | Practice                                                                                                                               |
| -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label       | Put the combobox in a Field with a visible label; use the `label` prop alone only when the context names it.                           |
| Do       | Placeholder | Say what to type (“Search a country”) or leave it out: it disappears as soon as the user types and is never the name.                  |
| Do       | Values      | Give each option a stable `value` (an id or a code) and the label users know: the value is bound and submitted, the label shown.       |
| Do       | Groups      | Keep the records of a group next to each other: a heading gathers consecutive records with the same `group` only.                      |
| Do       | Server      | With `filter="none"`, update `options` from `oninputchange`, wait for a pause in typing, and set an `emptyLabel` that fits the search. |
| Do       | Empty label | Translate `emptyLabel` with the rest of the interface; its default is the English “No results”.                                        |
| Do       | Size        | Use the size of the InputTexts and Buttons in the same form or row, so that they line up at the same height.                           |
| Don't    | Free text   | Read `inputValue` as the user's answer: only a chosen option sets `value`, and other text is restored when focus leaves.               |
| Don't    | Short lists | Use a combobox for a handful of options: a Select shows them all without typing.                                                       |
| Don't    | Selection   | Drop the selected option from `options` during a server search: Escape and leaving the field restore the text from its record.         |
| Don't    | Disabled    | Fill the list with disabled options: remove what can never be chosen, and say elsewhere why an option is unavailable.                  |
| Don't    | Loading     | Expect a loading indicator in the panel: show progress or a failed search next to the field, in the application.                       |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/combobox/App.svelte`, not shipped in the package).

### The usual case

Typing filters the list, ignoring case and accents, and highlights the first match, so that Enter chooses it. `name` submits the value with a form.

```svelte live
<script lang="ts">
  import { Combobox, Field } from '@ggbrick/svelte';
  import type { ComboboxOptionsRecord } from '@ggbrick/svelte';

  const countries: ComboboxOptionsRecord[] = [
    { value: 'AR', label: 'Argentina' },
    { value: 'AT', label: 'Austria' },
    { value: 'BE', label: 'Belgium' },
    { value: 'BR', label: 'Brazil' },
    { value: 'CA', label: 'Canada' },
    { value: 'DK', label: 'Denmark' },
    { value: 'FI', label: 'Finland' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'IE', label: 'Ireland' },
    { value: 'IT', label: 'Italy' },
    { value: 'JP', label: 'Japan' },
    { value: 'MX', label: 'Mexico' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'NO', label: 'Norway' },
    { value: 'PT', label: 'Portugal' },
    { value: 'RE', label: 'Réunion' },
    { value: 'ES', label: 'Spain' },
    { value: 'SE', label: 'Sweden' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'TR', label: 'Türkiye' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'US', label: 'United States' }
  ];
  let country = $state('');
</script>

<div style="max-inline-size: 20rem">
  <Field label="Country" description="Where the company is registered.">
    <Combobox options={countries} placeholder="Search a country" name="country" bind:value={country} />
  </Field>
  <p>Value: {country || 'none'}</p>
</div>
```

### Groups and a disabled option

Consecutive records with the same `group` share a heading. A disabled option is reached by the arrow keys but cannot be chosen; the description says why.

```svelte live
<script lang="ts">
  import { Combobox, Field } from '@ggbrick/svelte';
  import type { ComboboxOptionsRecord } from '@ggbrick/svelte';

  const people: ComboboxOptionsRecord[] = [
    { value: 'u-104', label: 'Ada Lovelace', group: 'Design' },
    { value: 'u-221', label: 'Grace Hopper', group: 'Design' },
    { value: 'u-087', label: 'Alan Turing', group: 'Engineering' },
    { value: 'u-310', label: 'Katherine Johnson', group: 'Engineering', disabled: true },
    { value: 'u-152', label: 'Margaret Hamilton', group: 'Engineering' }
  ];
  let assignee = $state('u-087');
</script>

<div style="max-inline-size: 20rem">
  <Field label="Assignee" description="Katherine Johnson is on leave until Monday.">
    <Combobox options={people} placeholder="Search a person" bind:value={assignee} />
  </Field>
</div>
```

### A search on a server

With `filter="none"` the combobox shows `options` as given; the application searches from `oninputchange` and replaces them. The selected option stays among them so that its label can be restored.

```svelte live
<script lang="ts">
  import { Combobox, Field } from '@ggbrick/svelte';
  import type { ComboboxOptionsRecord } from '@ggbrick/svelte';

  // Stand-in for the server: the first six cities starting with the text, after a short delay.
  const cities = ['Amsterdam', 'Athens', 'Barcelona', 'Berlin', 'Bordeaux', 'Brussels', 'Budapest', 'Lisbon', 'London'];
  const more = ['Lyon', 'Madrid', 'Marseille', 'Milan', 'Munich', 'Paris', 'Porto', 'Prague', 'Rome', 'Vienna'];
  function api(query: string): Promise<ComboboxOptionsRecord[]> {
    const q = query.trim().toLowerCase();
    const found = q ? [...cities, ...more].filter((city) => city.toLowerCase().startsWith(q)).slice(0, 6) : [];
    return new Promise((resolve) =>
      setTimeout(() => resolve(found.map((city) => ({ value: city.toLowerCase(), label: city }))), 200)
    );
  }

  let results = $state<ComboboxOptionsRecord[]>([]);
  let selected = $state<ComboboxOptionsRecord>();
  let value = $state('');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latest = '';

  const options = $derived(
    selected && !results.some((o) => o.value === selected?.value) ? [...results, selected] : results
  );

  function search(text: string) {
    clearTimeout(timer);
    latest = text;
    timer = setTimeout(async () => {
      const found = await api(text);
      if (text === latest) results = found;
    }, 150);
  }
</script>

<div style="max-inline-size: 20rem">
  <Field label="Office" description="Type the first letters of a city.">
    <Combobox
      {options}
      filter="none"
      placeholder="Search a city"
      emptyLabel="No city starts with these letters"
      bind:value
      oninputchange={search}
      onvaluechange={(v) => (selected = options.find((o) => o.value === v))}
    />
  </Field>
</div>
```

### Sizes, with a leading icon

```svelte live
<script lang="ts">
  import { Combobox, Icon } from '@ggbrick/svelte';
  import type { ComboboxOptionsRecord } from '@ggbrick/svelte';

  // Phosphor Icons 2.1.1 (MIT): magnifying glass.
  const search =
    'M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z';
  const sizes = ['sm', 'md', 'lg'] as const;
  const zones: ComboboxOptionsRecord[] = [
    { value: 'America/New_York', label: 'New York' },
    { value: 'America/Sao_Paulo', label: 'São Paulo' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Kolkata', label: 'Kolkata' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Australia/Sydney', label: 'Sydney' }
  ];
</script>

{#snippet leading()}<Icon><path d={search} /></Icon>{/snippet}

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm); max-inline-size: 20rem">
  {#each sizes as size (size)}
    <Combobox {size} label={`Time zone (${size})`} placeholder="Search a time zone" options={zones} {leading} />
  {/each}
</div>
```

### Conditions

A readonly combobox stays focusable and submitted but never opens; a disabled one is skipped and not submitted. The error message and the asterisk belong to the Field.

```svelte live
<script lang="ts">
  import { Combobox, Field } from '@ggbrick/svelte';
  import type { ComboboxOptionsRecord } from '@ggbrick/svelte';

  const languages: ComboboxOptionsRecord[] = [
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' }
  ];
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); max-inline-size: 20rem">
  <Field label="Account language"><Combobox options={languages} value="fr" readonly /></Field>
  <Field label="Workspace language" disabled><Combobox options={languages} value="en" /></Field>
  <Field label="Invoice language" required invalid message="Choose a language from the list.">
    <Combobox options={languages} placeholder="Search a language" />
  </Field>
</div>
```

### Value, text and open state

Setting `value` from the application shows the option's label without calling `onvaluechange`; the callbacks report only what the user does.

```svelte live
<script lang="ts">
  import { Button, Combobox } from '@ggbrick/svelte';
  import type { ComboboxOptionsRecord } from '@ggbrick/svelte';

  const currencies: ComboboxOptionsRecord[] = [
    { value: 'CHF', label: 'Swiss franc' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'Pound sterling' },
    { value: 'JPY', label: 'Japanese yen' },
    { value: 'USD', label: 'US dollar' }
  ];
  let value = $state('');
  let text = $state('');
  let open = $state(false);
  let changes = $state(0);
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm); max-inline-size: 20rem">
  <Combobox
    label="Currency"
    options={currencies}
    bind:value
    bind:inputValue={text}
    bind:open
    onvaluechange={() => changes++}
  />
  <Button label="Use euro" intent="neutral" appearance="outline" onactivate={() => (value = 'EUR')} />
  <p>Value: {value || 'none'} · text: {text} · open: {open ? 'yes' : 'no'} · changes by the user: {changes}</p>
</div>
```

### Difficult cases

- Typing “cote” finds “Côte d'Ivoire” in a list of 43 countries; the list scrolls and keeps the highlighted option visible (`#playground`).
- A match that is disabled is not highlighted by typing, is reached by the arrows, and Enter does nothing on it (`#playground`).
- Escape restores the text; leaving with edited text restores the selected label; emptying the text and leaving clears the value (`#playground`).
- A value set by the application updates the text without an event (`#playground`, “Select Japan from the app”).
- A server search with a delay, an empty result and its own `emptyLabel`; groups; readonly and disabled (`#compositions`).
- A combobox in a dark subtree and a clipped container takes the dark appearance and its panel is not clipped (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5, on the shared overlay module; Bits UI is not used). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Combobox } from '@ggbrick/svelte';
import type { ComboboxProps, ComboboxOptionsRecord, ComboboxFilter, ComboboxSize } from '@ggbrick/svelte';
```

Renders a container `<div class="ggb-combobox">` (plus any class you pass) with `data-size`, `data-disabled`, `data-readonly`, `data-invalid` and `data-open`. It holds a `<div class="ggb-combobox__field">` with the leading icon, a native `<input type="text" role="combobox">` and the indicator; a hidden `<input>` when `name` is set; and the panel, a `<div class="ggb-combobox__panel ggb-overlay">` with the `popover="manual"` attribute, which places it in the top layer above the page without taking focus from the input; where the platform has no top layer, it is stacked at `layer.dropdown`. There is no portal: the panel stays next to the field in the DOM and inherits the brand, appearance and density of that place. It carries `data-side` and `data-align`, is placed with CSS anchor positioning or measured by a script where the browser lacks it (`data-positioning="measured"`, `data-placed-side`), flips above the field and shifts along the edge when the viewport lacks room. It holds a `<div class="ggb-combobox__list" role="listbox">` named like the input, with `role="option"` elements (`aria-selected`, `aria-disabled`, `data-value`, `data-selected`, `data-highlighted`, `data-disabled`) and `role="group"` elements named by their heading, then a `<div class="ggb-combobox__empty" role="status">` that shows `emptyLabel` when nothing matches. The panel enters by fading in and moving slightly away from the field and leaves by fading out, in CSS only; under reduced motion it only fades.

| Prop            | Type                                  | Default        | Description                                                                                                                           |
| --------------- | ------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `options`       | `ComboboxOptionsRecord[]`             | required       | The options, in order: `{ value: string; label: string; disabled?: boolean; group?: string }`. A blank label throws.                  |
| `value`         | `string` (bindable)                   | `''`           | Value of the selected option, always one of the options or empty; bind it with `bind:value`.                                          |
| `inputValue`    | `string` (bindable)                   | `''`           | Text of the input; it shows the selected option's label when a value is set. Bind it with `bind:inputValue`.                          |
| `filter`        | `'contains' \| 'none'`                | `'contains'`   | `contains` lists the options whose label contains the text, ignoring case and accents; `none` shows `options` as given.               |
| `placeholder`   | `string`                              | —              | Shown while the text is empty. Never the accessible name.                                                                             |
| `label`         | `string`                              | —              | Accessible name when the combobox is not in a Field (not displayed); required then, an empty one throws. A Field wins.                |
| `emptyLabel`    | `string`                              | `'No results'` | Shown in the panel and announced politely when no option matches.                                                                     |
| `size`          | `'sm' \| 'md' \| 'lg'`                | `'md'`         | Height, text and spacing of the field, matching an InputText of the same size, and the text size of the options.                      |
| `open`          | `boolean` (bindable)                  | `false`        | Whether the list is shown; bind it with `bind:open`. Setting it from the application shows or hides the list without events.          |
| `disabled`      | `boolean`                             | `false`        | Not focusable, never opens, not submitted.                                                                                            |
| `readonly`      | `boolean`                             | `false`        | Focusable, its text selectable and submitted; it never opens and the value cannot change.                                             |
| `invalid`       | `boolean`                             | `false`        | Sets `aria-invalid`; the message belongs to the enclosing Field.                                                                      |
| `required`      | `boolean`                             | `false`        | Sets the native `required`; the asterisk belongs to the enclosing Field.                                                              |
| `name`          | `string`                              | —              | Submits the value, not the text, under this name through a hidden input.                                                              |
| `leading`       | `Snippet`                             | —              | One decorative Icon before the text, sized and colored by the field.                                                                  |
| `onvaluechange` | `(value: string) => void`             | —              | Called when the user chooses an option other than the current value, or with `''` when the user empties the text and leaves.          |
| `oninputchange` | `(text: string) => void`              | —              | Called with the text on every user edit (typing, pasting, deleting); not when the application sets `inputValue`.                      |
| `onopenchange`  | `(open: boolean) => void`             | —              | Called when the user opens or closes the list: typing, a key, a press on the field, a choice, Escape, focus leaving, a press outside. |
| `id`            | `string`                              | generated      | id of the text input; inside a Field, the field's id.                                                                                 |
| `ref`           | `HTMLInputElement \| null` (bindable) | `null`         | The text input.                                                                                                                       |
| `class`         | `string`                              | —              | Class of the container.                                                                                                               |

Every other attribute of `HTMLInputAttributes` (`autofocus`, `onfocus`, `onblur`, `data-*`…) goes to the text `<input>`, except those the component owns: `children`, `role`, `value`, `type`, `size`, `disabled`, `readonly`, `required`, `aria-autocomplete`, `aria-expanded`, `aria-controls` and `aria-activedescendant`. The component also sets `autocomplete="off"`, `aria-label`, `aria-labelledby`, `aria-invalid` and its own `oninput` (use `oninputchange`); an `onkeydown` you pass runs before the component handles the key, and an `aria-describedby` you pass is joined to the Field's description. Inside a Field, the combobox takes the field's id, its label (for the input and the list box), its description and message, and its required, invalid and disabled state. An `options` that is not an array, or a record without a string `value`, throws as well, on the server and in the browser. The platform-independent contract, with its `panel`, `option` and `group` children, ships as `contracts/combobox.json`.

## Accessibility

The component provides:

- The combobox pattern with list autocomplete: a text input with `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls` on a list box named like the input; the highlighted option is the input's active descendant, and focus stays in the input while the list is open.
- Options exposed as selected or unavailable, groups named by their heading, and a check mark on the selected option besides its color.
- Typing opens the list and highlights the first enabled match; Down Arrow opens on the selected option or the first enabled one, Up Arrow on the selected option or the last enabled one; Alt with Down Arrow opens without a highlight.
- In the open list, Down and Up Arrow move the highlight without wrapping, Page Down and Page Up move it by the visible options, and Enter chooses; disabled options are reached and announced unavailable but not chosen. Home, End and the horizontal arrows keep editing the text.
- Escape closes the list and restores the text; Tab closes it and moves on without choosing; a press outside closes it. Leaving restores the selected label, or clears the value when the text is empty.
- The indicator toggles the list by pointer and is not a separate tab stop; the empty label is a polite status; the highlighted option is kept visible in a scrolling panel.
- A visible focus ring on the field whatever the input modality, the system highlight colors in forced colors, and motion reduced to a fade under reduced motion.

The integration provides:

- A visible label (Field) whenever the context does not name the combobox, and option labels that make sense on their own.
- Validation, error messages through the Field, and a translated `emptyLabel`.
- For a server search, a message when a request is slow or fails, and the selected option kept among `options`.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                                               |
| ------------------------------------------------------------------------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)            | A     | Component (combobox, list box, options, named groups; name and description from the Field)   |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                                | A     | Component (check mark on the selected option); integration (error message through the Field) |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, on the system surfaces (text, placeholder, options, headings, empty label)        |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                           | AA    | Component (panel width capped by the viewport, scrolling list)                               |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                     | AA    | Component (field border as InputText, check mark at least 3:1)                               |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                                                    |
| [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)                        | A     | Component (Escape and Tab close)                                                             |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                  | A     | Component (focus stays in the input; the indicator is not a tab stop)                        |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component (the field's focus ring and the highlighted option)                                |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Component (highlighted option kept visible); integration (sticky bars)                       |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component (field target at the minimum height in every size, options across the panel)       |
| [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                                        | A     | Component (typing only filters; choosing sets the value without submitting)                  |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)                | A     | Integration, through Field                                                                   |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)            | A     | Integration (Field label and description)                                                    |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                                                    |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                          | AA    | Component (empty label); integration (search progress and failures)                          |

Beyond A and AA, the fade without movement under reduced motion serves [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA).

Validated by automated checks in Chromium (filtering that ignores case and accents with the first match highlighted, choosing by Enter and by pointer, arrows without wrapping, disabled options reached but not chosen, Escape, leaving that restores the label or clears the value, the empty label as a status, the indicator toggle and a press outside, `filter="none"`, groups, readonly and disabled, a silent application value, role, name, autocomplete and expanded state, axe-core in light and dark, no horizontal overflow on a phone, computed values in four representative contexts), by server rendering tests, and by a smoke test in Chromium, Firefox and WebKit (typing and Enter choose with focus kept in the input; the panel stays inside a narrow viewport). Forced colors are handled in CSS but not yet checked by a test; no assistive-technology test yet. This list is not a conformance claim.
