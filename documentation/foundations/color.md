# Color

## Overview

Color is organized in three layers. Primitive ramps are generated in OKLCH with one lightness per step shared by every hue, so that a step index has comparable contrast whatever the hue. Six palette ramps (neutral, accent, info, success, warning, danger) alias primitive ramps; a brand changes its accent by re-pointing eleven aliases. Roles reference palette steps with one value per appearance. Use roles.

<!-- site:ramps color.palette.neutral color.palette.accent color.palette.info color.palette.success color.palette.warning color.palette.danger -->

## Surfaces

| Role                    | Use for                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `color.surface.canvas`  | The page background, the backmost layer.                                                                                                |
| `color.surface.default` | Regions and cards placed on the canvas. Same as the canvas in light, one step lighter in dark: separate them with a border or a shadow. |
| `color.surface.subtle`  | Secondary regions set slightly apart: sidebars, table headers, code blocks, read-only areas.                                            |
| `color.surface.muted`   | De-emphasized backdrops: tracks, empty placeholders, skeletons. Only primary and secondary content are guaranteed on it.                |
| `color.surface.raised`  | Elements lifted above the default surface with `shadow.raised`: cards that must stand out, sticky bars.                                 |
| `color.surface.overlay` | Floating layers above the page: menus, popovers, dialogs, with `shadow.overlay` or `shadow.modal`.                                      |
| `color.surface.inverse` | Small elements in the opposite appearance: tooltips, snackbars. Text on it uses `color.content.inverse`.                                |
| `color.surface.scrim`   | The translucent veil behind a modal dialog. Never a background for content.                                                             |

<!-- site:tokens preview=color -->

## Content

| Role                      | Use for                                                                                      | Guaranteed on (4.5:1)                           |
| ------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `color.content.primary`   | Body text, headings, values: everything the user must read.                                  | canvas, default, subtle, muted, raised, overlay |
| `color.content.secondary` | Supporting text: descriptions, metadata, secondary labels.                                   | canvas, default, subtle, muted, raised, overlay |
| `color.content.tertiary`  | The least emphasis that must still be read: timestamps, hints, counts in passing.            | canvas, default, subtle, raised, overlay        |
| `color.content.disabled`  | Text of disabled elements. No contrast minimum: never use it for information the user needs. | —                                               |
| `color.content.link`      | Links inside text.                                                                           | canvas, default, subtle                         |
| `color.content.inverse`   | Text on `color.surface.inverse`.                                                             | inverse                                         |
| `color.content.onAccent`  | Text and icons on the solid accent action surfaces (default, hover, pressed).                | accent solid surfaces                           |

<!-- site:tokens preview=color -->

## Borders and focus

| Role                    | Use for                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `color.border.subtle`   | Separators inside a surface: list dividers, rules between groups. Decorative.                    |
| `color.border.default`  | Outlines of cards, regions and tables. Decorative: the content identifies the region.            |
| `color.border.strong`   | Boundaries the user must see to identify a control (3:1 on default and subtle surfaces).         |
| `color.border.disabled` | Boundaries of disabled controls.                                                                 |
| `color.border.focus`    | The border of a focused field (3:1 on the default surface).                                      |
| `color.focus.ring`      | Focus outlines around any focusable element (3:1 on canvas, default, subtle and muted surfaces). |

<!-- site:tokens preview=color -->

Draw focus as an outline of `focus.width` in `color.focus.ring`, `focus.offset` outside the element, with `radius.focus` around a control (see [Shape](shape.md)).

## Selection

| Role                      | Use for                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `color.selection.surface` | Background of selected text and selected items (rows, options). |
| `color.selection.content` | Text on the selection surface (4.5:1).                          |

<!-- site:tokens preview=color -->

## Items

