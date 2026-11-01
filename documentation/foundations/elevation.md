# Elevation and layers

## Overview

Elevation tells what sits above what. A shadow draws the separation, a layer orders overlapping elements, and opacity roles dim, tint or veil content.

## Shadows

| Role             | Use for                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `shadow.raised`  | Elements lifted slightly above the page: raised cards, sticky headers. |
| `shadow.overlay` | Floating layers attached to a trigger: menus, popovers, dropdowns.     |
| `shadow.modal`   | Layers that block the page: dialogs, drawers.                          |

<!-- site:tokens preview=shadow -->

Pair each shadow with the matching surface: `color.surface.raised` with `shadow.raised`, `color.surface.overlay` with `shadow.overlay` and `shadow.modal`.

## Elevation border

| Role                     | Use for                                                                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color.elevation.border` | A `border.width.default` contour drawn by every raised or floating surface together with its shadow. Transparent in light; in dark, where a shadow on a dark background carries little, it draws the separation. |

<!-- site:tokens preview=color -->

Draw it on the same element as the shadow, inside the radius of the surface. It is decorative: the shadow and the surface identify the element, so it has no contrast minimum.

## Layers

`layer.{base, raised, dropdown, sticky, overlay, modal, toast, tooltip}` are z-index values in increasing order with room between them. Use the role of the element's kind; never invent a z-index between two roles.

<!-- site:tokens prefix=layer -->

## Opacity

| Role               | Use for                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| `opacity.disabled` | Dimming a disabled element as a whole when no disabled color role applies.                       |
| `opacity.scrim`    | Strength of a veil built from a color (prefer `color.surface.scrim`, which already includes it). |
| `opacity.muted`    | Attenuating companion content next to a label (a shortcut hint).                                 |
| `opacity.tint`     | A faint surface in the inherited text color behind small companion content (a counter's box).    |

<!-- site:tokens preview=opacity -->

## Rules

- Do not stack shadows or invent new ones; one role per element.
- Text dimmed with `opacity.muted` or `opacity.disabled` loses contrast: do not use it for information the user needs.
