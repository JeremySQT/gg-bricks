# CheckboxGroup

## Overview

A checkbox group gathers several related checkboxes that answer one question, any number of which can be checked: notification channels, filters, delivery days. A required group asks for at least one, and says so in words in its Field.

## Anatomy

| #   | Part     | Required | Role                                                                                                            |
| --- | -------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | Checkbox | yes      | One option, a Checkbox with its own label and a unique value; two at least. Its parts are on the Checkbox page. |
| 2   | Checked  | state    | Any number of checkboxes can be checked, none included; the value lists them in the order of the page.          |
| 3   | Order    | yes      | The checkboxes follow the order of the source; each one is a Tab stop and Space toggles it.                     |

A gap: vertical, `space.content.sm` between checkboxes (4, 8 or 12 px in compact, standard and comfortable density); horizontal, `space.content.lg` between checkboxes (12, 16 or 24 px) and `space.content.sm` between lines.

## When to use

- A question with several possible answers, in a Field (“How can we reach you?”).
- A required question that needs at least one answer.
- Optional preferences or filters listed under one label, or a short row of options (days of the week).

## When not to use

- One independent option: Checkbox.
- Exactly one choice: RadioGroup.
- Settings applied at once: Switch items.
- Long or searchable lists of options: a multi-select (planned).
- Limits such as “at most three”: not built in; validate them in the application.

## Best practices

| Guidance | Topic       | Practice                                                                                                            |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Do       | Field       | Put the group in a Field: its label asks the question and names the group, its message explains an error.           |
| Do       | Required    | State the requirement in words in the Field description (“Select at least one channel.”) and set `required`.        |
| Do       | Validation  | Check `value.length` in the application and set the Field invalid with a message when nothing is checked.           |
| Do       | Select all  | Put a select-all checkbox outside the group, above it, and derive its checked and indeterminate state from `value`. |
| Do       | Horizontal  | Use `orientation="horizontal"` for short labels only; it wraps when space runs out.                                 |
| Don't    | Required    | Mark each checkbox required: that would announce every option as mandatory.                                         |
| Don't    | Values      | Give two checkboxes the same value, or leave one without a value: the group needs unique values.                    |
| Don't    | Mixed state | Make checkboxes inside the group indeterminate: a summary of the group stays outside it.                            |

## Examples

The review page `examples/checkbox-group/App.svelte` covers every case.

### A required question

```svelte live
<script lang="ts">
  import { Button, Checkbox, CheckboxGroup, Field } from '@ggbrick/svelte';

  let channels = $state<string[]>([]);
  let tried = $state(false);
</script>

<form
  style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)"
  onsubmit={(event) => {
    event.preventDefault();
    tried = true;
  }}
>
  <Field
    label="How can we reach you?"
    description="Select at least one channel."
    required
    invalid={tried && channels.length === 0}
    message="Select at least one channel."
  >
    <CheckboxGroup bind:value={channels}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="phone" label="Phone call" />
      <Checkbox value="post" label="Post" description="Invoices only." />
    </CheckboxGroup>
  </Field>
  <Button type="submit" label="Continue" />
</form>
```

### A horizontal row

```svelte live
<script lang="ts">
  import { Checkbox, CheckboxGroup, Field } from '@ggbrick/svelte';

  let days = $state<string[]>(['mon', 'wed']);
</script>

<Field label="Delivery days">
  <CheckboxGroup orientation="horizontal" bind:value={days}>
    <Checkbox value="mon" label="Monday" />
    <Checkbox value="tue" label="Tuesday" />
    <Checkbox value="wed" label="Wednesday" />
    <Checkbox value="thu" label="Thursday" />
    <Checkbox value="fri" label="Friday" />
  </CheckboxGroup>
</Field>
```

### Select all, outside the group

