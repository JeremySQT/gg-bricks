# Select

## Overview

A select lets the user choose one value from a list of known options, shown collapsed in a field: a country, a language, a time zone, the sort order of a list. It looks and sizes like an InputText, and a press or an arrow key opens the list under it.

## Anatomy

| #   | Part          | Required | Role                                                                                                                                                   |
| --- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Trigger       | yes      | The field that shows the value and opens the list; it fills the width it is given and keeps focus while the list is open.                              |
| 2   | Leading       | no       | One decorative icon before the value.                                                                                                                  |
| 3   | Value         | yes      | The label of the selected option, on one line, shortened with an ellipsis; the placeholder shows while no option is selected.                          |
| 4   | Indicator     | yes      | A downward chevron at the end of the field, drawn by the component and decorative.                                                                     |
| 5   | Panel         | yes      | The surface under the field that holds the options, at least as wide as the field; it scrolls when they do not fit.                                    |
| 6   | Option        | yes      | One per record of `options`: its label on one line, and a check mark on the selected option. A disabled option stays in the list but cannot be chosen. |
| —   | Group heading | no       | A heading above consecutive options that share a `group`; it is never highlighted or chosen.                                                           |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/select.json`.

## When to use

- One value among about five to twenty-five known options in a form, with a Field around it for the label, hint and error.
- A sort order or a category in a filter bar, named by its `label` prop when there is no visible label.
- Options that fall into categories, gathered under group headings.

## When not to use

- Fewer than five options: RadioGroup shows them all at once.
- A long list, or one the user searches by typing: Combobox.
- Several values: CheckboxGroup for a few options, a multi-select (planned) for many.
- Actions or links behind a button: Menu.
- Options with icons, descriptions or other content beside the label: not built in; an option is a value and a label.

## Best practices

| Guidance | Topic       | Practice                                                                                                                    |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label       | Put the select in a Field with a visible label; use the `label` prop alone only when the context names it (a sort order).   |
| Do       | Placeholder | Leave the value empty with a placeholder that asks for a choice (“Choose a country”) when no default suits most users.      |
| Do       | Default     | Preselect a value only when it is a sound default, so that users who skip the field get what they expect.                   |
| Do       | Order       | Order the options alphabetically, by frequency or in their natural order, so that scanning and typing a letter both work.   |
| Do       | Values      | Give each option a stable `value`, such as a code, independent of its label, which may be translated.                       |
| Do       | Groups      | Keep the records of a group next to each other: a heading gathers only consecutive records with the same `group`.           |
| Do       | Size        | Use the size of the inputs and buttons in the same row, so that they line up at the same height.                            |
| Don't    | Placeholder | Use the placeholder as a label: it disappears once a value is chosen and is never the accessible name.                      |
| Don't    | Few options | Hide two to four options in a select: a RadioGroup shows them without a press.                                              |
| Don't    | Long lists  | Make users scroll through dozens of options: a Combobox filters them as they type.                                          |
| Don't    | Context     | Submit the form or navigate when the value changes: a choice must not move the user elsewhere.                              |
| Don't    | Validation  | Expect the select to show an error: set `invalid` and the message on the Field, so that the error is not conveyed by color. |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/select/App.svelte`, not shipped in the package).

### The usual case

The Field names the select and describes it; the placeholder shows until the user chooses.

```svelte live
<script lang="ts">
  import { Field, Select } from '@ggbrick/svelte';
  import type { SelectOptionsRecord } from '@ggbrick/svelte';

  const countries: SelectOptionsRecord[] = [
    { value: 'be', label: 'Belgium' },
    { value: 'ca', label: 'Canada' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'it', label: 'Italy' },
    { value: 'jp', label: 'Japan' },
    { value: 'es', label: 'Spain' },
    { value: 'ch', label: 'Switzerland' }
  ];
  let country = $state('');
</script>

<div style="max-inline-size: 20rem">
  <Field label="Country" description="Where the invoices are sent.">
    <Select options={countries} placeholder="Choose a country" bind:value={country} />
  </Field>
  <p>Value: {country || 'none'}</p>
</div>
```

### Groups and a disabled option

Consecutive records with the same `group` share a heading; a disabled record is reached by the arrow keys but cannot be chosen.

