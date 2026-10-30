# Radio

## Overview

A radio is one option of a RadioGroup: a circle and a label, with an optional description, that the user selects to choose that option over the others. It exists only inside a RadioGroup, which owns the value, the keyboard and the size.

## Anatomy

| #   | Part        | Required | Role                                                                             |
| --- | ----------- | -------- | -------------------------------------------------------------------------------- |
| 1   | Control     | yes      | A circle with a thin border; light when off, filled in the accent color when on. |
| 2   | Mark        | state    | A dot of 3/8 of the circle in the content color of the state; none when off.     |
| 3   | Label       | yes      | The accessible name; it wraps, and a press on it selects the radio.              |
| 4   | Description | no       | Help text under the label, the accessible description.                           |
| —   | Focus ring  | state    | Drawn around the circle on keyboard focus.                                       |

A circle size (14, 16 or 20 px, the size of a Checkbox box), B gap between circle and label (8 px at md in standard density), C first line: the circle is centered on the first line of the label.

## When to use

- Each option of a RadioGroup, with a short label and, when options differ by more than their name, a description.

## When not to use

- On its own or outside a RadioGroup: a radio throws when it has no group. Use Checkbox for one on/off option.
- Several options that can all be checked: Checkbox items in a CheckboxGroup.

## Best practices

| Guidance | Topic       | Practice                                                                                   |
| -------- | ----------- | ------------------------------------------------------------------------------------------ |
| Do       | Label       | Keep the labels of a group short and parallel (“Standard”, “Express”, “Pick up in store”). |
| Do       | Description | Add a description when the options differ by price, delay or consequence.                  |
| Do       | Disabled    | Disable one option only when its unavailability is explained nearby (in its description).  |
| Don't    | Value       | Reuse a value inside a group: each radio needs a unique value.                             |
| Don't    | Size        | Set a size on a radio: the group sets it for all of them.                                  |

## Examples

The review page `examples/radio-group/App.svelte` shows radios in every size and condition.

### Options with descriptions

```svelte live
<script lang="ts">
  import { Radio, RadioGroup } from '@ggbrick/svelte';

  let plan = $state('team');
</script>

<RadioGroup label="Plan" bind:value={plan}>
  <Radio value="starter" label="Starter" description="Up to 3 projects." />
  <Radio value="team" label="Team" description="Unlimited projects and shared workspaces." />
  <Radio value="enterprise" label="Enterprise" description="Contact sales to enable it." disabled />
</RadioGroup>
```

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `RadioGroup.Item`); place it inside a RadioGroup.

```ts
import { Radio } from '@ggbrick/svelte';
import type { RadioProps } from '@ggbrick/svelte';
```

Renders a `<label class="ggb-radio">` (plus any class you pass) with `data-size`, `data-disabled`, `data-readonly` and `data-invalid`, holding the control (a `<button>` with `role="radio"`), the label and the description.

| Prop          | Type                             | Default  | Description                                                                           |
| ------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `value`       | `string`                         | required | Value set on the group when this radio is selected; unique within the group.          |
| `label`       | `string`                         | required | Visible label and accessible name. Must be non-empty: an empty or blank label throws. |
| `description` | `string`                         | —        | Help text below the label, the accessible description.                                |
| `disabled`    | `boolean`                        | `false`  | Disables this radio only; the group can disable all of them.                          |
| `ref`         | `HTMLElement \| null` (bindable) | `null`   | The control element.                                                                  |
| `class`       | `string`                         | —        | Class of the container.                                                               |

Size, readonly and invalid come from the group. Every other attribute of the Bits UI `RadioGroup.Item` props (`id`, `aria-describedby`…) goes to the control, except those the component owns. A Radio outside a RadioGroup throws. The platform-independent contract ships as `contracts/radio.json`.

## Accessibility

The component provides `role="radio"` with `aria-checked`, named by its label and described by its description; one target for circle, label and description at least 44 px high; a focus ring on keyboard focus; a dot that does not rely on color alone; forced colors handled. The keyboard, the group name and the group state are described on the RadioGroup page.

| WCAG 2.2 criterion                                                                                  | Level | Responsibility                          |
| --------------------------------------------------------------------------------------------------- | ----- | --------------------------------------- |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                 | A     | Component (the dot shows the selection) |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)      | AA    | Component, on the system surfaces       |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | AA    | Component (44 px target)                |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)         | A     | Component                               |

Validated by automated checks in Chromium as part of the RadioGroup tests; no assistive-technology test yet. This list is not a conformance claim.
