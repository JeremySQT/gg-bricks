# Button

## Overview

Button is a component that lets users perform an action. Its clear label describes what will happen when they activate it, helping them understand their options and choose their next step.

It comes in several visual styles and sizes to suit an action's importance and context. Optional icons, counters and keyboard shortcut hints can complement the label, while a loading indicator shows that an action is in progress.

## When to use

Use Button to give users an explicit way to perform an action. That action may:

- Submit information, such as sending a form or confirming a choice.
- Create, update or remove content, such as adding an item or saving changes.
- Open or reveal an interface, such as a dialog or additional options.
- Navigate to a destination as part of a task, such as opening a creation form with “New item”.

## When not to use

Choose a more appropriate component when users need to:

- Follow a reference within a sentence or paragraph: use **Link**, which fits the flow of text.
- Keep a setting on or off: use **Switch**, or **Toggle** for a persistent pressed/unpressed action.
- Select values from a set: use **Checkbox**, **Radio** or **Select**, depending on the selection model.
- Activate an action represented only by an icon: use **IconButton** with an accessible name, rather than removing this Button's label.

These alternatives describe component roles in the intended design system; they are not exports of the current Button reference package.

## Anatomy

| Part | Responsibility | Public composition |
| --- | --- | --- |
| Native root | Actual interactive target, keyboard/form/link behavior; minimum 44 × 44 CSS px | HTML attributes and `ref` |
| Surface | Visible background, radius, optional inset outline and focus ring | Determined by tokens |
| Content row | Keeps leading, label and trailing in order; stays in layout while loading | Internal |
| Leading | One decorative icon | `leading` snippet |
| Label | Required action text, one line, ellipsis when constrained | `label` |
| Trailing | One icon, counter or shortcut | `trailing` snippet |
| Loading indicator | Centered spinner, same foreground as content | `loading` |

The Figma target wrapper maps to the native root; its visible surface maps to the surface span. Bits UI adds no separate DOM wrapper. The surface and content row have layout responsibilities; Figma's internal variant sets and context collections have no DOM equivalents.

## Usage guidelines

- Use a short, specific action label: “Save changes”, not “Click here”. Keep the full label even when space is constrained; the component handles ellipsis.
- Use one primary action per meaningful decision group. Prefer accent for the primary action, neutral for ordinary actions and danger for destructive actions. Choose outline or ghost when less visual emphasis is appropriate.
- Pass `type="submit"` explicitly for form submission. The default is `type="button"` to avoid unintended submissions.
- Set `loading` while the action is pending. The component preserves its dimensions and label, blocks activation, exposes busy state and keeps an already-focused loading control focusable. It does not start or await promises automatically.
- Use `disabled` for unavailable actions. Disabled takes precedence over loading for color; a combined disabled/loading control still shows the indicator.
- Leading/trailing snippets must each render exactly one non-interactive item of an allowed kind. No buttons, links, inputs or focusable descendants belong in them.
- Slot text must inherit `color`. SVG icons use `fill="currentColor"` or `stroke="currentColor"`. Do not give a reusable slot component an unconditional foreground color.
- Slots are decorative/redundant for the accessible name. If a counter is essential to understanding the action, include it in `label` or provide an `aria-label` that still contains the visible label. A shortcut hint does not register a keyboard shortcut.
- Do not clip the outer focus outline. The parent must accommodate at least the minimum interaction target. The visible surface may be smaller than that target.
- Brand, theme and density are selected by the theme ancestor, not Button properties. There is no automatic viewport-driven density change.

Svelte snippets do not prove their DOM contents or component identity at compile time. The signature allows one snippet per slot; cardinality and permitted kinds inside it are integration responsibilities. This implementation deliberately does not invent a universal `kind` component or claim strict component allowlisting. Final Icon, Counter and Shortcut contracts remain separate future work.

## Examples

```svelte
<script lang="ts">
  import { Button } from '@ds/svelte';
  import '@ds/svelte/tokens.css';
  let saving = $state(false);
  async function save() {
    saving = true;
    try { await persistChanges(); }
    finally { saving = false; }
  }
</script>

<div data-ds-brand="base" data-ds-appearance="light" data-ds-density="standard">
  <Button label="Save changes" loading={saving} onclick={save} />
  <Button label="New item" href="/items/new" appearance="outline" />
</div>
```

`persistChanges` is application code. A shortcut can be supplied independently:

```svelte
{#snippet shortcut()}<kbd style="font: inherit; color: inherit">⌘ K</kbd>{/snippet}
<Button label="Open command menu" trailing={shortcut} />
```

The executable reference page is `examples/button/App.svelte` in the source repository. Run `npm run dev` there. It covers all appearances/intentions, three sizes, all brand/theme/density contexts, loading, disabled, navigation, native forms and constrained width. Its counter/shortcut markup is example content, not a released dependency component. Its narrow-screen matrix hides decorative slots to fit the comparison; this is page layout behavior, not Button behavior.

## API

Import `{ Button }` and `type { ButtonProps }` from `@ds/svelte`.

This implementation uses Svelte 5.57.1 and Bits UI 2.19.3. It renders a native `<button>` for an operation and a native `<a>` when a non-empty `href` is supplied for navigation. Both use the same visual styles; choose the HTML behavior according to the action's purpose.

