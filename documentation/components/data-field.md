# DataField

## Overview

A data field shows one piece of information about an object as a label and its value: the owner of a record, the status of an invoice, the renewal date of a plan. It is for reading: it is not an entry control, and a disabled or read-only input never takes its place.

## Anatomy

| #   | Part  | Required | Role                                                                                                                                                                        |
| --- | ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Label | yes      | The name of the information, which also names the field for assistive technology; it wraps. In the horizontal orientation it sits in a fixed-width column before the value. |
| 2   | Value | yes      | Plain text, or free content (a Badge, a Link, an Avatar with a name, several lines); long identifiers wrap. Empty: an em dash is shown and an empty label is announced.     |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/data-field.json`.

## When to use

- The properties of a record (owner, status, created on) in a side panel or a record page.
- A read-only summary of a form before it is submitted, or the read view of a form the user switches to edit.
- A grid of key facts in a card: plan, renewal date, seats.
- A rich value: a status as a Badge, a website as a Link, a person as an Avatar with a name.

## When not to use

- A value the user changes: a Field with its control (InputText, Select…).
- Several records compared column by column: Table.
- A value inside a sentence: plain text.
- A large figure with a trend: a metric tile (planned).
- A set of fields that must be announced as a description list: DataList (planned).

## Best practices

| Guidance | Topic       | Practice                                                                                                                  |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label       | Name the information with a short noun (“Owner”, “Created on”), without a colon: the layout already ties it to the value. |
| Do       | Value       | Format dates, amounts and units in the application before passing them: the field shows the text as given.                |
| Do       | Rich value  | Pass a Badge, a Link or an Avatar with a name as children; they take the text style of the value.                         |
| Do       | Orientation | Use vertical in grids of columns and narrow panels, horizontal for a list of properties whose values should line up.      |
| Do       | Size        | Use `sm` in dense panels and property lists, `md` elsewhere and next to forms, whose labels and entries it matches.       |
| Do       | Empty       | Keep the field when the value is missing, and set `emptyLabel` to the reason (“Not provided”) or its translation.         |
| Do       | Layout      | Space a set of fields with a grid or a column gap in the application: the field adds no margin around itself.             |
| Do       | Actions     | Compose copy or edit actions next to the field in the application: the field itself is never interactive.                 |
| Don't    | Inputs      | Show a value in a disabled or read-only input: it reads as a control the user cannot use.                                 |
| Don't    | Hiding      | Hide a field whose value is empty: the em dash keeps the layout in place and the empty label says the value is missing.   |
| Don't    | Surface     | Place fields on the muted surface (`color.surface.muted`): the label is too pale on it in dark mode.                      |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/data-field/App.svelte`, not shipped in the package).

### The usual case

Vertical fields in a grid of columns laid out by the application.

```svelte live
<script lang="ts">
  import { DataField } from '@ggbrick/svelte';
</script>

<div
  style="display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: var(--ggb-space-layout-sm) var(--ggb-space-layout-md)"
>
  <DataField label="Invoice" value="#3066" />
  <DataField label="Amount" value="€1,240.00" />
  <DataField label="Created on" value="Jan 6, 2027" />
  <DataField label="Due date" />
</div>
```

### Rich values

Children replace `value`; the content inherits the text style of the value.

```svelte live
<script lang="ts">
  import { Avatar, Badge, DataField, Link } from '@ggbrick/svelte';
</script>

<div
  style="display: grid; grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr)); gap: var(--ggb-space-layout-sm) var(--ggb-space-layout-md)"
>
  <DataField label="Status"><Badge intent="success" label="Paid" /></DataField>
  <DataField label="Website"><Link href="#fragments" label="acme.example.com" /></DataField>
  <DataField label="Customer">
    <span style="display: inline-flex; align-items: center; gap: var(--ggb-space-content-sm)">
      <Avatar name="Olivia Rhye" size="xs" decorative /> Olivia Rhye
    </span>
  </DataField>
  <DataField label="Billing address">
    <span>12 Rue de la Paix<br />75002 Paris<br />France</span>
  </DataField>
</div>
```

### Horizontal properties

The labels sit in a column of the same width, so the values of separate fields line up without a shared container. In a column narrower than twice the label column, each field stacks its label above its value.

```svelte live
<script lang="ts">
  import { Badge, DataField } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-wrap: wrap; gap: var(--ggb-space-layout-md)">
  <div style="flex: 1 1 24rem; display: flex; flex-direction: column; gap: var(--ggb-space-content-lg)">
    <DataField orientation="horizontal" label="Name" value="Olivia Rhye" />
    <DataField orientation="horizontal" label="Billing contact email address" value="billing@acme.example.com" />
    <DataField orientation="horizontal" label="Plan"><Badge intent="accent" label="Business" /></DataField>
  </div>
  <div style="inline-size: 16rem; display: flex; flex-direction: column; gap: var(--ggb-space-content-lg)">
    <DataField orientation="horizontal" label="Name" value="Olivia Rhye" />
    <DataField orientation="horizontal" label="Plan"><Badge intent="accent" label="Business" /></DataField>
  </div>
</div>
```

### Empty values and a dense panel

An empty value shows an em dash and announces `emptyLabel`; `sm` suits a dense side panel.

