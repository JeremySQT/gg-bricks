# Field

## Overview

A field gives one form control its visible label, an optional help text, the required asterisk and the error message: an email address with a hint, a delivery choice, a mandatory acceptance. It names and describes the control for assistive technology, and it never validates on its own.

## Anatomy

| #   | Part               | Required | Role                                                                                                   |
| --- | ------------------ | -------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Label              | yes      | Names the control (the group for a RadioGroup or a CheckboxGroup, the question for a Checkbox); wraps. |
| 2   | Required indicator | state    | An asterisk after the label when `required` is set, hidden from assistive technology.                  |
| 3   | Description        | no       | Help text between the label and the control; the accessible description of the control.                |
| 4   | Control            | yes      | Exactly one InputText, Textarea, Checkbox, RadioGroup or CheckboxGroup, in the state of the field.     |
| 5   | Message icon       | state    | A warning glyph at the start of the message, so that an error is never shown by color alone.           |
| 6   | Message            | state    | The error text below the control while `invalid` is set; added to the accessible description.          |

A label to description (`space.content.xs`), B to the control (`space.content.sm`), C control to message (`space.content.xs`); the gaps follow the density, the text sizes do not.

## When to use

- Every text entry, textarea and choice group of a form that needs a visible label, a hint or an error message.
- A single checkbox that answers a question with its own label (“Terms: I accept the terms”), or that must show an error.
- Required questions: the asterisk and the required state reach the control together.

## When not to use

- A search box or a filter in a toolbar with no visible label: use InputText with its `label` prop alone.
- A switch: it applies a setting at once and has no error state; use Switch with its own label.
- A group of several fields under one heading: compose a fieldset with a legend (Fieldset, planned) around the fields.
- A message about the whole form: show it near the submit button or at the top of the form (Alert).

## Best practices

| Guidance | Topic       | Practice                                                                                                                      |
| -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label       | Write a short label that names the value (“Email”, “Delivery speed”), not an instruction.                                     |
| Do       | Description | Put format hints and constraints in the description (“We never share it.”, “Select at least one channel.”).                   |
| Do       | Message     | Say what is wrong and how to fix it (“Enter an address like name@example.com”), and show it after the user leaves or submits. |
| Do       | Required    | Set `required` on the field, not on the control: the asterisk and the announced state stay in sync.                           |
| Do       | Validation  | Decide `invalid` in the application, and move focus to the first invalid field after a failed submission.                     |
| Don't    | Placeholder | Use the placeholder as the label or the hint: it disappears as soon as the user types.                                        |
| Don't    | Color       | Signal an error only by color: always set a `message` with `invalid`.                                                         |
| Don't    | Controls    | Put two controls in one field; give each its own field, or use a RadioGroup or a CheckboxGroup for related options.           |
| Don't    | Timing      | Show errors on the first keystroke: wait for the user to leave the field or submit.                                           |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/field/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { Field, InputText } from '@ggbrick/svelte';

  let email = $state('');
</script>

<Field label="Email" description="We send the receipt to this address." required>
  <InputText type="email" autocomplete="email" bind:value={email} />
</Field>
```

### An error after submission

The application validates; the field shows the message and passes the invalid state to the control.

```svelte live
<script lang="ts">
  import { Button, Field, InputText } from '@ggbrick/svelte';

  let company = $state('');
  let tried = $state(false);
  const invalid = $derived(tried && company.trim() === '');
</script>

<form
  style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-md)"
  onsubmit={(event) => {
    event.preventDefault();
    tried = true;
  }}
>
  <Field label="Company" required {invalid} message="Enter the company name.">
    <InputText bind:value={company} />
  </Field>
  <Button type="submit" label="Continue" />
