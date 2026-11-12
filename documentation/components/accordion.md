# Accordion

## Overview

An accordion stacks headings that each show or hide a section of content, so that a long page can be scanned: questions and answers, the settings sections of a page, the details of a product. Accordion holds AccordionItem children, documented on this page.

## Anatomy

| #   | Part      | Required | Role                                                                                                                                      |
| --- | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Trigger   | yes      | The button across the item, inside a heading of the chosen level; a press, Enter or Space expands or collapses the item.                  |
| 2   | Leading   | no       | One decorative icon before the label; it is not announced.                                                                                |
| 3   | Label     | yes      | Plain text saying what the section holds; it wraps onto several lines when long and names both the trigger and the section.               |
| 4   | Indicator | yes      | A chevron at the end of the trigger, drawn by the component, pointing down when the item is collapsed and up when it is expanded.         |
| 5   | Content   | yes      | The item's free content (text, links, controls), aligned with the label and shown below the trigger when expanded; hidden when collapsed. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/accordion.json`.

## When to use

- Questions and answers on a help or product page, where readers look for the one they have.
- Settings or detail sections of a long page, scanned by their headings before one is opened.
- Filters grouped in a sidebar, several of them open at once.

## When not to use

- Peer sections read one at a time in the same place, with a visible list to switch between them: Tabs.
- Content every user needs, such as a warning, a price or a required step: show it on the page, in an Alert for a message.
- Navigation between pages: Link, and Breadcrumb for the path to the current page.
- A single section shown or hidden on its own, outside a stack: Disclosure (planned).
- Long content or a task of its own: a Dialog or a separate page.

## Best practices

| Guidance | Topic         | Practice                                                                                                                          |
| -------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Labels        | Write each label as the question or the name of the section it opens (“Can I change plans later?”, “Billing”).                    |
| Do       | Heading level | Set `headingLevel` one below the heading that introduces the accordion, so that its items fit the page outline.                   |
| Do       | Values        | Give each item a unique, stable `value`: `value` and `onvaluechange` report the expanded items by it.                             |
| Do       | Multiple      | Set `multiple` when readers use several sections side by side, such as filters; keep one section at a time for questions.         |
| Do       | Expanded      | Expand the section most readers need first through the initial `value`.                                                           |
| Do       | Leading       | Give a leading icon to every item or to none, so that the labels stay aligned.                                                    |
| Do       | Disabled      | Keep an unavailable section disabled rather than removing it when readers expect it there, and say why in its label or nearby.    |
| Don't    | Content       | Hide content every user needs in a collapsed section: collapsed content is hidden from every user, assistive technology included. |
| Don't    | Navigation    | Use items as links to other pages: a trigger only shows or hides its own section.                                                 |
| Don't    | Nesting       | Nest accordions more than one level deep: nested items look the same as their parents, and the structure gets hard to follow.     |
| Don't    | Icons         | Rely on a leading icon alone to tell items apart: icons are decorative and are not announced.                                     |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/accordion/App.svelte`, not shipped in the package). These examples sit under level 3 headings, so their items use `headingLevel={4}`. Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set.

### Questions and answers

One section at a time; the expanded one can be collapsed, leaving none. `bind:value` follows the expanded item.

```svelte live
<script lang="ts">
  import { Accordion, AccordionItem } from '@ggbrick/svelte';

  let value = $state<string[]>(['included']);
</script>

<Accordion bind:value headingLevel={4}>
  <AccordionItem value="included" label="What is included in the plan?">
    <p>Unlimited projects, 50 GB of storage and email support on working days.</p>
  </AccordionItem>
  <AccordionItem value="change" label="Can I change plans later?">
    <p>Yes. A new plan applies at once, and the price is adjusted on your next invoice.</p>
  </AccordionItem>
  <AccordionItem value="billing" label="How does billing work?">
    <p>You are billed at the start of each month, by card or bank transfer.</p>
  </AccordionItem>
</Accordion>
<p>Expanded: {value.join(', ') || 'none'}</p>
```

### Filters, several open at once

With `multiple`, items expand and collapse independently. Controls in the content keep their focus indicator whole.

```svelte live
<script lang="ts">
  import { Accordion, AccordionItem, Checkbox, CheckboxGroup, InputText } from '@ggbrick/svelte';

  let brands = $state<string[]>([]);
</script>

<div style="max-inline-size: 18rem">
  <Accordion multiple value={['price', 'brand']} headingLevel={4}>
    <AccordionItem value="price" label="Price">
      <InputText label="Maximum price" placeholder="Any" size="sm" />
    </AccordionItem>
    <AccordionItem value="brand" label="Brand">
      <CheckboxGroup label="Brand" size="sm" bind:value={brands}>
        <Checkbox value="acme" label="Acme" />
        <Checkbox value="globex" label="Globex" />
        <Checkbox value="initech" label="Initech" />
      </CheckboxGroup>
    </AccordionItem>
    <AccordionItem value="color" label="Color">
      <p>Red, green and blue.</p>
    </AccordionItem>
  </Accordion>
</div>
```