```svelte live
<script lang="ts">
  import { Checkbox, CheckboxGroup } from '@ggbrick/svelte';

  const toppings = ['cheese', 'ham', 'mushrooms'];
  let picked = $state<string[]>(['ham']);
  const all = $derived(picked.length === toppings.length);
  const some = $derived(picked.length > 0 && !all);
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm)">
  <Checkbox
    label="All toppings"
    checked={all}
    indeterminate={some}
    oncheckedchange={(on) => (picked = on ? [...toppings] : [])}
  />
  <div style="padding-inline-start: var(--ggb-space-content-lg)">
    <CheckboxGroup label="Toppings" bind:value={picked}>
      <Checkbox value="cheese" label="Cheese" />
      <Checkbox value="ham" label="Ham" />
      <Checkbox value="mushrooms" label="Mushrooms" />
    </CheckboxGroup>
  </div>
</div>
```

### Difficult cases

- The value keeps the order of the page whatever the order of the clicks; a value set by the application emits nothing (`#playground`).
- A horizontal group wrapping in a narrow column, still in source order (`#compositions`).
- Every size and condition (`#matrix`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Checkbox.Group`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { CheckboxGroup, Checkbox } from '@ggbrick/svelte';
import type { CheckboxGroupProps, CheckboxGroupOrientation, CheckboxGroupSize } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-checkbox-group">` (plus any class you pass) with `role="group"`, `data-orientation`, `data-size`, `data-invalid` and `data-required`, holding the Checkbox children.

| Prop            | Type                             | Default      | Description                                                                                                                  |
| --------------- | -------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string[]` (bindable)            | `[]`         | Values of the checked checkboxes, in their order on the page; bind it with `bind:value`. Unknown values are ignored.         |
| `label`         | `string`                         | —            | Accessible name when the group is not in a Field (not displayed); required then, an empty one throws. A Field wins.          |
| `orientation`   | `'vertical' \| 'horizontal'`     | `'vertical'` | `vertical`: stacked. `horizontal`: on one line, wrapping when space runs out.                                                |
| `size`          | `'sm' \| 'md' \| 'lg'`           | `'md'`       | Size of every checkbox.                                                                                                      |
| `disabled`      | `boolean`                        | `false`      | Disables every checkbox.                                                                                                     |
| `readonly`      | `boolean`                        | `false`      | Checkboxes stay focusable and announced read-only; nothing can be checked or unchecked.                                      |
| `invalid`       | `boolean`                        | `false`      | Sets `aria-invalid` on every checkbox; the message of the enclosing Field describes the group.                               |
| `required`      | `boolean`                        | `false`      | At least one checkbox must be checked. Sets `data-required` only: no checkbox is announced as required; say it in the Field. |
| `children`      | `Snippet`                        | required     | Two or more Checkbox components, each with a unique `value`.                                                                 |
| `onvaluechange` | `(value: string[]) => void`      | —            | Called when the user checks or unchecks a checkbox, with the new list; not when the application sets `value`.                |
| `ref`           | `HTMLElement \| null` (bindable) | `null`       | The group element.                                                                                                           |

Every other attribute of the Bits UI `Checkbox.Group` props (`id`, `name`, `class`, `aria-describedby`…) goes to the group element, except those the component owns; `name` adds hidden inputs for native forms. The checkboxes take the group's size, readonly, invalid and disabled state; a Checkbox without a value inside a group throws. Inside a Field, the group is named by the field label and described by its description and message. The platform-independent contract ships as `contracts/checkbox-group.json`.

## Accessibility

The component provides:

- `role="group"` named by the Field label or the `label` prop and described by the Field texts; each checkbox keeps its own label as its name.
- Every enabled checkbox is a Tab stop in source order, and Space toggles it; a readonly group stays focusable and ignores activation; a disabled group leaves the tab order.
- `aria-invalid` on every checkbox, and no `aria-required` on any of them: “at least one” is stated in words, so that no option is announced as mandatory.

The integration provides:

- The requirement in the Field label or description, the validation (nothing checked) and the message.
- The state of a select-all checkbox outside the group.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                   |
| ------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (group named by the Field, checkboxes by their labels) |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component, on the system surfaces                                |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                                        |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                       | A     | Component (source order)                                         |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component                                                        |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)     | A     | Integration, through Field                                       |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | A     | Integration (the requirement stated in words)                    |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                                        |

Validated by automated checks in Chromium (axe-core in light and dark, tab order, Space, value order, accessible names and descriptions, no `aria-required` on the checkboxes, forced colors, computed values in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