```svelte live
<script lang="ts">
  import { Field, Select } from '@ggbrick/svelte';
  import type { SelectOptionsRecord } from '@ggbrick/svelte';

  const zones: SelectOptionsRecord[] = [
    { value: 'lisbon', label: 'Lisbon (UTC+0)', group: 'Europe' },
    { value: 'london', label: 'London (UTC+0)', group: 'Europe' },
    { value: 'paris', label: 'Paris (UTC+1)', group: 'Europe' },
    { value: 'berlin', label: 'Berlin (UTC+1)', group: 'Europe' },
    { value: 'new-york', label: 'New York (UTC−5)', group: 'Americas' },
    { value: 'chicago', label: 'Chicago (UTC−6)', group: 'Americas' },
    { value: 'sao-paulo', label: 'São Paulo (UTC−3)', group: 'Americas', disabled: true },
    { value: 'tokyo', label: 'Tokyo (UTC+9)', group: 'Asia' },
    { value: 'singapore', label: 'Singapore (UTC+8)', group: 'Asia' }
  ];
</script>

<div style="max-inline-size: 20rem">
  <Field label="Time zone" description="São Paulo opens to new workspaces next month.">
    <Select options={zones} value="paris" />
  </Field>
</div>
```

### Without a Field, with a leading icon

The `label` prop names a select that has no visible label, here a language switcher in a page footer.

```svelte live
<script lang="ts">
  import { Icon, Select } from '@ggbrick/svelte';
  import type { SelectOptionsRecord } from '@ggbrick/svelte';

  // Phosphor Icons 2.1.1 (MIT): globe, standing in for your icon set.
  const globe =
    'M128,24h0A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm88,104a87.61,87.61,0,0,1-3.33,24H174.16a157.44,157.44,0,0,0,0-48h38.51A87.61,87.61,0,0,1,216,128ZM102,168H154a115.11,115.11,0,0,1-26,45A115.27,115.27,0,0,1,102,168Zm-3.9-16a140.84,140.84,0,0,1,0-48h59.88a140.84,140.84,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.84a157.44,157.44,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128ZM154,88H102a115.11,115.11,0,0,1,26-45A115.27,115.27,0,0,1,154,88Zm52.33,0H170.71a135.28,135.28,0,0,0-22.3-45.6A88.29,88.29,0,0,1,206.37,88ZM107.59,42.4A135.28,135.28,0,0,0,85.29,88H49.63A88.29,88.29,0,0,1,107.59,42.4ZM49.63,168H85.29a135.28,135.28,0,0,0,22.3,45.6A88.29,88.29,0,0,1,49.63,168Zm98.78,45.6a135.28,135.28,0,0,0,22.3-45.6h35.66A88.29,88.29,0,0,1,148.41,213.6Z';
  const languages: SelectOptionsRecord[] = [
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ja', label: '日本語' }
  ];
  let language = $state('en');
</script>

{#snippet leading()}<Icon><path d={globe} /></Icon>{/snippet}

<div style="max-inline-size: 12rem">
  <Select label="Interface language" options={languages} bind:value={language} size="sm" {leading} />
</div>
```

### Sizes beside buttons

```svelte live
<script lang="ts">
  import { Button, Select } from '@ggbrick/svelte';
  import type { SelectOptionsRecord } from '@ggbrick/svelte';

  const sizes = ['sm', 'md', 'lg'] as const;
  const orders: SelectOptionsRecord[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'name', label: 'Name, A to Z' },
    { value: 'size', label: 'Largest first' },
    { value: 'owner', label: 'Owner' }
  ];
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm); max-inline-size: 24rem">
  {#each sizes as size (size)}
    <div style="display: flex; gap: var(--ggb-space-control-gap-md)">
      <Select {size} label={`Sort files (${size})`} options={orders} value="newest" />
      <Button {size} label="Apply" intent="neutral" appearance="outline" />
    </div>
  {/each}
</div>
```

### Conditions

A readonly select is focusable and submitted but never opens; a disabled one is skipped and not submitted; the Field shows the error and the required marker.

```svelte live
<script lang="ts">
  import { Field, Select } from '@ggbrick/svelte';
  import type { SelectOptionsRecord } from '@ggbrick/svelte';

  const plans: SelectOptionsRecord[] = [
    { value: 'free', label: 'Free' },
    { value: 'team', label: 'Team' },
    { value: 'business', label: 'Business' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'education', label: 'Education' }
  ];
  const departments: SelectOptionsRecord[] = [
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' }
  ];
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); max-inline-size: 20rem">
  <Field label="Plan"><Select options={plans} value="team" readonly /></Field>
  <Field label="Previous plan"><Select options={plans} value="free" disabled /></Field>
  <Field label="Department" required invalid message="Choose a department.">
    <Select options={departments} placeholder="Choose a department" />
  </Field>
</div>
```

### In a form, with events

`name` submits the value with the form. `onvaluechange` reports only the user's choices, and `bind:open` follows the list.

