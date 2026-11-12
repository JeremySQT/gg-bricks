# Menu

## Overview

A menu offers a short list of actions or links in a panel opened from a button: the actions of a table row behind a More button, an account menu, the export options of a report. Activating an item performs it and closes the menu. Menu holds MenuItem, MenuSeparator and MenuGroup children, documented on this page.

## Anatomy

| #   | Part          | Required | Role                                                                                                                                 |
| --- | ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Trigger       | yes      | Exactly one Button or IconButton; it opens the menu, Down and Up Arrow open it too, and it exposes whether the menu is expanded.     |
| 2   | Panel         | yes      | The surface that holds the MenuItem, MenuSeparator and MenuGroup children, as wide as its widest item, at least the trigger's width. |
| 3   | Leading       | no       | One decorative icon before the item label; the label is required, on one line, shortened with an ellipsis.                           |
| 4   | Trailing      | no       | One Shortcut showing the keyboard shortcut of the same action elsewhere in the page; it does not make the shortcut work.             |
| 5   | MenuSeparator | no       | A line across the panel between two items or groups; it is never focused or highlighted.                                             |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/menu.json`.

## When to use

- A handful of actions on one object that do not fit, or need not stay, on screen: row actions behind a More button.
- An account or application menu whose items are links.
- Related actions gathered under group headings, with a destructive action set apart.

## When not to use

- Choosing a value in a form: RadioGroup for a few options, Select for more.
- Free content, a form or controls in a panel next to a button: Popover.
- Two or three actions that fit on screen: Buttons in a ButtonGroup.
- Options that stay checked, or nested submenus: not built in; Menu holds actions and links only.
- A menu opened by a right click: ContextMenu (planned).
- A bar of controls with arrow-key navigation: Toolbar.

## Best practices

| Guidance | Topic       | Practice                                                                                                                        |
| -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Labels      | Name each item with a short verb phrase (“Rename”, “Duplicate”, “Download as PDF”): the label is the item's accessible name.    |
| Do       | Trigger     | Use a Button whose label says what the menu is about, or an IconButton with a label such as “More actions”.                     |
| Do       | Name        | Set `label` when the trigger's name does not describe the menu, for example a More button in each row (“Report actions”).       |
| Do       | Destructive | Give a destructive item `intent="danger"` and put it last, after a MenuSeparator.                                               |
| Do       | Groups      | Gather related items in a MenuGroup with a short heading when the menu mixes kinds of actions.                                  |
| Do       | Disabled    | Keep an unavailable item disabled rather than removing it when users expect it there, and say why elsewhere if it is not clear. |
| Do       | Values      | Give items a `value` when their labels may change or be translated: `onselect` reports it, the label otherwise.                 |
| Do       | Links       | Pass `href` to an item that opens another page; it keeps the item's appearance and keyboard behavior.                           |
| Don't    | Content     | Put fields, checkboxes or paragraphs in a menu: use a Popover for free content.                                                 |
| Don't    | Shortcuts   | Show a Shortcut for a key the application does not handle: the trailing slot only displays it.                                  |
| Don't    | Length      | Hide most of a page's actions in one long menu: the panel scrolls, but scanning a long list is slow.                            |
| Don't    | Icons       | Rely on a leading icon alone to tell items apart: icons are decorative and are not announced.                                   |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/menu/App.svelte`, not shipped in the package). Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set.

### The usual case

The trigger snippet receives the attributes that make a Button a menu button; spread them on it. `onselect` reports the value of the activated item.

```svelte live
<script lang="ts">
  import { Button, Menu, MenuItem, MenuSeparator } from '@ggbrick/svelte';

  let last = $state('none');

  function run(value: string) {
    // The application's action.
    last = value;
  }
</script>

<Menu onselect={run}>
  {#snippet trigger(props)}<Button label="Actions" intent="neutral" appearance="outline" {...props} />{/snippet}
  <MenuItem label="Rename" value="rename" />
  <MenuItem label="Duplicate" value="duplicate" />
  <MenuItem label="Move to" value="move" />
  <MenuSeparator />
  <MenuItem label="Delete" value="delete" intent="danger" />
</Menu>
<p>Last action: {last}</p>
```

### Row actions behind an icon button

An IconButton trigger, the panel aligned with its end, a `label` that names the menu, and a link item.

```svelte live
<script lang="ts">
  import { Icon, IconButton, Menu, MenuItem } from '@ggbrick/svelte';

  // Phosphor “dots three”, standing in for your icon set.
  const more =
    'M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z';
</script>

<Menu label="Report actions" align="end">
  {#snippet trigger(props)}
    <IconButton label="More actions" {...props}>
      {#snippet icon()}<Icon><path d={more} /></Icon>{/snippet}
    </IconButton>
  {/snippet}
  <MenuItem label="Open in a new tab" href="#fragments" />
  <MenuItem label="Download" />
  <MenuItem label="Remove" intent="danger" />
</Menu>
```

### Icons, shortcuts and groups

Items without an icon keep the label alignment of those with one; group headings align with the labels too.

