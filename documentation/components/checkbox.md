# Checkbox

## Overview

A checkbox lets the user turn one option on or off, or state that some of a set is selected: accept the terms, subscribe to a newsletter, select rows of a table. The choice usually takes effect when the form is submitted.

## Anatomy

| #   | Part        | Required | Role                                                                                                    |
| --- | ----------- | -------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Control     | yes      | A square box with a small radius and a thin border; light when off, filled in the accent color when on. |
| 2   | Mark        | state    | The check (checked) or the bar (indeterminate), in the content color of the state; none when off.       |
| 3   | Label       | yes      | The accessible name; it wraps, and a press on it toggles the box.                                       |
| 4   | Description | no       | Help text under the label, the accessible description.                                                  |
| —   | Focus ring  | state    | Drawn outside the box on keyboard focus.                                                                |

A box size (14, 16 or 20 px; it does not change with the density), B gap between box and label (8 px at md in standard density), C first line: the box is centered on the first line of the label.

## When to use

- One independent option that the user confirms with the rest of a form (“Email me a receipt”, “I accept the terms”).
- Several independent options under one question: put the checkboxes in a CheckboxGroup.
- Row selection in a table, with a hidden label and a select-all checkbox that becomes indeterminate.

## When not to use

- A setting that applies at once (notifications on, dark mode): Switch.
- Exactly one choice among options: RadioGroup.
- Several options under one question with a shared label and error: CheckboxGroup.
- An action that runs immediately: Button.

## Best practices

| Guidance | Topic         | Practice                                                                                                      |
| -------- | ------------- | ------------------------------------------------------------------------------------------------------------- |
| Do       | Label         | Write the label as the option in positive form (“Send me updates”), so that checked means yes.                |
| Do       | Description   | Add a description for consequences the label cannot carry (“Sent to the billing address.”).                   |
| Do       | Select all    | Make a select-all checkbox indeterminate while some rows are selected, and check all when it is activated.    |
| Do       | Required      | Put a mandatory acceptance in a Field with `required`, and an error message when it is not checked on submit. |
| Do       | Hidden label  | Keep a label with `hideLabel` in tables: it stays the name (“Select invoice 1024”).                           |
| Don't    | Negative      | Write negative labels (“Don't send me emails”): checked would mean no.                                        |
| Don't    | Instant       | Use a checkbox to apply a setting immediately: use a Switch.                                                  |
| Don't    | Indeterminate | Use indeterminate as a third answer: it only summarizes a set whose items are partly selected.                |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/checkbox/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { Checkbox } from '@ggbrick/svelte';

  let receipt = $state(true);
</script>

<Checkbox label="Email me a receipt" description="Sent to the billing address." bind:checked={receipt} />
```

### A required acceptance

The Field label names the question; the checkbox keeps its own label.

```svelte live
<script lang="ts">
  import { Button, Checkbox, Field } from '@ggbrick/svelte';

  let accepted = $state(false);
  let tried = $state(false);
</script>

<form
  style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)"
  onsubmit={(event) => {
    event.preventDefault();
    tried = true;
  }}
>
  <Field label="Terms" required invalid={tried && !accepted} message="Accept the terms to continue.">
    <Checkbox label="I accept the terms of sale" bind:checked={accepted} />
  </Field>
  <Button type="submit" label="Pay" />
