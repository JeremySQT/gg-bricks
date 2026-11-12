# Toolbar

## Overview

A toolbar gathers the frequently used controls of one area into a single stop in the Tab sequence, with the arrow keys to move between them: the actions on a table selection, the tools of an editor, the display options of a view. Toolbar holds Buttons, IconButtons, Menus, Popovers and ToolbarSeparator children, documented on this page.

## Anatomy

| #   | Part             | Required | Role                                                                                                                                                           |
| --- | ---------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Controls         | yes      | Two or more controls in source order: IconButtons, alone or in a Tooltip, Buttons, and Menu or Popover triggers; every one takes the toolbar's size.           |
| 2   | ToolbarSeparator | no       | A line between two sets of related controls, across the toolbar; it is never focused.                                                                          |
| 3   | Button           | no       | A control with a visible label; it keeps its intent and appearance, and a danger Button keeps its intent in the overflow menu too.                             |
| 4   | Overflow         | no       | Added by the toolbar, last on the line, while a horizontal toolbar lacks room: an IconButton named by `overflowLabel` that opens a Menu of the moved controls. |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/toolbar.json`.

## When to use

- The frequent actions on a selection or an object, such as the rows selected in a table, with the less frequent ones in a Menu.
- The tools of an editor or a canvas, as IconButtons named by Tooltips.
- The display options of a view: a Popover of filters next to a Menu of sort orders.
- A row of controls in a space whose width varies, where the controls that do not fit should wait in a menu rather than wrap.

## When not to use

- A few independent actions, each its own Tab stop, such as a dialog footer: ButtonGroup.
- A choice among options that stays selected: RadioGroup, or SegmentedControl (planned).
- Buttons that stay pressed, such as Bold in an editor: not built in; Toolbar holds actions, menus and popovers.
- A search field, a Select, a Combobox or any control that uses the arrow keys itself: place it next to the toolbar, not inside it.
- A list of actions in a panel opened from one button: Menu.
- Switching between views of the same area: Tabs.

## Best practices

| Guidance | Topic     | Practice                                                                                                                          |
| -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label     | Name the toolbar after its area with `label` (“Selection actions”, “Drawing tools”): it is announced when focus enters.           |
| Do       | Order     | Put the most frequent controls first: when room runs short, the last ones move into the overflow menu first.                      |
| Do       | Triggers  | Place a Menu or Popover trigger where it can stay: it never moves, so the controls before it move first when room runs short.     |
| Do       | Tooltips  | Wrap each IconButton in a Tooltip with the same text as its label, so that sighted users see the name without hearing it twice.   |
| Do       | Groups    | Separate sets of related controls with a ToolbarSeparator.                                                                        |
| Do       | Size      | Set `size` on the toolbar only: it applies to every Button and IconButton, Menu and Popover triggers included.                    |
| Do       | Overflow  | Translate `overflowLabel` with the page, or make it specific (“More selection actions”) when several toolbars share a view.       |
| Do       | Disabled  | Keep an unavailable control disabled rather than removing it: the arrow keys skip it, and a moved one stays disabled in the menu. |
| Don't    | Content   | Put text fields, Selects or other arrow-key controls in a toolbar: the arrow keys always move between its controls.               |
| Don't    | Wrappers  | Wrap controls in other elements: each direct child is measured and moved into the overflow menu on its own.                       |
| Don't    | Size      | Give a control its own size inside a toolbar: it is ignored.                                                                      |
| Don't    | Toggles   | Show a pressed state by changing a button's intent or appearance: it is not announced; toggle buttons are not built in.           |
| Don't    | Repeating | Wrap a Button in a Tooltip that repeats its visible label: the text is announced twice.                                           |
| Don't    | Vertical  | Count on a vertical toolbar to fit a short space: only a horizontal toolbar moves controls into the overflow menu.                |
| Don't    | Single    | Make a toolbar of one control: it needs two at least; use the Button or IconButton on its own.                                    |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/toolbar/App.svelte`, not shipped in the package). Glyphs come from `./glyphs`, a handful of Phosphor paths standing in for your icon set.

### The usual case

Actions on a selection: IconButtons named by Tooltips, a separator, and a Menu with a Button trigger. Tab enters on the first control; the arrow keys move between them.