```svelte live
<script lang="ts">
  import { DataField } from '@ggbrick/svelte';
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-md); max-inline-size: 22rem">
  <DataField size="sm" orientation="horizontal" label="Owner" value="Olivia Rhye" />
  <DataField size="sm" orientation="horizontal" label="Phone" emptyLabel="Not provided" />
  <DataField size="sm" orientation="horizontal" label="Customer ID" value="cus_9s6XKzkNRiz8i3a7cRMbvwPtFqJdLfQ" />
</div>
```

### Switching to edit

The application swaps each data field for a Field with its control; the typographies match, so the layout holds.

```svelte live
<script lang="ts">
  import { Button, DataField, Field, InputText } from '@ggbrick/svelte';

  let editing = $state(false);
  let company = $state('Acme Inc');
</script>

<div style="display: flex; flex-direction: column; align-items: flex-start; gap: var(--ggb-space-content-lg)">
  <div style="inline-size: min(20rem, 100%)">
    {#if editing}
      <Field label="Company"><InputText bind:value={company} /></Field>
    {:else}
      <DataField label="Company" value={company} />
    {/if}
  </div>
  <Button appearance="outline" label={editing ? 'Done' : 'Edit'} onactivate={() => (editing = !editing)} />
</div>
```

### Difficult cases

- Long identifiers and multi-line addresses wrap inside the value instead of overflowing (`#panel` on the review page).
- A long label wraps inside the label column, and a horizontal field in a narrow column stacks (`#horizontal`).
- Empty values in both orientations and both sizes (`#matrix`).
- A form beside its read-only view, label and value lined up with the Field label and the entry (`#form`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { DataField } from '@ggbrick/svelte';
import type { DataFieldProps, DataFieldOrientation, DataFieldSize } from '@ggbrick/svelte';
```

Renders a `<div class="ggb-data-field">` (plus any class you pass) with `role="group"`, `aria-labelledby` pointing at the label, `data-orientation`, `data-size`, and `data-empty` when the value is empty. Inside, a layout `<div>` holds the label `<div class="ggb-data-field__label">` and the value `<div class="ggb-data-field__value">`. An empty value renders `<span class="ggb-data-field__empty">` with the em dash in `<span aria-hidden="true">` and the visually hidden `emptyLabel`. The label id is `<id>-label`, from `id` or a generated base; the root has an id only when you pass one. It is not a description list (`<dl>`): each field stands alone.

| Prop          | Type                                | Default      | Description                                                                                                     |
| ------------- | ----------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| `label`       | `string`                            | required     | The name of the information; names the group. An empty or blank label throws, on the server and in the browser. |
| `value`       | `string`                            | —            | The value as plain text. Ignored when children are given; empty or blank shows the em dash.                     |
| `children`    | `Snippet`                           | —            | A rich value instead of `value`: a Badge, a Link, an Avatar with a name, several lines.                         |
| `orientation` | `'vertical' \| 'horizontal'`        | `'vertical'` | Label above the value, or in a column before it; a narrow horizontal field stacks.                              |
| `size`        | `'sm' \| 'md'`                      | `'md'`       | Typographies of label and value: `sm` for dense panels. They do not change with the density; the gaps do.       |
| `emptyLabel`  | `string`                            | `'No value'` | Announced, not shown, when the value is empty. A blank string falls back to the default.                        |
| `id`          | `string`                            | —            | Id of the root, and the base of the label id (generated when absent).                                           |
| `ref`         | `HTMLDivElement \| null` (bindable) | `null`       | The rendered root element.                                                                                      |
| `class`       | `string`                            | —            | Merged with `ggb-data-field`.                                                                                   |

The horizontal layout stacks from the width of the field itself, not of a container or the viewport, so it works anywhere. Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the root, except `children`, `role` and `tabindex`; the component's own `aria-labelledby`, `data-orientation` and `data-size` take precedence over those you pass. There are no events. The platform-independent contract ships as `contracts/data-field.json`.

## Accessibility

The component provides:

- A group named by its visible label, with the value after the label in reading order.
- An empty value announced by `emptyLabel` instead of the em dash, which is hidden from assistive technology.
- No focus stop and no interaction of its own; a Link in the value keeps its behavior.
- Text contrast of at least 4.5:1 for the label, the value and the em dash on the default and subtle surfaces, in the 18 brand, appearance and density contexts.
- Wrapping labels and values, a horizontal layout that stacks when narrow, and the system text color in forced colors.

The integration provides:

- Labels that name the information, and an `emptyLabel` in the language of the interface.
- The layout of a set of fields (a grid, a list, headings over groups of fields), and surfaces other than muted.
- Editing, copying and other actions, composed next to the field. A value shown for reading is a DataField, never a disabled input.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                     |
| ------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------ |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (group named by its label), integration (sets of fields) |
| [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)       | A     | Component (label before value)                                     |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the default and subtle surfaces                      |
| [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)                       | AA    | Component                                                          |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Component (wrapping, stacking), integration (layout of the set)    |
| [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)       | AA    | Integration (descriptive labels)                                   |

Validated by automated checks: in Chromium, the group role and name through the accessibility tree, the em dash hidden and `emptyLabel` present, no tab stop, wrapping of long identifiers, stacking below twice the label column, typographies, colors and gaps in four representative contexts, forced colors, and axe-core in light and dark; on the server, the structure and the rejection of an empty label; contrast computed from the tokens in the 18 contexts. No assistive-technology test yet. This list is not a conformance claim.
