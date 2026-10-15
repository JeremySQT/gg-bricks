# Shape

## Overview

Corner radii are the main shape signature of a brand: a brand can make controls sharper and containers softer without any component change, because radius roles are named by what they round, not by their size.

## Radius

| Role               | Use for                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `radius.control`   | Controls: buttons, fields, segmented items.                                                              |
| `radius.focus`     | The focus ring around a control. Derived: `radius.control + focus.offset`, so the ring stays concentric. |
| `radius.container` | Cards, panels, code blocks, images inside content.                                                       |
| `radius.overlay`   | Floating layers: menus, popovers, dialogs.                                                               |
| `radius.indicator` | Small companion content: counters, keycaps. A rectangle with slightly rounded corners, never a pill.     |
| `radius.full`      | Pills and circles: avatars, round toggles.                                                               |

<!-- site:tokens preview=radius -->

## Borders and focus

| Role                   | Use for                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `border.width.default` | Every ordinary border and divider.                           |
| `border.width.strong`  | Emphasized boundaries (a selected card, a strong separator). |
| `focus.width`          | Width of focus outlines.                                     |
| `focus.offset`         | Gap between an element and its focus outline.                |

<!-- site:tokens preview=border -->

```css
.card:focus-visible {
  outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
  outline-offset: var(--ggb-focus-offset);
}
```

## Rules

- Round by role: a card uses `radius.container` even if a brand makes it equal to `radius.control`.
- Nested shapes: an inner element in a padded container looks best with a radius reduced by the padding; never larger than its container.
- Keep focus outlines visible on every focusable element; never remove them without an equivalent.
