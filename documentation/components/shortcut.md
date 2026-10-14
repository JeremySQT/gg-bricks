# Shortcut

## Overview

A shortcut shows a keyboard combination as a hint: ⌘K after a command, Ctrl+Shift+P beside a menu item, a row of keycaps in a help page. You write the combination once in a platform-neutral notation (`Mod+K`) and the component renders it in the conventions of the user's platform: Apple glyphs juxtaposed on a Mac (⌘K), short names joined by “+” elsewhere (Ctrl+K), with the modifiers in the canonical order of that platform whatever order you wrote them in.

The shortcut is inline text in the indicator typography, in the color of its context. Its plain appearance sits beside a label at a lighter opacity so that it is not read as part of the label; its keycap appearance draws each key as a small cap for help pages and cheat sheets. Assistive technology hears a spoken equivalent in words (“Command K”), never the glyphs or the plus signs.

## When to use

Use a shortcut wherever the interface reminds the user of a key combination.

- After a menu item, a command palette entry or a list action, in the text color of the item (plain appearance).
- In the trailing slot of a Button, in the button's size and content color (plain appearance).
- In a tooltip or an inline help sentence (plain appearance).
- As keycaps in a help page, a cheat sheet or documentation, on a neutral surface (keycap appearance).
- When one notation must serve every platform: `Mod` becomes Command on Apple platforms and Control elsewhere, detected automatically or forced to show both forms side by side.

## When not to use

- Key sequences (“G then I”, “Ctrl+K Ctrl+S”): compose two shortcuts in a sentence; the notation describes keys pressed together.
- Handling the keys: the component only displays the combination; the application binds it.
- A shortcut quoted in a sentence where no visual distinction is wanted: plain text.
- A quantity (“Inbox 8”): use Counter. A status or a category: use Badge (planned).
- Mouse or touch gestures (click, drag, swipe): not keyboard input.
- Keycaps inside a Button or on a colored control: use the plain appearance there; keycaps are for neutral surfaces.

## Anatomy

The annotated anatomy lives on the Figma specification page of the component (frame “Shortcut — Specification”, `foundations/components/content/shortcut/figma-spec.md` gives the links; a capture is kept in `reports/components/shortcut/figma/specification.png`). Text equivalent, from the outside in:

| #   | Part      | Required | Role                                                                                                                                                                                                                                                                                                |
| --- | --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Container | yes      | The inline box holding the keys on one line, aligned on the text baseline of its context. In the plain appearance it carries the lighter opacity; in the keycap appearance it spaces the caps by a small gap.                                                                                       |
| 2   | Key       | yes      | One per resolved key: a modifier glyph or name (⌘, Ctrl), a special key (↩, Esc, F5), an arrow or a literal character. Plain: text placed by its box. Keycap: a cap with a surface, a thin border inside it, rounded corners, side padding and no vertical padding, at least as wide as it is tall. |
| 3   | Separator | platform | The “+” between consecutive keys on non-Apple platforms, in the inherited color and outside any cap. Mac rendering juxtaposes the keys without a separator.                                                                                                                                         |

The keycap board of the specification shows the dimensions: the side padding and the gap between caps follow the density (2, 4 or 6 px); the border is 1 px; the cap is the line box of the typography plus two borders tall (17.4, 18.8 or 21.6 px for sm, md, lg).

The spoken equivalent is not a visual part: it is the accessible text and is never displayed.

## Usage guidelines

**Notation.** Join key names with `+`: modifiers (`Mod`, `Ctrl`, `Alt`, `Shift`, `Meta`), special keys (`Enter`, `Escape`, `Tab`, `Space`, `Backspace`, `Delete`, `ArrowUp` to `ArrowRight`, `Home`, `End`, `PageUp`, `PageDown`, `F1` to `F12`, `Plus` for the + key) and literal keys (`K`, `,`). Names are matched ignoring case and common aliases are accepted (`Cmd`, `Option`, `Esc`, `Return`, `Up`). Write `Mod` for the primary modifier of the platform rather than `Ctrl` or `Meta`, unless the shortcut really differs from the platform convention.

**Platform.** Leave `platform` on `auto` in an application: the server and the first render show the generic form, then the browser's platform is detected and the component re-renders once on Apple platforms. Force `mac` or `other` in documentation, screenshots and tests, or when the application already knows the platform.

**Appearance.** Beside a label (menu item, button, tooltip) use the plain appearance: it is text, lighter than the label so that “Save ⌘S” reads as a label with a hint. Use keycaps only where the keys are the subject (help pages, cheat sheets) and the backdrop is a neutral surface; never inside a Button or on a colored control.

**Size.** Use the size of the host: inside a Button pass the button's size unchanged; beside body text, `md`; beside small labels, `sm`.

**Color.** The shortcut has no color of its own: text, glyphs and separators take the color of the context, so a disabled menu item or a solid button renders it correctly without an option.

**Spoken equivalent.** The generated words are English (“Control Shift P”). Pass `label` to replace them in another language or with product wording (“Open the command palette”); a blank label is ignored.

Do: `Save <Shortcut keys="Mod+S" />` in a menu item, plain, in the item's color.
Don't: a keycap shortcut inside a solid Button, or `keys="Ctrl+S"` where Command is expected on a Mac.

## Examples

The verified source of every example is `examples/shortcut/App.svelte`, the review page of the component (`npm run build && npm run build:preview shortcut` produces a self-contained page).

### The usual case

```svelte
<script lang="ts">
  import { Shortcut } from '@ggbrick/svelte';
</script>

<button type="button" class="menu-item">Save <Shortcut keys="Mod+S" /></button>
```