```svelte live
<script lang="ts">
  import { Button, Icon, IconButton, Menu, MenuItem, Toolbar, ToolbarSeparator, Tooltip } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';

  // Phosphor “copy”, standing in for your icon set.
  const copy =
    'M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z';

  let last = $state('none');

  function run(action: string) {
    // The application's action.
    last = action;
  }
</script>

{#snippet duplicate()}<Icon><path d={copy} /></Icon>{/snippet}
{#snippet download()}<Icon><path d={phosphor['download-simple']} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<div style="inline-size: 100%">
  <Toolbar label="Selection actions">
    <Tooltip label="Duplicate">
      <IconButton label="Duplicate" icon={duplicate} onactivate={() => run('duplicate')} />
    </Tooltip>
    <Tooltip label="Download">
      <IconButton label="Download" icon={download} onactivate={() => run('download')} />
    </Tooltip>
    <Tooltip label="Delete">
      <IconButton label="Delete" icon={trash} intent="danger" onactivate={() => run('delete')} />
    </Tooltip>
    <ToolbarSeparator />
    <Menu onselect={run}>
      {#snippet trigger(props)}<Button label="Move to" intent="neutral" appearance="ghost" {...props} />{/snippet}
      <MenuItem label="Archive" value="archive" />
      <MenuItem label="Another project" value="move" />
    </Menu>
  </Toolbar>
  <p>Last action: {last}</p>
</div>
```

### Display options: a Popover and a Menu

The toolbar's size reaches the Popover and Menu triggers; the controls inside the popover panel keep their own size.

```svelte live
<script lang="ts">
  import { Button, ButtonGroup, Checkbox, Menu, MenuItem, Popover, Toolbar, ToolbarSeparator } from '@ggbrick/svelte';

  let sort = $state('date');
  let open = $state(false);
</script>

<div style="inline-size: 100%">
  <Toolbar label="View options" size="sm">
    <Popover label="Filters" bind:open>
      {#snippet trigger(props)}<Button label="Filter" intent="neutral" appearance="ghost" {...props} />{/snippet}
      <div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-sm)">
        <Checkbox label="Open issues" checked />
        <Checkbox label="Assigned to me" />
        <ButtonGroup align="end" size="sm">
          <Button label="Apply" onactivate={() => (open = false)} />
        </ButtonGroup>
      </div>
    </Popover>
    <Menu onselect={(value) => (sort = value)}>
      {#snippet trigger(props)}<Button label="Sort" intent="neutral" appearance="ghost" {...props} />{/snippet}
      <MenuItem label="By name" value="name" />
      <MenuItem label="By date" value="date" />
    </Menu>
    <ToolbarSeparator />
    <Button label="Reset" intent="neutral" appearance="ghost" onactivate={() => (sort = 'date')} />
  </Toolbar>
  <p>Sorted by {sort}</p>
</div>
```

### Controls that do not fit

In a narrow space, the last controls move into the overflow menu in order; choosing one there activates it, and the danger intent follows it.

```svelte live
<script lang="ts">
  import { Button, Toolbar } from '@ggbrick/svelte';

  let last = $state('none');

  // Stands in for the application's actions.
  const run = (action: string) => () => {
    last = action;
  };
</script>

<div style="inline-size: min(18rem, 100%)">
  <Toolbar label="Bulk actions" size="sm" overflowLabel="More bulk actions">
    <Button label="Assign" intent="neutral" appearance="outline" onactivate={run('assign')} />
    <Button label="Move" intent="neutral" appearance="outline" onactivate={run('move')} />
    <Button label="Label" intent="neutral" appearance="outline" onactivate={run('label')} />
    <Button label="Archive" intent="neutral" appearance="outline" onactivate={run('archive')} />
    <Button label="Delete" intent="danger" appearance="outline" onactivate={run('delete')} />
  </Toolbar>
  <p>Last action: {last}</p>
</div>
```

### A vertical toolbar with a disabled control

Down and Up Arrow move between the controls and skip the disabled one; a vertical toolbar is as wide as its widest control.