| Property | Type | Default / meaning |
| --- | --- | --- |
| `label` | non-empty string | Required |
| `intent` | `accent`, `neutral`, `danger` | `accent` |
| `appearance` | `solid`, `outline`, `ghost` | `solid` |
| `size` | `sm`, `md`, `lg` | `md` |
| `disabled` | boolean | `false` |
| `loading` | boolean | `false` |
| `leading` | Svelte `Snippet` | Absent; one icon |
| `trailing` | Svelte `Snippet` | Absent; one icon, counter or shortcut |
| `href` | string | Absent; a non-empty href selects a link |
| `type` | `button`, `submit`, `reset` | `button`; only for native buttons |
| `onclick` | mouse event handler, `currentTarget: HTMLElement` | Called only when available |
| `ref` | bindable `HTMLElement \| null` | `null`; native interactive element |
| `class`, `style`, `id`, native attributes | native target attributes | Forwarded |
| `aria-label` | string | Full `label` by default |

`href` and button `type` are mutually exclusive in the TypeScript API. Relevant native attributes such as `form`, `name`, `value`, `target`, `rel` and `aria-describedby` can be forwarded. `aria-busy`, `aria-disabled` and role are owned by the component. There is no public forced-hover/state API; the browser determines interaction state. There is no `children` label override.

The contract's token paths generate the adapter's CSS bindings and enum types. Generated `--button-*` properties are internal CSS aliases, not new source tokens. The package contains no `_adapter/button/content` Figma variables.

## Accessibility

Button should be understandable, operable with different input methods and perceivable in each of its states. Accessibility depends on both the component and its use in a page: the label, surrounding layout, chosen colors and outcome of the action all matter.

### Relevant WCAG 2.2 criteria

The criteria below identify requirements to assess, not a declaration that every criterion has been fully audited. Links lead to the W3C explanations. “Component” describes the current implementation; “integration” describes what the consuming application must preserve or verify.

| Criterion | Level | Application to Button |
| --- | --- | --- |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | AA | Maintain at least 4.5:1 for the current label sizes against their actual background. Component: supplied color combinations are checked. Integration: recheck custom themes and backgrounds. Inactive controls have an exception. |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | AA | Visual information needed to identify the control or its state needs 3:1 against adjacent colors. Component: outline and focus colors are checked on documented backgrounds. Integration: verify other backgrounds and meaningful icons; a decorative border is not automatically required. |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) | A | The action must be available without a pointer. Component: native buttons support Enter and Space; navigation links support Enter. Integration: keep application handlers keyboard-compatible. |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) | AA | Keyboard users need to see the focused control. Component: a focus ring is provided. Integration: do not remove or clip it. |
| [2.5.2 Pointer Cancellation](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html) | A | Avoid irreversible activation on pointer-down. Component: activation uses the native click event. Integration: do not move the action into a pointer-down handler. |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) | A | The accessible name must include the visible label. Component: the full label is the default accessible name. Integration: retain that text when supplying a custom accessible name. |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | AA | The minimum is 24 × 24 CSS px, subject to the criterion's exceptions. Component: this DS chooses a larger 44 × 44 minimum interactive target, independently of the visible surface. Integration: preserve that target and avoid overlap. |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html) | A | Assistive technologies need the control's name, role and applicable states. Component: native semantics and disabled/busy attributes are supplied. Integration: use the appropriate operation or navigation behavior and a meaningful name. |

### Criteria to verify in the consuming interface

- **[2.4.6 Headings and Labels](https://www.w3.org/TR/WCAG22/#headings-and-labels) — AA:** write a label that describes the action's purpose.
- **[2.4.3 Focus Order](https://www.w3.org/TR/WCAG22/#focus-order) — A:** place the button in a meaningful keyboard sequence and manage focus appropriately when its action opens or closes an interface.
- **[2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum) — AA:** ensure a focused button is not completely hidden by author-created content, such as a sticky panel.
- **[1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) — AA**, **[1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow) — AA** and **[1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) — AA:** verify text enlargement, narrow layouts and user-adjusted text spacing without losing information or functionality. An accessible name alone does not make a visually truncated label readable; test constrained labels in these conditions. This review is still pending.
- **[4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) — AA:** make relevant progress, success and error messages available to assistive technologies without requiring focus to move. The button exposes busy state; it does not announce the application's result. A spinner or `aria-busy` alone does not establish compliance with this criterion.

The DS's 44 × 44 target also addresses the size requirement of **[2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) — AAA**, subject to integration. **[2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html) — AAA** can be assessed as an additional focus-indicator objective; its area and contrast requirements have not received a dedicated audit. Neither point is a claim of overall AAA conformance.

### Interaction and assistive-technology behavior

- Available buttons activate with Enter and Space; navigation links activate with Enter.
- Disabled controls cannot activate. Disabled links have no destination and leave the tab order.
- During loading, the control keeps its dimensions and accessible name, exposes busy state and blocks activation. An already-focused loading control can retain focus. Disabled takes precedence when both states are set.
- Decorative icons, slot content and the spinner are hidden from accessibility APIs. Include any essential information from a counter in the accessible name or an associated description.
- Reduced motion stops the spinner animation while busy semantics remain. Forced-colors mode supplies a system-color contour and focus indicator; its border may slightly change geometry.

### Validation status

The reference has Chromium checks for keyboard behavior, forms, loading/disabled, focus, target dimensions, token resolution, reduced motion and forced colors, plus axe scans in light and dark. These checks cover parts of the requirements above; they do not establish complete WCAG conformance. Text enlargement/reflow/spacing, assistive-technology behavior, additional browser engines and the consuming application's layout and feedback still require validation.
