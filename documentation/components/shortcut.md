# Shortcut

## Overview

A shortcut shows a keyboard combination as a hint: ⌘K after a command, Ctrl+Shift+P beside a menu item, keycaps in a help page. You write it once (`Mod+K`) and it renders in the conventions of the user's platform (⌘K on a Mac, Ctrl+K elsewhere), with a spoken equivalent for screen readers.

## Anatomy

| #   | Part      | Required | Role                                                                                                   |
| --- | --------- | -------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Container | yes      | The keys on one line, aligned on the text baseline.                                                    |
| 2   | Key       | yes      | One per key, modifiers first. Plain: text. Keycap: a cap with a surface, a border and rounded corners. |
| 3   | Separator | platform | The “+” between keys on other platforms; on a Mac the keys are juxtaposed.                             |

Keycap dimensions: A side padding and C gap between caps (2, 4 or 6 px with the density), B border (1 px), D cap height (the text line plus two borders).

## When to use

- After a menu item, a command palette entry or a list action.
- In the trailing slot of a Button.
- In a tooltip or a help sentence.
- As keycaps in a help page or a cheat sheet.

## When not to use

- A key sequence (“G then I”): write two shortcuts in a sentence.
- Handling the keys: the application binds them; the component only displays them.
- A quantity: Counter. A status or a category: Badge.
- Mouse or touch gestures.

## Best practices

| Guidance | Topic             | Practice                                                                                                                            |
| -------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Notation          | Write `Mod` for the platform's main modifier and join key names with `+`: `Mod+S`, `Mod+Shift+P`, `Escape`, `ArrowUp`.              |
| Do       | Platform          | Leave `platform` on `auto` in an application; force `mac` or `other` in documentation, screenshots and tests.                       |
| Do       | Appearance        | Use the plain appearance beside a label (menu item, button, tooltip), keycaps where the keys are the subject, on a neutral surface. |
| Do       | Size              | Use the size of the host: the button's size inside a Button, `md` beside body text, `sm` beside small labels.                       |
| Do       | Spoken equivalent | Pass `label` when the generated English words (“Control Shift P”) do not suit.                                                      |
| Don't    | Notation          | Write `Ctrl` or `Meta` for a shortcut that follows the platform convention: Mac users would see Control instead of Command.         |
| Don't    | Appearance        | Put keycaps inside a Button or on a colored control, or color a shortcut on its own.                                                |
| Don't    | Inside a Button   | Rely on a shortcut inside a Button being announced: the Button hides it.                                                            |

## Examples

The review page `examples/shortcut/App.svelte` covers every case.

### The usual case

```svelte live
<script lang="ts">
  import { Shortcut } from '@ggbrick/svelte';
</script>

<button type="button" class="menu-item">Save <Shortcut keys="Mod+S" /></button>

<style>
  /* The application's menu item: its own surface and text color, which the shortcut inherits. */
  .menu-item {
    display: flex;
    justify-content: space-between;
    gap: var(--ggb-space-content-lg);
    min-inline-size: 12rem;
    padding: var(--ggb-space-control-padding-block-md) var(--ggb-space-control-padding-inline-md);
    border: 0;
    border-radius: var(--ggb-radius-control);
    background: var(--ggb-color-surface-raised);
    color: var(--ggb-color-content-primary);
    font: var(--ggb-typography-body-md);
  }
</style>
```

On a Mac this shows ⌘S and is announced “Command S”; elsewhere Ctrl+S, announced “Control S”.

### Both platforms side by side

```svelte live
<Shortcut keys="Mod+Shift+P" platform="mac" />
<!-- ⇧⌘P, “Shift Command P” -->
<Shortcut keys="Mod+Shift+P" platform="other" />
<!-- Ctrl+Shift+P, “Control Shift P” -->
```

### Keycaps in a help page

```svelte live
<p>Use <Shortcut keys="Mod+K" appearance="keycap" /> to open the command palette.</p>
```

### Inside a Button

The shortcut takes the button's size and content color; the button hides it from assistive technology.

```svelte live
{#snippet save()}<Shortcut keys="Mod+S" size="md" />{/snippet}

<Button label="Save" trailing={save} />
```

### A custom spoken equivalent

```svelte live
<Shortcut keys="Mod+K" label="Ouvrir la palette de commandes" />
```