### Leading icons and a disabled item

Every item has an icon, so the labels align. A disabled item cannot be toggled and is skipped by Tab and the arrow keys; its label says why.

```svelte live
<script lang="ts">
  import { Accordion, AccordionItem, Icon } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
{#snippet check()}<Icon><path d={phosphor.check} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<Accordion headingLevel={4}>
  <AccordionItem value="export" label="Export your data" leading={download}>
    <p>Download every project of the workspace as a ZIP archive of CSV files.</p>
  </AccordionItem>
  <AccordionItem value="domains" label="Verified domains" leading={check}>
    <p>People with an address on a verified domain can join the workspace without an invitation.</p>
  </AccordionItem>
  <AccordionItem value="delete" label="Delete the workspace (owners only)" leading={trash} disabled>
    <p>Deleting the workspace removes its projects for every member.</p>
  </AccordionItem>
</Accordion>
```

### Expanded from the application

Setting `value` expands and collapses items without calling `onvaluechange`, which reports only what the user does.

```svelte live
<script lang="ts">
  import { Accordion, AccordionItem, Button, ButtonGroup } from '@ggbrick/svelte';

  const all = ['profile', 'security', 'notifications'];
  let value = $state<string[]>([]);
  let changes = $state(0);
</script>

<div style="display: flex; flex-direction: column; align-items: stretch; gap: var(--ggb-space-content-md)">
  <ButtonGroup>
    <Button label="Expand all" intent="neutral" appearance="outline" size="sm" onactivate={() => (value = [...all])} />
    <Button label="Collapse all" intent="neutral" appearance="outline" size="sm" onactivate={() => (value = [])} />
  </ButtonGroup>
  <Accordion multiple bind:value headingLevel={4} onvaluechange={() => changes++}>
    <AccordionItem value="profile" label="Profile"><p>Name, photo and language.</p></AccordionItem>
    <AccordionItem value="security" label="Security"><p>Password and two-step verification.</p></AccordionItem>
    <AccordionItem value="notifications" label="Notifications"><p>Email and push notifications.</p></AccordionItem>
  </Accordion>
  <p>Changes by the user: {changes}</p>
</div>
```

### Difficult cases