```svelte live
<script lang="ts">
  import { Icon, IconButton, Toolbar, ToolbarSeparator, Tooltip } from '@ggbrick/svelte';
  import { phosphor } from './glyphs';

  // Phosphor “pencil simple”, standing in for your icon set.
  const pencil =
    'M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z';

  let selected = $state(false);
</script>

{#snippet plus()}<Icon><path d={phosphor.plus} /></Icon>{/snippet}
{#snippet draw()}<Icon><path d={pencil} /></Icon>{/snippet}
{#snippet trash()}<Icon><path d={phosphor.trash} /></Icon>{/snippet}

<div>
  <Toolbar label="Drawing tools" orientation="vertical" size="sm">
    <Tooltip label="Add a shape">
      <IconButton label="Add a shape" icon={plus} onactivate={() => (selected = true)} />
    </Tooltip>
    <Tooltip label="Draw">
      <IconButton label="Draw" icon={draw} />
    </Tooltip>
    <ToolbarSeparator />
    <Tooltip label="Delete the shape">
      <IconButton
        label="Delete the shape"
        icon={trash}
        intent="danger"
        disabled={!selected}
        onactivate={() => (selected = false)}
      />
    </Tooltip>
  </Toolbar>
</div>
```

### Difficult cases

- Keyboard: one Tab stop that remembers the last focused control, arrows that wrap and skip a disabled control and the separator, Home and End, Tab leaving the toolbar (`#playground`).
- Down Arrow on a Menu trigger opens its menu in a horizontal toolbar and moves focus in a vertical one; closing a menu or a popover returns focus to its trigger (`#playground`, orientation).
- A text field inside a Popover keeps its arrow keys for editing; only the toolbar's own controls answer them (`#playground`).
- At a narrow viewport, Download moves into the overflow menu while the Filter and Sort triggers stay; a disabled control moved there stays disabled; widening brings every control back (`#playground`).
- The three sizes, a vertical toolbar, and a narrow column whose last Buttons, a danger Delete among them, move into the overflow menu (`#compositions`).

## API

Import from `@ggbrick/svelte` (Svelte 5; Bits UI is not used). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { Toolbar, ToolbarSeparator } from '@ggbrick/svelte';
import type { ToolbarProps, ToolbarSeparatorProps, ToolbarSize, ToolbarOrientation } from '@ggbrick/svelte';
```

Toolbar renders a `<div class="ggb-toolbar">` (plus any class you pass) with `role="toolbar"`, `aria-label`, `aria-orientation`, `data-size` and `data-orientation`, holding the children, then a `<div class="ggb-toolbar__overflow">`: a Menu whose trigger is an IconButton of the toolbar's size, neutral and ghost, showing three dots, hidden while nothing has moved. The toolbar adds no surface, border or padding of its own. A horizontal toolbar fills the inline size of its container and never wraps; a vertical one is as wide as its widest control.

| Prop            | Type                                | Default        | Description                                                                                                                                      |
| --------------- | ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`         | `string`                            | required       | Accessible name of the toolbar. An empty or blank label throws, on the server and in the browser.                                                |
| `size`          | `'sm' \| 'md' \| 'lg'`              | `'md'`         | Size of every Button and IconButton of the toolbar, including Menu and Popover triggers and the controls inside Tooltips, and of the gap.        |
| `orientation`   | `'horizontal' \| 'vertical'`        | `'horizontal'` | `horizontal`: one line; the controls that do not fit move into the overflow menu. `vertical`: one column; the arrow keys follow the orientation. |
| `overflowLabel` | `string`                            | `'More'`       | Accessible name of the IconButton that opens the overflow menu.                                                                                  |
| `children`      | `Snippet`                           | required       | Buttons, IconButtons, Tooltips around one IconButton or Button, Menus, Popovers and ToolbarSeparators, in order, as direct children.             |
| `ref`           | `HTMLDivElement \| null` (bindable) | `null`         | The toolbar element.                                                                                                                             |
| `class`         | `string`                            | —              | Merged with `ggb-toolbar`.                                                                                                                       |

Every other attribute of `HTMLAttributes<HTMLDivElement>` (`id`, `style`, `aria-describedby`…) goes to the toolbar element, except those the component owns: `children`, `role` and `aria-label`; `aria-orientation` follows `orientation`. The toolbar emits no event: each control keeps its own `onactivate`, and a Menu its `onselect`. The size reaches the controls through the Svelte context ButtonGroup uses: the content of a Popover panel does not receive it.