### Difficult cases

- A long combination stays on one line and overflows a too-narrow container rather than wrapping.
- An unknown name is shown as written (`Mod+Foo` shows ⌘Foo); an empty token (`Ctrl++K`) is dropped; a lowercase letter is uppercased.

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Shortcut } from '@ggbrick/svelte';
import type { ShortcutProps, ShortcutPlatform, ShortcutAppearance, ShortcutSize } from '@ggbrick/svelte';
```

Renders a `<kbd>` root holding a visually hidden `<span class="ggb-shortcut__name">` (the spoken equivalent or `label`) and an `aria-hidden` container with one nested `<kbd class="ggb-shortcut__key">` per key and a `<span class="ggb-shortcut__separator">` between keys on non-Apple platforms. The root carries `class="ggb-shortcut"` plus any class you pass, `data-platform` (the resolved platform, `mac` or `other`, never `auto`), `data-appearance` and `data-size`.

| Prop         | Type                             | Default   | Description                                                                                                                                                                                |
| ------------ | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `keys`       | `string`                         | required  | Platform-neutral combination: names joined by `+` (`Mod+Shift+P`), matched ignoring case, aliases accepted; any other name is a literal key shown as written (a single letter uppercased). |
| `platform`   | `'auto' \| 'mac' \| 'other'`     | `'auto'`  | `auto` renders the generic form first and switches to the Apple form after mount on Apple platforms; `mac` and `other` force the rendering.                                                |
| `appearance` | `'plain' \| 'keycap'`            | `'plain'` | `plain`: text placed by its box at the muted opacity. `keycap`: one cap per key, for neutral surfaces only.                                                                                |
| `size`       | `'sm' \| 'md' \| 'lg'`           | `'md'`    | Typography size, named like the host: pass the host's size unchanged.                                                                                                                      |
| `label`      | `string`                         | —         | Replaces the generated spoken equivalent as the accessible text (localization, product wording). A blank label is ignored.                                                                 |
| `ref`        | `HTMLElement \| null` (bindable) | `null`    | The rendered root element.                                                                                                                                                                 |
| `class`      | `string`                         | —         | Merged with `ggb-shortcut`.                                                                                                                                                                |

Every other attribute of `HTMLAttributes<HTMLElement>` is forwarded to the root, except `children`, which the component owns. There are no events: the component displays the combination and never handles it.

Resolution rules, from the contract: `Mod` is Meta on `mac` and Ctrl on `other`; modifiers come first in the canonical order (mac: Ctrl, Alt, Shift, Meta; other: Meta, Ctrl, Alt, Shift), then the other keys in the order given; mac shows ⌃ ⌥ ⇧ ⌘ ↩ ⎋ ⇥ ⌫ ⌦ ↖ ↘ ⇞ ⇟ with Space and the function keys by name; other shows Ctrl, Alt, Shift, Win, Enter, Esc, Tab, Space, Backspace, Del, Home, End, PgUp, PgDn, F1 to F12; arrows show ↑ ↓ ← → and `Plus` shows + everywhere. Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/shortcut.json`.

## Accessibility

The component provides:

- A spoken equivalent in words (“Shift Command P”) or `label` as accessible text; glyphs and “+” are never read.
- A `kbd` root with no role and no place in the tab order.
- The text color of its context; keycaps keep a visible boundary in forced colors, where a plain shortcut is shown at full opacity.

The integration provides:

- `label` in the page's language when English words are not acceptable.
- The keyboard binding itself, remappable for single-character shortcuts.
- Discoverability elsewhere for a shortcut shown inside a Button: there it is a visual hint, attenuated below 4.5:1 on some solid buttons (accepted exception).

| WCAG 2.2 criterion                                                                                        | Level | Responsibility                                       |
| --------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)               | A     | Component                                            |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)   | A     | Component (element), integration (placement)         |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)             | AA    | Integration; accepted exception inside solid Buttons |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)            | AA    | Component (keycap border on the system surfaces)     |
| [2.1.4 Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html) | A     | Integration                                          |
| [3.1.2 Language of Parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)             | AA    | Integration (`label`)                                |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)               | A     | Component                                            |

Validated by automated checks in Chromium (accessible names, axe-core in light and dark, keycap geometry, inherited color, forced colors, the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