</form>
```

### Select all

The application derives the select-all state from the rows.

```svelte live
<script lang="ts">
  import { Checkbox } from '@ggbrick/svelte';

  const invoices = ['1024', '1025', '1026'];
  let selected = $state<string[]>(['1025']);
  const all = $derived(selected.length === invoices.length);
  const some = $derived(selected.length > 0 && !all);
  const toggle = (id: string, on: boolean) => (selected = on ? [...selected, id] : selected.filter((s) => s !== id));
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm)">
  <Checkbox
    label="Select all invoices"
    checked={all}
    indeterminate={some}
    oncheckedchange={(on) => (selected = on ? [...invoices] : [])}
  />
  {#each invoices as id (id)}
    <Checkbox label={`Select invoice ${id}`} checked={selected.includes(id)} oncheckedchange={(on) => toggle(id, on)} />
  {/each}
</div>
```

### Difficult cases

- Labels that wrap, with the box on the first line; hidden labels in table rows (`#compositions`).
- Every size, selection and condition, hover included (`#matrix`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Checkbox.Root`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Checkbox } from '@ggbrick/svelte';
import type { CheckboxProps, CheckboxSize } from '@ggbrick/svelte';
```

Renders a `<label class="ggb-checkbox">` (plus any class you pass) with `data-size`, `data-selection`, `data-hide-label`, `data-disabled`, `data-readonly` and `data-invalid`, holding the control (a `<button>` with `role="checkbox"`), the label and the description.

| Prop              | Type                             | Default  | Description                                                                                               |
| ----------------- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `checked`         | `boolean` (bindable)             | `false`  | Checked state; bind it with `bind:checked`.                                                               |
| `indeterminate`   | `boolean` (bindable)             | `false`  | Mixed state of a set; activating it checks the box. Not used inside a CheckboxGroup.                      |
| `value`           | `string`                         | `''`     | Submitted with a form when checked. Inside a CheckboxGroup it is required, unique, and decides `checked`. |
| `label`           | `string`                         | required | Visible label and accessible name. Must be non-empty: an empty or blank label throws.                     |
| `hideLabel`       | `boolean`                        | `false`  | Hides label and description visually; they stay the name and description.                                 |
| `description`     | `string`                         | —        | Help text below the label, the accessible description.                                                    |
| `size`            | `'sm' \| 'md' \| 'lg'`           | `'md'`   | Box and text size. Inside a CheckboxGroup the group's size wins.                                          |
| `disabled`        | `boolean`                        | `false`  | Not focusable, ignores activation.                                                                        |
| `readonly`        | `boolean`                        | `false`  | Focusable and announced read-only, ignores activation; still submitted.                                   |
| `invalid`         | `boolean`                        | `false`  | Sets `aria-invalid`; the message belongs to the enclosing Field.                                          |
| `required`        | `boolean`                        | `false`  | Sets `aria-required`; the asterisk belongs to the enclosing Field.                                        |
| `oncheckedchange` | `(checked: boolean) => void`     | —        | Called when the user toggles the box, with the new value.                                                 |
| `ref`             | `HTMLElement \| null` (bindable) | `null`   | The control element.                                                                                      |
| `class`           | `string`                         | —        | Class of the container.                                                                                   |

Every other attribute of the Bits UI `Checkbox.Root` props (`id`, `name`, `form`, `aria-describedby`…) goes to the control, except those the component owns; `name` adds a hidden input for native forms. With an `id`, the label and description take `<id>-label` and `<id>-description`. In a Field, the checkbox is wrapped in a group named by the field label and takes the field's description, message and state. The platform-independent contract ships as `contracts/checkbox.json`.

## Accessibility

The component provides:

- `role="checkbox"` with `aria-checked` (`true`, `false` or `mixed`), named by the label and described by the description.
- Space toggles (Enter does not); disabled boxes leave the tab order, readonly ones stay focusable with `aria-readonly`.
- `aria-invalid` and `aria-required`; in a Field, the field label names the question and the message describes it.
- One target for box, label and description, at least 44 px high; a focus ring on keyboard focus; reduced motion and forced colors handled.

The integration provides:

- Positive, specific labels, and a hidden label that names the row in tables.
- The select-all state derived from the rows, and validation with a message for a required acceptance.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                       |
| ------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component                                            |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                     | A     | Component (check and bar glyphs, not only color)     |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component, on the system surfaces                    |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                            |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component                                            |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Component (44 px target, also with a hidden label)   |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | A     | Component (visible label), integration (its wording) |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                            |

Validated by automated checks in Chromium (axe-core in light and dark, keyboard, accessible names and states, forced colors, target sizes, computed values in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