</form>
```

### Other controls

A Textarea fills the field like an InputText; choice controls keep their own width. The field label names a group, and the question a single checkbox answers.

```svelte live
<script lang="ts">
  import { Checkbox, CheckboxGroup, Field, RadioGroup, Radio, Textarea } from '@ggbrick/svelte';

  let speed = $state('standard');
  let channels = $state<string[]>(['email']);
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-lg)">
  <Field label="Message" description="Tell us what happened.">
    <Textarea rows={3} />
  </Field>
  <Field label="Delivery speed">
    <RadioGroup bind:value={speed}>
      <Radio value="standard" label="Standard" />
      <Radio value="express" label="Express" />
    </RadioGroup>
  </Field>
  <Field label="How can we reach you?" description="Select at least one channel." required>
    <CheckboxGroup bind:value={channels}>
      <Checkbox value="email" label="Email" />
      <Checkbox value="phone" label="Phone call" />
    </CheckboxGroup>
  </Field>
  <Field label="Terms" required>
    <Checkbox label="I accept the terms of sale" />
  </Field>
</div>
```

### Difficult cases

- Long labels, descriptions and messages wrap; the message icon stays on the first line of the message (`#difficult`).
- A disabled field dims its label and description and disables the control (`#states`).
- A form section with several fields, one of them invalid after submission (`#form`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Field } from '@ggbrick/svelte';
import type { FieldProps } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-field">` (plus any class you pass) with `data-required`, `data-invalid` and `data-disabled`, holding a native `<label>`, the description, the control and the message. The ids derive from `id` (generated when absent): `<id>-label`, `<id>-description`, `<id>-message`, and `<id>-control` for a text entry that has no id of its own.

| Prop          | Type      | Default  | Description                                                                                                   |
| ------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `label`       | `string`  | required | Visible label. Must be non-empty: an empty or blank label throws, on the server and in the browser.           |
| `description` | `string`  | —        | Help text between the label and the control, read as the control's description.                               |
| `message`     | `string`  | —        | Error text shown below the control while `invalid` is true, read after the description.                       |
| `required`    | `boolean` | `false`  | Shows the asterisk and makes the control required (a CheckboxGroup states it in words instead, see its page). |
| `invalid`     | `boolean` | `false`  | Makes the control invalid and shows `message`.                                                                |
| `disabled`    | `boolean` | `false`  | Disables the control and dims the label and the description.                                                  |
| `children`    | `Snippet` | required | Exactly one InputText, Textarea, Checkbox, RadioGroup or CheckboxGroup.                                       |

The control reads the field through a Svelte context: a text entry is labelled by the native `<label for>` (and also by `aria-labelledby` when it has an id of its own), a group by `aria-labelledby`, and the description and message reach it through `aria-describedby`. A single Checkbox is wrapped in an element with `role="group"` named by the field label, and keeps its own label. A `required`, `invalid` or `disabled` set on the control itself stays true. Every other attribute of `HTMLAttributes<HTMLDivElement>` goes to the root, except `children` and `role`. The platform-independent contract ships as `contracts/field.json`.

## Accessibility

The component provides:

- The label as the accessible name of a text entry or a group (a pointer press on it focuses a text entry), and the question a single checkbox answers.
- The description and the message as the accessible description, in that order.
- `required`, `invalid` and `disabled` passed to the control, which exposes them; the asterisk is hidden from assistive technology.
- An error message with an icon and text, never color alone; forced colors handled.

The integration provides:

- Clear labels and messages, and the decision of when a field is invalid.
- Moving focus to the first invalid field, or announcing a summary, after a failed submission.
- Groups of fields under a heading or a fieldset when a form is long.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                         |
| ------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (label, description and message tied to the control)         |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                     | A     | Component (message icon and text)                                      |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces (disabled text exempt)               |
| [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)       | AA    | Integration (descriptive labels)                                       |
| [3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)     | A     | Component (message shown and described), integration (when to show it) |
| [3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) | A     | Component (visible label, description, required marker)                |
| [3.3.3 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)             | AA    | Integration (a message that says how to fix the value)                 |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component                                                              |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Integration (announcing errors after a submission)                     |

Validated by automated checks in Chromium (axe-core in light and dark, accessible names and descriptions through the accessibility tree, forced colors, computed values in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
