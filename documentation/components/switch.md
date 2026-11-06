# Switch

## Overview

A switch turns a setting on or off, and the change takes effect immediately: notifications, dark mode, automatic backups, location sharing. Its label names the setting, never its state.

## Anatomy

| #   | Part        | Required | Role                                                                                           |
| --- | ----------- | -------- | ---------------------------------------------------------------------------------------------- |
| 1   | Track       | yes      | The bar the user turns on or off; it shows the state of the setting.                           |
| 2   | Thumb       | yes      | The knob inside the track: at the start when off, at the end when on (mirrored right to left). |
| 3   | Label       | yes      | Names the setting; it wraps, is the accessible name, and a press on it toggles the switch.     |
| 4   | Description | no       | Help text under the label, the accessible description.                                         |
| —   | Focus ring  | state    | Shown around the track on keyboard focus.                                                      |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/switch.json`.

## When to use

- Settings that apply as soon as they change, in a settings page or a panel.
- Lists of settings that align: `labelPosition="start"` puts the labels first and the tracks at the end of each row.

## When not to use

- A choice confirmed later with a form, or that can be invalid or required: Checkbox.
- Exactly one choice among several options: RadioGroup, or SegmentedControl (planned).
- An action (“Turn off all devices”): Button.

## Best practices

| Guidance | Topic       | Practice                                                                                            |
| -------- | ----------- | --------------------------------------------------------------------------------------------------- |
| Do       | Label       | Name the setting (“Notifications”), not the state (“On”) or the action (“Turn on”).                 |
| Do       | Effect      | Apply the change at once, and show its result or an error near the switch when it can fail.         |
| Do       | Lists       | Use `labelPosition="start"` for stacked settings, so that the tracks align at the end of the rows.  |
| Do       | Description | Add a description for the consequence of the setting (“Push notifications on this device.”).        |
| Don't    | Submit      | Put a switch in a form that applies only on submit: use a Checkbox.                                 |
| Don't    | Validation  | Ask for a switch to be required or show it as invalid: a switch has neither state.                  |
| Don't    | Wording     | Change the label with the state: the track already shows it, and screen readers announce on or off. |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/switch/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { Switch } from '@ggbrick/svelte';

  let notifications = $state(true);
</script>

<Switch label="Notifications" description="Push notifications on this device." bind:checked={notifications} />
```

### A list of settings

```svelte live
<script lang="ts">
  import { Switch } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); max-inline-size: 22rem">
  <Switch labelPosition="start" label="Automatic backups" checked />
  <Switch labelPosition="start" label="Share location" />
  <Switch labelPosition="start" label="Beta features" description="Managed by your organization." disabled />
</div>
```

### Difficult cases

- Long labels that wrap with the track on the first line; hidden labels (`#compositions`).
- Every size, position and condition (`#matrix`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Switch.Root`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Switch } from '@ggbrick/svelte';
import type { SwitchProps, SwitchSize, SwitchLabelPosition } from '@ggbrick/svelte';
```

Renders a `<label class="ggb-switch">` (plus any class you pass) with `data-size`, `data-selection`, `data-label-position`, `data-hide-label`, `data-disabled` and `data-readonly`, holding the control (a `<button>` with `role="switch"`), the label and the description.

| Prop              | Type                             | Default  | Description                                                                                |
| ----------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `checked`         | `boolean` (bindable)             | `false`  | On or off; bind it with `bind:checked`.                                                    |
| `label`           | `string`                         | required | Names the setting; the accessible name. Must be non-empty: an empty or blank label throws. |
| `hideLabel`       | `boolean`                        | `false`  | Hides label and description visually; they stay the name and description.                  |
| `description`     | `string`                         | —        | Help text below the label, the accessible description.                                     |
| `labelPosition`   | `'end' \| 'start'`               | `'end'`  | `end`: track then label. `start`: label first, the track at the end of the row.            |
| `size`            | `'sm' \| 'md' \| 'lg'`           | `'md'`   | Track and text size.                                                                       |
| `disabled`        | `boolean`                        | `false`  | Not focusable, ignores activation.                                                         |
| `readonly`        | `boolean`                        | `false`  | Focusable and announced read-only, ignores activation.                                     |
| `oncheckedchange` | `(checked: boolean) => void`     | —        | Called when the user turns the switch on or off, with the new value.                       |
| `ref`             | `HTMLElement \| null` (bindable) | `null`   | The control element.                                                                       |
| `class`           | `string`                         | —        | Class of the container.                                                                    |

Every other attribute of the Bits UI `Switch.Root` props (`id`, `name`, `value`, `aria-describedby`…) goes to the control, except those the component owns: `children`, `child`, `checked`, `onCheckedChange`, `disabled`, `required`, `type`, `aria-labelledby`, `aria-readonly`, `ref` and `class`; `name` adds a hidden input. A switch is not placed in a Field. The platform-independent contract ships as `contracts/switch.json`.

## Accessibility

The component provides:

- `role="switch"` with `aria-checked`, named by the label and described by the description.
- Space and Enter toggle; disabled switches leave the tab order, readonly ones stay focusable with `aria-readonly`.
- One target for track, label and description, tall enough for touch; a focus ring on keyboard focus; the thumb jumps under reduced motion; forced colors handled.

The integration provides:

- A label that names the setting, and feedback when applying the setting fails.

| WCAG 2.2 criterion                                                                                                | Level | Responsibility                                                           |
| ----------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------ |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)           | A     | Component                                                                |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                               | A     | Component (the thumb position shows the state)                           |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)                    | AA    | Component, on the system surfaces                                        |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                       | A     | Component                                                                |
| [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) | AAA   | Component (no motion under reduced motion), an AAA objective             |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                             | AA    | Component                                                                |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)               | AA    | Component (target height)                                                |
| [3.2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                                       | A     | Integration (an immediate effect the user expects, no change of context) |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                       | A     | Component                                                                |

Validated by automated checks in Chromium (axe-core in light and dark, keyboard, accessible names and states, forced colors, target sizes, computed values in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