Item roles are named `color.item.{state}.{surface|content|border}` with states `default`, `hover`, `selected`, `selected-hover`, `disabled`, plus `color.item.indicator`. They paint the entries of a list the user browses and picks from: menu items, listbox and select options, tabs, pages of a pagination, toggles of a toolbar. Items sit on the surface that holds the list (`color.surface.default` for tabs, `color.surface.overlay` for menus), so the default item is transparent and its content is the primary content color. `hover` is the highlighted item (pointer or keyboard focus inside the list), `selected` the chosen item, active tab or current page, with a subtle tint and readable content (4.5:1), `selected-hover` both at once. `indicator` is the mark of the choice (the bar under the active tab, the check of a selected option), 3:1 on the list surfaces and on the selected surface. Disabled items keep their place in the list and carry no needed information.

<!-- site:tokens prefix=color.item preview=color -->

## Actions

Action roles are named `color.action.{intent}.{appearance}.{state}.{surface|content|border}`: intents `accent`, `neutral`, `danger`; appearances `solid`, `outline`, `ghost`; states `default`, `hover`, `pressed`, `loading`, `disabled`. They paint the Button. Use the Button rather than these roles; reach for them only for a custom control that must read as a button of the same intent.

<!-- site:actions -->

- The content of each state is guaranteed 4.5:1 on the surface of the same state (default, hover, pressed).
- Outline borders are guaranteed 3:1 on `color.surface.default`.
- Disabled roles have no contrast minimum: inactive components are exempt (WCAG 1.4.3).

<!-- site:tokens prefix=color.action preview=color collapsed="All action roles" -->

## Fields

Field roles are named `color.field.{state}.{surface|content|border|placeholder}` with states `default`, `hover`, `focus`, `readonly`, `disabled`, `invalid`. They paint text inputs and their relatives. Content and placeholder are guaranteed 4.5:1 on the surface of the same state, borders 3:1 on `color.surface.default` (readonly keeps the default border on a tinted surface, so that a readonly field stays identifiable). Invalid fields also need a text message: the border color alone does not convey the error.

<!-- site:tokens prefix=color.field preview=color -->

## Choices

Choice roles are named `color.choice.{off|on}.{state}.{surface|content|border}` with states `default`, `hover`, `readonly`, `disabled`, `invalid`. They paint the box of a checkbox or a radio and the track of a switch; `content` is the mark (check, dot) or the switch thumb. `off` repeats the field roles of the same state (the thumb of an off switch uses the field placeholder color); `on` fills the box in the accent color, or in the invalid color, with a contrasting mark. The mark and the thumb are guaranteed 3:1 on their surface, and the `on` fill 3:1 on `color.surface.default`. Readonly and disabled choices are not filled: the mark alone shows the choice.

<!-- site:tokens prefix=color.choice preview=color collapsed="All choice roles" -->

## Statuses

Status roles are named `color.status.{info|success|warning|danger}.{role}`.

| Role suffix     | Use for                                                               | Guaranteed                                   |
| --------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| `surface`       | Tinted background of a message, banner or highlighted row.            | —                                            |
| `content`       | Text on the tinted surface.                                           | 4.5:1 on `surface`                           |
| `surfaceStrong` | Solid background for a strong signal (a badge, a critical banner).    | —                                            |
| `contentStrong` | Text on the solid surface.                                            | 4.5:1 on `surfaceStrong`                     |
| `icon`          | The status icon.                                                      | 3:1 on `surface` and `color.surface.default` |
| `border`        | Edge of a tinted surface. Decorative: the tint identifies the status. | —                                            |

Never convey a status by color alone: pair it with a word or an icon with a text alternative (WCAG 1.4.1).

<!-- site:tokens prefix=color.status preview=color -->

## Rules

- Pair content roles with the surfaces listed above; other pairs are not tested.
- Use the palette only for content no role describes, such as chart series, and check its contrast yourself. Never use primitives: a brand does not re-point them, so `primitive.color.blue.600` stays blue in every brand.
- Do not tint text with an intent color to convey meaning; use status roles with a word or an icon.
- In forced-colors mode the browser replaces colors; keep boundaries as borders or outlines, not background differences alone.

<!-- site:contrast -->

<!-- site:primitive-ramps -->