On a Mac this shows ⌘S and is announced “Command S”; elsewhere Ctrl+S, announced “Control S”.

### Both platforms side by side

```svelte
<Shortcut keys="Mod+Shift+P" platform="mac" />
<!-- ⇧⌘P, “Shift Command P” -->
<Shortcut keys="Mod+Shift+P" platform="other" />
<!-- Ctrl+Shift+P, “Control Shift P” -->
```

### Keycaps in a help page

```svelte
<p>Use <Shortcut keys="Mod+K" appearance="keycap" /> to open the command palette.</p>
```

### Inside a Button

The shortcut takes the button's size and content color; the button hides it from assistive technology.

```svelte
{#snippet save()}<Shortcut keys="Mod+S" size="md" />{/snippet}

<Button label="Save" trailing={save} />
```

### A custom spoken equivalent

```svelte
<Shortcut keys="Mod+K" label="Ouvrir la palette de commandes" />
```

### Difficult cases

- A long combination (`Ctrl+Alt+Shift+Meta+Delete`) stays on one line and overflows a too-narrow container rather than wrapping (`#nowrap` on the review page).
- An unknown name is shown as written (`Mod+Foo` shows ⌘Foo); an empty token (`Ctrl++K`) is dropped; a lowercase letter is uppercased (`#unknown`, `#empty-token`, `#lowercase`).
- Plain and keycap shortcuts in a sentence align on the text baseline (`#inline-plain`, `#inline-keycap`).
- In a right-to-left paragraph the keys keep their order and the caps follow the context (`#rtl`).

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

Resolution rules, from the contract: `Mod` is Meta on `mac` and Ctrl on `other`; modifiers come first in the canonical order (mac: Ctrl, Alt, Shift, Meta; other: Meta, Ctrl, Alt, Shift), then the other keys in the order given; mac shows ⌃ ⌥ ⇧ ⌘ ↩ ⎋ ⇥ ⌫ ⌦ ↖ ↘ ⇞ ⇟ with Space and the function keys by name; other shows Ctrl, Alt, Shift, Win, Enter, Esc, Tab, Space, Backspace, Del, Home, End, PgUp, PgDn, F1 to F12; arrows show ↑ ↓ ← → and `Plus` shows + everywhere. The platform-independent options and rules are in `foundations/components/content/shortcut/contract.json`; the Figma master exposes Appearance, Platform and Size as variants and up to three keys as nested text properties.

Visual tokens: `typography.indicator.{size}`, `opacity.muted` (plain), and for keycaps `color.surface.subtle`, `color.border.default`, `border.width.default`, `radius.control` and `space.content.xs` (gap and side padding), so brands, appearances and densities apply without any prop.

## Accessibility

What the component guarantees:

- The accessible text is a spoken equivalent in words in the display order (“Shift Command P”), or `label`; the glyphs and the “+” separators are presentation only and never read.
- The root is a `kbd` element, the HTML element for keyboard input, with no added role and no place in the tab order.
- Text, glyphs and separators take the color of the context, so a shortcut keeps the contrast of the text around it; keycaps keep a visible boundary in forced-colors mode and a plain shortcut is then shown at full opacity.
- The combination stays on one line and is never truncated; it scales with its typography.

What the integration must provide:

- A spoken equivalent in the user's language through `label` when English words are not acceptable.
- Inside a Button, nothing more: the Button hides its trailing content, so the shortcut there is a visual hint; make sure the shortcut is discoverable elsewhere (a menu, a help page) if it matters.
- Enough contrast for a plain shortcut beside its label: at the muted opacity the hint may fall below 4.5:1 on some solid buttons (worst measured 3.3:1 on solid accent and danger buttons), an accepted exception for an indicative hint that is hidden from assistive technology there; on text surfaces the system's content colors keep it above 4.5:1.

Relevant WCAG 2.2 success criteria:

| Criterion                                                                                                 | Level | Relevance                                                                                             | Responsibility                                                                         |
| --------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)               | A     | Glyphs such as ⌘ and ⇧ have a text alternative in words.                                              | Component                                                                              |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)   | A     | `kbd` conveys keyboard input; the hint follows the label it belongs to in the reading order.          | Component (element), integration (placement)                                           |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)             | AA    | A plain shortcut at the muted opacity beside its label; keycap text on its surface.                   | Integration for the context color; accepted exception inside solid Buttons (see above) |
| [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)            | AA    | The keycap border against a neutral surface.                                                          | Component (tokens checked on the documented backdrops)                                 |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                               | A     | The shortcut documents a keyboard path; the application must actually bind it.                        | Integration                                                                            |
| [2.1.4 Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html) | A     | A single-character shortcut shown here must be remappable or active only on focus in the application. | Integration                                                                            |
| [3.1.2 Language of Parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html)             | AA    | The generated spoken words are English; pass `label` in the page's language when it is not English.   | Integration                                                                            |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)               | A     | Native `kbd` semantics, accessible text from the spoken equivalent or `label`.                        | Component                                                                              |

Validation status: automated checks only, in Chromium: the accessible names of hosts containing shortcuts, axe-core on the review page in light and dark appearances (0 violations apart from the accepted contrast exception inside Buttons), keycap geometry in three densities, inherited color inside every Button intent, appearance and state and in menu items, forced colors, computed values in the 18 brand × appearance × density contexts (`tests/browser/shortcut.spec.ts`, `reports/components/shortcut/`). No assistive-technology test has been run yet; listing these criteria is not a conformance claim.