- Keyboard: Tab moves through the enabled triggers and into expanded content; Down and Up Arrow wrap and skip the disabled item; Home and End; Enter and Space toggle (`#playground`).
- A label too long for one line wraps under itself, beside the indicator; the heading level option sets every heading from 2 to 6 (`#playground`).
- A value set by the application expands an item without an event, in single and multiple modes (`#playground`).
- Filters in a narrow column, with a field at the top of the content whose focus indicator is not cut (`#compositions`).
- A nested accordion: its arrow keys stay inside it, and its collapsed items point down while their parent is expanded (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Accordion`). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Accordion, AccordionItem } from '@ggbrick/svelte';
import type { AccordionProps, AccordionItemProps } from '@ggbrick/svelte';
```

Accordion renders a `<div class="ggb-accordion">` (plus any class you pass) with `data-orientation="vertical"`, holding the AccordionItem children. It takes the inline size it is given, draws a line between items, above the first and below the last, and adds no surface of its own. Bits UI provides the expanded state, the headings and the triggers; the component keeps Down Arrow, Up Arrow, Home and End to its own enabled triggers, so that a nested accordion keeps its own.

| Prop            | Type                                | Default   | Description                                                                                                                                                                      |
| --------------- | ----------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string[]` (bindable)               | `[]`      | Values of the expanded items; bind it with `bind:value`. Setting it from the application expands and collapses items without events.                                             |
| `multiple`      | `boolean`                           | `false`   | Items expand independently. Otherwise at most one is expanded: expanding one collapses the other, and it can be collapsed, leaving none; only the first entry of `value` counts. |
| `headingLevel`  | `number`                            | `3`       | Level of the heading around each trigger, from 2 to 6; any other value falls back to 3.                                                                                          |
| `children`      | `Snippet`                           | required  | AccordionItem children.                                                                                                                                                          |
| `onvaluechange` | `(value: string[]) => void`         | —         | Called with the values of the expanded items when the user expands or collapses one (press, Enter or Space); not when the application sets `value`.                              |
| `id`            | `string`                            | generated | id of the root element.                                                                                                                                                          |
| `ref`           | `HTMLDivElement \| null` (bindable) | `null`    | The root element.                                                                                                                                                                |
| `class`         | `string`                            | —         | Merged with `ggb-accordion`.                                                                                                                                                     |

Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the root element, except `children`.

AccordionItem renders a `<div class="ggb-accordion__item">` with `data-state` (`open` or `closed`) and `data-disabled` when disabled. It holds a `<div role="heading">` with `aria-level` set to the accordion's `headingLevel`, around a `<button class="ggb-accordion__trigger" id="<id>-trigger">` with `aria-expanded` and `aria-controls="<id>-content"` (`disabled` when the item is disabled), then the content, a `<div class="ggb-accordion__item-content" id="<id>-content" role="region" aria-labelledby="<id>-trigger">` with `data-state`. The content stays in the DOM; collapsed, it is hidden from every user. Expanding and collapsing animate its block size and the chevron's rotation, at once under reduced motion. An AccordionItem outside an Accordion throws, on the server and in the browser.

| Prop       | Type      | Default   | Description                                                                                                                             |
| ---------- | --------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `value`    | `string`  | required  | Identifies the item in the accordion's `value`; unique within the accordion.                                                            |
| `label`    | `string`  | required  | The heading text, the trigger's accessible name and the name of the content region; it wraps when long. An empty or blank label throws. |
| `disabled` | `boolean` | `false`   | The item cannot be toggled and keeps its expanded state; its trigger is skipped by Tab and the arrow keys and announced unavailable.    |
| `leading`  | `Snippet` | —         | One decorative Icon before the label, sized by the item, in the label's color, hidden from assistive technology.                        |
| `children` | `Snippet` | required  | The section shown when the item is expanded: free content in the body text style.                                                       |
| `id`       | `string`  | generated | Base id: the trigger gets `<id>-trigger` and the content `<id>-content`. It is not set on the item element.                             |
| `class`    | `string`  | —         | Merged with `ggb-accordion__item`.                                                                                                      |

Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the item element, except `children` and `id` (the base id above). The platform-independent contract, with its `item` child, ships as `contracts/accordion.json`.

## Accessibility

The component provides:

- The accordion pattern: each trigger is a button inside a heading of `headingLevel`, named by its label; it exposes `aria-expanded` and controls its content with `aria-controls`; the content is a region named by its trigger.
- Enter, Space or a press toggles an item. A disabled item is a disabled button: it cannot be toggled, keeps its state and is announced unavailable.
- Tab moves through the enabled triggers in source order and into expanded content; collapsed content is hidden from every user, so its controls are not reached. Down and Up Arrow move to the next and previous enabled trigger of the same accordion and wrap; Home and End go to the first and last one.
- A focus indicator inside the trigger, within the accordion's inline size, and room at the edges of the content for the focus indicators of its controls.
- Lines, chevron and focus indicator kept visible in system colors in forced colors, disabled triggers in the system disabled color; no animation under reduced motion.

The integration provides:

- A heading level that fits the page outline, and labels that say what each section holds.
- Content every user needs kept outside the accordion, and an explanation of why an item is disabled when it is not obvious.
- Contrast with backgrounds other than the system surfaces.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                                          |
| ------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (headings, buttons, regions named by their triggers); integration (the level) |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, on the system surfaces (labels, content text)                                |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Component (takes the width it is given, labels wrap)                                    |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)          | AA    | Component, on the system surfaces (chevron, focus indicator)                            |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                                                               |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                       | A     | Component (source order, collapsed content not reached)                                 |
| [2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)       | AA    | Component (headings); integration (labels that describe the sections)                   |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component (triggers, and room for the indicators of the content's controls)             |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                   | A     | Component (the label is the trigger's name)                                             |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Component (triggers across the accordion, taller than the minimum target)               |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component (expanded state, controlled region)                                           |

Beyond A and AA, the change without animation under reduced motion serves [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA).

Validated by automated checks in Chromium (axe-core in light and dark, desktop and mobile; single and multiple expansion with the value and the event; a value set by the application without an event; a disabled item not toggled; Tab through triggers and expanded content, arrow keys wrapping and skipping the disabled item, Home, End, Enter and Space; collapsed content hidden; the region named by its trigger; nested accordions keeping their own arrow keys; the focus indicator of a control at the top of the content not cut; the animation duration and reduced motion; a forced-colors capture; computed values in four representative contexts) and by server rendering checks (headings of the chosen level and the fallback to 3, expanded state, controlled regions, a blank label and an item outside an Accordion rejected); no assistive-technology test yet. This list is not a conformance claim.