```svelte live
<script lang="ts">
  import { Button, Icon, Menu, MenuGroup, MenuItem, MenuSeparator, Shortcut } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<Menu>
  {#snippet trigger(props)}<Button label="Report" intent="neutral" appearance="outline" {...props} />{/snippet}
  <MenuGroup label="Create">
    <MenuItem label="New section" leading={plus}>
      {#snippet trailing()}<Shortcut keys="Mod+Enter" size="sm" />{/snippet}
    </MenuItem>
    <MenuItem label="New comment" />
  </MenuGroup>
  <MenuGroup label="Export">
    <MenuItem label="Download as PDF" leading={download} />
    <MenuItem label="Download as CSV" />
  </MenuGroup>
  <MenuSeparator />
  <MenuItem label="Delete report" intent="danger" leading={trash} />
</Menu>
```

### A disabled item and the open state

A disabled item is reached by the arrow keys and announced as unavailable, but activating it does nothing. `bind:open` follows the menu; `onopenchange` reports only what the user does.

```svelte live
<script lang="ts">
  import { Button, Menu, MenuItem } from '@ggbrick/svelte';

  let open = $state(false);
  let changes = $state(0);
</script>

<Menu bind:open onopenchange={() => changes++}>
  {#snippet trigger(props)}<Button label="Share" intent="neutral" appearance="outline" {...props} />{/snippet}
  <MenuItem label="Copy link" />
  <MenuItem label="Send by email" />
  <MenuItem label="Publish to the web" disabled />
</Menu>
<p>Open: {open ? 'yes' : 'no'} · changes by the user: {changes}</p>
```

### Difficult cases

- Keyboard: arrows wrap and skip separators and headings, Home, End and typeahead; Down or Up Arrow on the trigger opens on the first or last enabled item; Escape and Tab close (`#playground`).
- Opening by pointer focuses the menu without highlighting an item; the pointer moves the single highlight (`#playground`).
- A label too long for the panel ends with an ellipsis, and a link item navigates and still reports its value (`#compositions`).
- A long menu in a short viewport scrolls and keeps the highlighted item visible (`#compositions`).
- A menu in a dark subtree and a clipped container takes the dark appearance and is not clipped (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5, on the shared overlay module; Bits UI is not used). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Menu, MenuItem, MenuSeparator, MenuGroup } from '@ggbrick/svelte';
import type {
  MenuProps,
  MenuTriggerProps,
  MenuItemProps,
  MenuGroupProps,
  MenuSeparatorProps,
  MenuSide,
  MenuAlign,
  MenuItemIntent
} from '@ggbrick/svelte';
```

Menu renders its trigger snippet, then a `<div class="ggb-menu ggb-overlay">` (plus any class you pass) with `role="menu"`, `tabindex="-1"` and the `popover="auto"` attribute, which places it in the top layer above the page; where the platform has no top layer, it is stacked at `layer.dropdown`. There is no portal: the panel stays next to its trigger in the DOM and inherits the brand, appearance and density of that place. It is named by `aria-label` when `label` is set and by `aria-labelledby` (the trigger) otherwise, and carries `data-side` and `data-align`. It is placed with CSS anchor positioning, or measured by a script where the browser lacks it (`data-positioning="measured"`, `data-placed-side`). It enters by fading in and moving slightly away from the trigger and leaves by fading out, in CSS only; under reduced motion it only fades.

| Prop           | Type                                | Default    | Description                                                                                                               |
| -------------- | ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean` (bindable)                | `false`    | Shown state; bind it with `bind:open`. Setting it from the application shows or hides the menu without events.            |
| `label`        | `string`                            | —          | Accessible name of the menu, when the trigger's name does not describe it; by default the trigger names it.               |
| `side`         | `'bottom' \| 'top'`                 | `'bottom'` | Preferred side; the panel flips to the other side and shifts along the edge when the viewport lacks room.                 |
| `align`        | `'start' \| 'center' \| 'end'`      | `'start'`  | Alignment with the trigger's start, center or end, in the reading direction.                                              |
| `trigger`      | `Snippet<[MenuTriggerProps]>`       | required   | Renders the trigger, one Button or IconButton: spread the argument on it (`<IconButton label="More" {...props} />`).      |
| `children`     | `Snippet`                           | required   | MenuItem, MenuSeparator and MenuGroup children.                                                                           |
| `onselect`     | `(value: string) => void`           | —          | Called with the value of the item the user activates (pointer, Enter or Space).                                           |
| `onopenchange` | `(open: boolean) => void`           | —          | Called when the user opens or closes the menu: trigger, arrow keys on the trigger, an item, Escape, Tab, a press outside. |
| `id`           | `string`                            | generated  | id of the panel; the trigger gets `<id>-trigger`.                                                                         |
| `ref`          | `HTMLDivElement \| null` (bindable) | `null`     | The panel element.                                                                                                        |
| `class`        | `string`                            | —          | Merged with `ggb-menu`.                                                                                                   |

The trigger snippet's argument, `MenuTriggerProps`, holds `id`, `popovertarget`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, `onkeydown` and `onpointerdown`; spread all of them on the Button or IconButton. Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the panel, except those the component owns: `children`, `role`, `aria-label`, `aria-labelledby`, `popover`, `id` (the prop above) and `onselect`.