```svelte live
<script lang="ts">
  import { Button, Field, Select } from '@ggbrick/svelte';
  import type { SelectOptionsRecord } from '@ggbrick/svelte';

  const frequencies: SelectOptionsRecord[] = [
    { value: 'never', label: 'Never' },
    { value: 'daily', label: 'Every day' },
    { value: 'weekly', label: 'Every week' },
    { value: 'biweekly', label: 'Every two weeks' },
    { value: 'monthly', label: 'Every month' }
  ];
  let open = $state(false);
  let changes = $state(0);
  let saved = $state('nothing yet');

  function save(event: SubmitEvent) {
    // The application's submission.
    event.preventDefault();
    saved = String(new FormData(event.currentTarget as HTMLFormElement).get('digest'));
  }
</script>

<form
  onsubmit={save}
  style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); max-inline-size: 20rem"
>
  <Field label="Email digest">
    <Select name="digest" options={frequencies} value="weekly" bind:open onvaluechange={() => changes++} />
  </Field>
  <div><Button type="submit" label="Save" /></div>
  <p>Open: {open ? 'yes' : 'no'} · choices by the user: {changes} · saved: {saved}</p>
</form>
```

### Difficult cases

- Keyboard: Down Arrow, Up Arrow, Enter and Space open on the selected option; arrows stop at the ends, Home, End, Page Up and Page Down jump; typing a letter opens or moves to the matching option; Escape and Tab close without changing the value (`#playground`).
- Pointer: a press toggles the list, the pointer moves the single highlight, a press on a disabled option does nothing, a press outside closes, and focus stays on the field (`#playground`).
- The application sets the value without an event, and invalid, readonly and disabled follow the Field (`#playground`).
- A long list scrolls within its maximum height, opens with the selected option in view and moves by a page with Page Down (`#compositions`).
- In a narrow column the panel is wider than the field for long labels, which end with an ellipsis at its maximum width (`#compositions`).
- A select in a dark subtree and a clipped container takes the dark appearance and is not clipped (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5, on the shared overlay module; Bits UI is not used). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Select } from '@ggbrick/svelte';
import type { SelectProps, SelectOptionsRecord, SelectSize } from '@ggbrick/svelte';
```

Renders a container `<div class="ggb-select">` (plus any class you pass) with `data-size`, `data-disabled`, `data-readonly`, `data-invalid` and `data-open`. It holds the trigger, a `<button type="button" class="ggb-select__trigger" role="combobox">`; a hidden `<input>` when `name` is set; and the panel, a `<div class="ggb-select__panel ggb-overlay">` with the `popover="auto"` attribute, which places it in the top layer above the page (where the platform has no top layer, it is stacked at `layer.dropdown`). There is no portal: the panel stays next to the trigger in the DOM and inherits the brand, appearance and density of that place. It is placed with CSS anchor positioning, or measured by a script where the browser lacks it (`data-positioning="measured"`, `data-placed-side`), flips above when the viewport lacks room below, and enters and leaves like the Menu panel, with a fade only under reduced motion. Inside it, a `role="listbox"` list holds the options, `<div class="ggb-select__option" role="option">` with `aria-selected`, `aria-disabled`, `data-value`, `data-selected`, `data-highlighted` and `data-disabled`, and the groups, `role="group"` named by their heading.

| Prop            | Type                                   | Default   | Description                                                                                                                   |
| --------------- | -------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string` (bindable)                    | `''`      | Value of the selected option; bind it with `bind:value`. A value that matches no option shows the placeholder.                |
| `options`       | `SelectOptionsRecord[]`                | required  | The options, in order. A missing array, or a record without a string `value` or a non-empty `label`, throws.                  |
| `placeholder`   | `string`                               | —         | Shown in the field while no option is selected; never the accessible name.                                                    |
| `label`         | `string`                               | —         | Accessible name when the select is not in a Field (not displayed); required then, an empty one throws. A Field wins.          |
| `size`          | `'sm' \| 'md' \| 'lg'`                 | `'md'`    | Height, text and spacing, matching an InputText of the same size; the option text follows it.                                 |
| `open`          | `boolean` (bindable)                   | `false`   | Whether the list is shown; bind it with `bind:open`. Setting it from the application shows or hides the list without events.  |
| `disabled`      | `boolean`                              | `false`   | Not focusable, never opens, not submitted.                                                                                    |
| `readonly`      | `boolean`                              | `false`   | Focusable, shows its value and is submitted, but never opens and the value cannot change. Ignored when disabled.              |
| `invalid`       | `boolean`                              | `false`   | Sets `aria-invalid`; the message belongs to the enclosing Field.                                                              |
| `required`      | `boolean`                              | `false`   | Sets `aria-required`; the asterisk belongs to the enclosing Field.                                                            |
| `name`          | `string`                               | —         | Submits the value under this name with the enclosing form, through a hidden input.                                            |
| `leading`       | `Snippet`                              | —         | One decorative Icon before the value, sized and colored by the select.                                                        |
| `onvaluechange` | `(value: string) => void`              | —         | Called with the value of the option the user chooses, when it differs from the current one; not when the application sets it. |
| `onopenchange`  | `(open: boolean) => void`              | —         | Called when the user opens or closes the list: the trigger, an opening key, a choice, Escape, Tab, a press outside.           |
| `id`            | `string`                               | generated | id of the trigger; inside a Field, the field's control id, which its label targets.                                           |
| `ref`           | `HTMLButtonElement \| null` (bindable) | `null`    | The trigger element.                                                                                                          |
| `class`         | `string`                               | —         | Class of the container.                                                                                                       |

