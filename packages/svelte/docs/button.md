# Button

## Overview

Button presents an action with a clear label. It supports accent, neutral and danger intentions, each with solid, outline and ghost appearances. Use its size, optional content and loading feedback to fit the surrounding interface while keeping its meaning consistent.

The visual control may perform an operation or navigate to a task. The Svelte adapter selects a native button or link according to `href`; the visual appearance does not determine its native semantics. This reference uses Bits UI 2.19.3 and Svelte 5.57.1.

## When to use

Use Button for submitting a form, saving changes, creating an item or a similarly explicit action. A “New item” button may link to a creation form. Prefer a neutral intention for ordinary actions, accent for the primary action and danger for destructive actions.

## When not to use

Use an inline Link pattern for navigation within prose, a Toggle for a persistent on/off selection, and an IconButton for an icon-only action. These alternatives describe intended component roles; they are not implemented in this package yet. Do not remove the label to approximate an icon-only component.

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
- Use one primary action per meaningful decision group. Choose outline/ghost or neutral for lower visual emphasis.
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
  import { Button } from '@ds-reference/svelte';
  import '@ds-reference/svelte/tokens.css';
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

Import `{ Button }` and `type { ButtonProps }` from `@ds-reference/svelte`.

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

Native buttons activate with Enter and Space; links navigate with Enter and preserve native link behavior when enabled. Disabled buttons use native disabled semantics; disabled links have no href, expose disabled state and leave the tab order. Loading buttons remain enabled at the native level to preserve focus, with `aria-disabled`, `aria-busy` and a guarded click handler preventing activation and default submission. Loading links lose their href while retaining the link role and tab position. Disabled always wins when both flags are set.

The full accessible name remains present during loading and truncation. The decorative content row and spinner are hidden from accessibility APIs. Reduced motion stops the spinner animation; busy semantics remain. Forced-colors mode supplies a system-color contour and focus indicator; its border may change geometry slightly compared with the normal inset outline.

Checks include Chromium keyboard, forms, loading/disabled, focus, token resolution, reduced motion, forced colors and axe scans in light/dark. The component also renders on the server. These checks do not establish full WCAG conformance; screen-reader behavior and other browser engines require release validation. Applications own async error/success announcements, focus movement following navigation and meaningful slot content.