MenuItem renders a `<div class="ggb-menu__item" role="menuitem" tabindex="-1">`, or an `<a>` with the same class and role when `href` is set and the item is not disabled. It carries `data-intent`, `data-value`, `data-label`, and `data-disabled` with `aria-disabled="true"` when disabled; leading and trailing content is hidden from assistive technology.

| Prop       | Type                    | Default     | Description                                                                                                                |
| ---------- | ----------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `label`    | `string`                | required    | The action, on one line, and the item's accessible name. An empty or blank label throws, on the server and in the browser. |
| `value`    | `string`                | `''`        | Identifies the item in `onselect`; when empty, the label is reported.                                                      |
| `intent`   | `'neutral' \| 'danger'` | `'neutral'` | `danger` paints the label and the leading icon in the danger color, for a destructive action.                              |
| `href`     | `string`                | —           | Renders a link: activating the item navigates there and still reports `onselect`. A disabled item has no destination.      |
| `disabled` | `boolean`               | `false`     | Stays in the menu, reached by the arrow keys and announced unavailable; activating it does nothing.                        |
| `leading`  | `Snippet`               | —           | One decorative Icon before the label, sized and colored by the item.                                                       |
| `trailing` | `Snippet`               | —           | One Shortcut (size `sm`) showing the keyboard shortcut of the same action elsewhere; display only.                         |
| `class`    | `string`                | —           | Merged with `ggb-menu__item`.                                                                                              |

Every other attribute of `HTMLAttributes<HTMLElement>` is forwarded to the item, except `children`, `role`, `tabindex` and `aria-disabled`.

MenuGroup renders a `<div class="ggb-menu__group" role="group">` named by its heading, a `<div class="ggb-menu__group-heading">` that is not an item and is never highlighted.

| Prop       | Type      | Default  | Description                                                                            |
| ---------- | --------- | -------- | -------------------------------------------------------------------------------------- |
| `label`    | `string`  | required | The heading shown above the items; it names the group. An empty or blank label throws. |
| `children` | `Snippet` | required | MenuItem children.                                                                     |
| `class`    | `string`  | —        | Merged with `ggb-menu__group`.                                                         |

MenuSeparator renders a `<div class="ggb-menu__separator" role="separator">` and takes no props besides `class` (merged) and forwarded attributes. Every other attribute of `HTMLAttributes<HTMLDivElement>` is forwarded to the group or the separator, except `children` and `role`. The platform-independent contract, with its `item`, `separator` and `group` children, ships as `contracts/menu.json`.

## Accessibility

The component provides:

- The menu button pattern: the trigger has `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`; the panel is a menu named by `label` or by the trigger, with menu items, groups named by their heading and separators.
- Opening by keyboard (Enter, Space or Down Arrow) highlights the first enabled item, Up Arrow the last enabled one; opening by pointer focuses the menu without a highlight, and the first arrow key then highlights the first or last enabled item. The highlighted item is the focused one, and only one item is highlighted.
- Down and Up Arrow move the highlight and wrap, skipping separators and headings; Home and End go to the first and last item; typing characters moves to the next item whose label starts with them; Enter and Space activate. Disabled items are reached and announced unavailable, but not activated.
- Activating an item closes the menu and returns focus to the trigger, unless it navigates; Escape closes back to the trigger; Tab closes and moves focus on from the trigger; a press outside closes the menu.
- The highlighted item kept visible in a scrolling panel; a visible panel edge, the system highlight colors and disabled items in the system disabled color in forced colors; motion reduced to a fade under reduced motion.

The integration provides:

- A trigger with a meaningful name, a `label` when that name does not describe the menu, and item labels that make sense on their own.
- The keyboard shortcuts that trailing Shortcuts display, and a status message when the result of an action must be announced.
- Contrast with backgrounds other than the system surfaces, and an explanation of why an item is disabled when it is not obvious.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ----- | -------------------------------------------------------------------- |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)            | A     | Component (menu, items, named groups, separators)                    |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component, on the system surfaces (labels, danger items, headings)   |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                           | AA    | Component (width capped by the viewport, scrolling panel)            |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                            |
| [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)                        | A     | Component (Escape and Tab close)                                     |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                                  | A     | Component (focus returns to the trigger)                             |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component (the highlighted item)                                     |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Component (highlighted item kept visible); integration (sticky bars) |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                              | A     | Component (items); integration (the trigger's label)                 |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                | AA    | Component (items across the panel, taller than the minimum target)   |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                            |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                          | AA    | Integration                                                          |

Beyond A and AA, the fade without movement under reduced motion serves [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) (AAA).

Validated by automated checks in Chromium (opening on the first or last enabled item, axe-core in light and dark, roles and names, the trigger state, keyboard navigation and typeahead, pointer highlight, closing by Escape, Tab and a press outside, link items, truncation, scrolling, forced colors, computed values in four representative contexts) and by a smoke test in Firefox and WebKit (Down Arrow opens on the first item, Enter selects and returns focus to the trigger); no assistive-technology test yet. This list is not a conformance claim.