`SelectOptionsRecord` is `{ value: string; label: string; disabled?: boolean; group?: string }`: consecutive records with the same non-empty `group` are gathered under one heading, and records without `group` are not grouped.

Every other attribute of `HTMLButtonAttributes` (`onfocus`, `onblur`, `form`, `data-*`…) goes to the trigger `<button>`; `aria-describedby` is added after the Field's description and message, and `onkeydown` is called before the component handles the key. The component owns `children`, `role`, `value`, `type`, `disabled`, `popovertarget`, `aria-haspopup`, `aria-expanded`, `aria-controls` and `aria-activedescendant`, and sets `aria-label`, `aria-labelledby`, `aria-invalid`, `aria-required`, `aria-readonly` and `onkeyup` itself. Inside a Field, the select takes the field's label as its name, its description and message, and its required, invalid and disabled state; a press on the Field label opens the list, as it activates any button. The platform-independent contract, with its `panel`, `option` and `group` children, ships as `contracts/select.json`.

## Accessibility

The component provides:

- The select-only combobox pattern: the trigger is a combobox button with `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`, named by the Field label or the `label` prop and showing the selected option as its value; the list box is named the same way, with options, groups named by their heading, `aria-selected` and `aria-disabled`.
- Focus that stays on the trigger: the highlighted option is its `aria-activedescendant`, and presses in the list never take focus.
- On the closed trigger, Down Arrow, Up Arrow, Enter and Space open the list on the selected option, or on the first enabled one; Home and End open it on the first or last enabled option; typing characters opens it on the next option whose label starts with them. The value never changes while the list is closed.
- In the open list, Down and Up Arrow move the highlight without wrapping; Home and End go to the first and last option; Page Down and Page Up move by the number of visible options; typing moves to the matching option; Enter and Space choose the highlighted option. Disabled options are reached and announced unavailable, but not chosen.
- Choosing closes the list and keeps focus on the trigger; Escape closes without changing the value; Tab closes without changing the value and moves focus on; a press outside closes the list.
- A selected option marked by a check mark as well as its color; the highlighted option kept visible in a scrolling list; a visible focus ring whatever the input modality, kept while the list is open; an interaction target taller than the field where needed; system colors and the system highlight in forced colors; no transitions and a fade only under reduced motion.

The integration provides:

- A visible label (Field) whenever the context does not name the select, and option labels that make sense on their own.
- Validation, error messages and their timing, through the Field.
- A choice that does not submit the form or navigate by itself, and an explanation of why an option is disabled when it is not obvious.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                                    |
| ------------------------------------------------------------------------------------------------------------------ | ----- | --------------------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)            | A     | Component (name and description from the Field, list box, named groups)           |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                                | A     | Component (check mark on the selected option); integration (error text via Field) |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, on the system surfaces (value, placeholder, options, headings)         |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                           | AA    | Component (panel capped by the viewport, scrolling list)                          |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                     | AA    | Component (field border, as InputText; check mark at least 3:1)                   |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                                         |
| [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)                        | A     | Component (Escape and Tab close)                                                  |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                  | A     | Component (focus stays on the trigger)                                            |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component (focus ring, highlighted option)                                        |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Component (highlighted option kept visible); integration (sticky bars)            |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component (44 px target height in every size, options across the panel)           |
| [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                                        | A     | Integration (no submission or navigation on a choice)                             |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)                | A     | Integration, through Field                                                        |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)            | A     | Integration (Field label and description)                                         |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                                         |

Beyond A and AA, the fade without movement under reduced motion serves [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA).

Validated by automated checks in Chromium (opening keys and the starting highlight, no wrapping, disabled options reached but not chosen, Escape and Tab, typeahead, Home and End, pointer toggle, highlight and press outside, readonly and disabled, a silent value set by the application, roles, names, value, description and invalid state, panel width, scrolling and Page Down, the offset clear of the focus ring, a dark subtree and a clipping container, the focus ring, a forced-colors capture, axe-core in light and dark, computed values in four representative contexts), by server rendering checks of the markup, and by a smoke test in Firefox and WebKit (Down Arrow opens, Enter chooses and keeps focus on the trigger, the panel stays inside a narrow viewport); no assistive-technology test yet. This list is not a conformance claim.
