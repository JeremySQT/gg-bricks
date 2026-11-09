# RadioGroup

## Overview

A radio group asks for exactly one choice among a few options that all stay visible: a delivery speed, a plan, a payment method. It holds Radio options, stacks them or places them on a wrapping row, and once an option is selected the user cannot return to no selection.

## Anatomy

| #   | Part           | Required | Role                                                                                                            |
| --- | -------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | Radio          | yes      | One option, a Radio with its own label and optional description; two at least. Its parts are on the Radio page. |
| 2   | Selected radio | state    | Exactly one radio is on once the user has chosen; selecting another turns it off.                               |
| 3   | Order          | yes      | The radios follow the order of the source; the arrow keys move through them in that order and wrap.             |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/radio-group.json`.

## When to use

- Two to about six mutually exclusive options that are worth reading side by side, in a Field.
- Options that need a description each (plans, shipping speeds).
- A short horizontal choice of two or three words (Yes / No, Monthly / Yearly).

## When not to use

- Many options, or options the user knows by name (a country): Select (planned).
- Several options that can all be checked: CheckboxGroup.
- One on/off option: Checkbox, or Switch for a setting applied at once.
- Options shown as buttons or cards: SegmentedControl or card selection (planned).

## Best practices

| Guidance | Topic      | Practice                                                                                                        |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| Do       | Field      | Put the group in a Field: its label asks the question and names the group, its message explains an error.       |
| Do       | Labels     | Keep the labels short and parallel, and add descriptions when options differ by more than their name.           |
| Do       | Default    | Preselect the most common or safest option when there is one; otherwise mark the question required.             |
| Do       | Order      | Order options logically (cheapest to fastest, smallest to largest), not alphabetically by default.              |
| Do       | Horizontal | Use `orientation="horizontal"` only for two or three short options.                                             |
| Don't    | None       | Count on the user returning to no selection: add an explicit option (“No preference”) when it must be possible. |
| Don't    | Many       | Put more than about six radios in a group: use a select.                                                        |
| Don't    | Action     | Run an action or navigate when a radio is selected: apply the choice with the form.                             |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/radio-group/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { Field, Radio, RadioGroup } from '@ggbrick/svelte';

  let speed = $state('standard');
</script>

<Field label="Delivery speed" description="Express ships tomorrow.">
  <RadioGroup bind:value={speed}>
    <Radio value="standard" label="Standard" description="3 to 5 business days" />
    <Radio value="express" label="Express" description="Next business day" />
    <Radio value="pickup" label="Pick up in store" />
  </RadioGroup>
</Field>
```

### A short horizontal choice

```svelte live
<script lang="ts">
  import { Field, Radio, RadioGroup } from '@ggbrick/svelte';

  let billing = $state('monthly');
</script>

<Field label="Billing">
  <RadioGroup orientation="horizontal" bind:value={billing}>
    <Radio value="monthly" label="Monthly" />
    <Radio value="yearly" label="Yearly" />
  </RadioGroup>
</Field>
```

### A required question

Nothing is selected at first; the application shows the message after submission.

```svelte live
<script lang="ts">
  import { Button, Field, Radio, RadioGroup } from '@ggbrick/svelte';

  let plan = $state('');
  let tried = $state(false);
</script>

<form
  style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)"
  onsubmit={(event) => {
    event.preventDefault();
    tried = true;
  }}
>
  <Field label="Plan" required invalid={tried && !plan} message="Choose a plan.">
    <RadioGroup bind:value={plan}>
      <Radio value="starter" label="Starter" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  </Field>
  <Button type="submit" label="Continue" />
</form>
```

### Difficult cases

- Keyboard: one tab stop, arrows that move and select in both axes, a readonly group whose arrows move without selecting (`#playground`).
- A horizontal group that wraps in a narrow column, still in source order (`#compositions`).
- Every size and condition (`#matrix`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `RadioGroup.Root`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { RadioGroup, Radio } from '@ggbrick/svelte';
import type { RadioGroupProps, RadioGroupOrientation, RadioGroupSize, RadioProps } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-radio-group">` (plus any class you pass) with `role="radiogroup"`, `data-orientation`, `data-size` and `data-invalid`, holding the Radio children.

| Prop            | Type                             | Default      | Description                                                                                                         |
| --------------- | -------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string` (bindable)              | `''`         | Value of the selected radio; bind it with `bind:value`. Empty, or a value no radio has, selects none.               |
| `label`         | `string`                         | —            | Accessible name when the group is not in a Field (not displayed); required then, an empty one throws. A Field wins. |
| `orientation`   | `'vertical' \| 'horizontal'`     | `'vertical'` | `vertical`: stacked. `horizontal`: on one line, wrapping when space runs out.                                       |
| `size`          | `'sm' \| 'md' \| 'lg'`           | `'md'`       | Size of every radio.                                                                                                |
| `disabled`      | `boolean`                        | `false`      | Disables every radio; the group leaves the tab order.                                                               |
| `readonly`      | `boolean`                        | `false`      | Arrow keys move focus without selecting; nothing can be selected.                                                   |
| `invalid`       | `boolean`                        | `false`      | Sets `aria-invalid` on the group; the message belongs to the enclosing Field.                                       |
| `required`      | `boolean`                        | `false`      | Sets `aria-required` on the group; the asterisk belongs to the enclosing Field.                                     |
| `children`      | `Snippet`                        | required     | Two or more Radio components.                                                                                       |
| `onvaluechange` | `(value: string) => void`        | —            | Called when the user selects a radio, with its value; not when the application sets `value`.                        |
| `ref`           | `HTMLElement \| null` (bindable) | `null`       | The group element.                                                                                                  |

Every other attribute of the Bits UI `RadioGroup.Root` props (`id`, `name`, `class`, `aria-describedby`…) goes to the group element, except those the component owns; `name` adds a hidden input for native forms. The options are Radio components (see Radio). Inside a Field, the group is named by the field label, described by its description and message, and takes its state. The platform-independent contract ships as `contracts/radio-group.json`.

## Accessibility

The component provides:

- `role="radiogroup"` named by the Field label or the `label` prop, with `aria-invalid` and `aria-required`; each radio with `role="radio"` and `aria-checked`, named by its label.
- One tab stop: focus enters on the selected radio, or on the first enabled one; the arrow keys move and select, wrapping at the ends; Space selects.
- A readonly group lets the arrows move without selecting; disabled radios are skipped.

The integration provides:

- A question as the Field label, a preselected option or a required marker, and validation with a message.
- No action or navigation triggered by a selection.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                               |
| ------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------ |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (group named by the Field, radios by their labels) |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component, on the system surfaces                            |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                                    |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                       | A     | Component (one stop, entry on the selected radio)            |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component                                                    |
| [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                             | A     | Integration (no change of context on selection)              |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)     | A     | Integration, through Field                                   |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | A     | Integration (Field label)                                    |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                                    |

Validated by automated checks in Chromium (axe-core in light and dark, keyboard in both orientations, accessible names and states, forced colors, computed values in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