Roving focus: the toolbar treats every `button`, `a[href]` and `[role="button"]` inside it as a control, except those in an open Menu or Popover panel and those moved into the overflow menu, and writes their `tabindex` (`0` on the current one, `-1` on the others), kept in sync with a `MutationObserver`. Disabled controls (`:disabled` or `aria-disabled="true"`, which a loading Button or IconButton also carries) are skipped. Arrow, Home and End keys are handled in the capture phase, only when they come from a control and without Alt, Ctrl or Meta.

Overflow: in the browser, the toolbar watches its own size with a `ResizeObserver` and its content with a `MutationObserver`, and measures the boxes of its direct children; nothing is measured on the server, where every control renders on the line. When the line does not fit, it shows the overflow trigger, then hides direct children from the end, with `data-ggb-overflowed`, until it fits, and sets `data-overflowing` on the toolbar. A Button, an IconButton or a Tooltip around one moves; a Menu or Popover trigger never does. A separator next to a moved control, or left at an end of the line, is hidden too. Each moved control becomes a menu item with its accessible name, its icon, its disabled state and, for intent `danger`, the danger intent; choosing it clicks the original control, which runs its `onactivate`.

ToolbarSeparator renders a `<div class="ggb-toolbar__separator" role="separator">` whose `aria-orientation` is perpendicular to the toolbar (vertical in a horizontal toolbar). It takes no props besides `class` (merged) and forwarded attributes: every other attribute of `HTMLAttributes<HTMLDivElement>`, except `children` and `role`. The platform-independent contract, with its `separator` child, ships as `contracts/toolbar.json`.

## Accessibility

The component provides:

- The toolbar pattern: `role="toolbar"` named by `label`, with its orientation; separators exposed as separators, perpendicular to the toolbar and never focused.
- One stop in the Tab sequence, landing on the last focused control, or on the first enabled one the first time; Tab and Shift+Tab leave the toolbar.
- In a horizontal toolbar, Right and Left Arrow move to the next and previous enabled control, reversed in right-to-left text; in a vertical toolbar, Down and Up Arrow do. Both wrap at the ends; Home and End go to the first and last enabled control; disabled controls, separators and moved controls are skipped; the overflow trigger is the last control.
- Each control keeps its own activation with Enter or Space. In a horizontal toolbar, Down and Up Arrow on a Menu trigger open its menu; in a vertical toolbar they move focus. Keys inside an open menu or popover stay with it, and closing it returns focus to its trigger, which stays the toolbar's stop.
- No horizontal scrolling: controls that do not fit wait in the overflow menu in source order, with their name, icon, disabled state and danger intent, and come back when room returns.
- One size for every control, so that each keeps the target size and the focus ring of its own component; the separator drawn in the system text color in forced colors.

The integration provides:

- A `label` that names the area, a meaningful label on each control, and a Tooltip with the same text on each IconButton.
- No control that uses the arrow keys itself inside the toolbar; a field in a Popover panel is fine.
- An `overflowLabel` in the language of the page, a status message when the result of an action must be announced, and a visible reason for each disabled control.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                           |
| ------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------ |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (named toolbar, orientation, separators)                       |
| [1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)       | A     | Component (source order, kept in the overflow menu); integration (order) |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Component (overflow menu instead of horizontal scrolling)                |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                             | A     | Component                                                                |
| [2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)             | A     | Component (Tab leaves the toolbar)                                       |
| [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)                       | A     | Component (one stop, focus returns to the trigger)                       |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Component, through Button and IconButton                                 |
| [2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)                   | A     | Component (moved controls keep their name); integration (labels)         |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Component, through Button and IconButton                                 |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component (toolbar); integration (the label and each control's label)    |
| [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)               | AA    | Integration                                                              |

Validated by automated checks in Chromium (axe-core in light and dark, no horizontal scrolling at 390 px, role, name and orientation, perpendicular separators, one Tab stop that remembers the last control, arrow keys that wrap and skip a disabled control and a separator, Home and End, Down Arrow opening a menu in a horizontal toolbar and moving focus in a vertical one, focus returning from a menu and a popover, arrow keys kept by a field in a popover, the size on every control, the overflow menu in source order with activation from it, disabled and danger controls carried into it and the return to the line, computed gap, separator and control heights in four representative contexts) and by server-rendering checks (role, name, orientation, size on every control, a blank label rejected); not yet checked in right-to-left text, in forced colors or in Firefox and WebKit, and no assistive-technology test yet. This list is not a conformance claim.
