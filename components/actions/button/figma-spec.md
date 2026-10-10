# Button — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), page **Actions** (`8:4`).
- Master: component set **Button** ([`48:1586`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=48-1586)), 135 variants.
- Specification frame: **Button — Specification** ([`78:1449`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=78-1449)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples. Its instances are explanatory, never masters.
- Reproduces: contract `components/actions/button/contract.json` (sha256 `0144dc9a…413e`) and the implementation approved on 2026-10-07 (`packages/svelte/src/button`).
- Node and variable IDs: `reports/components/button/figma/ledger.json`. Parity: `reports/components/button/figma/parity.json` (9324 records, 0 failures). Screenshots: `reports/components/button/figma/master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                             | Figma                                                                                                                                                                                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intent`, `appearance`, `size`       | Variant properties Intent, Appearance, Size (default accent · solid · md)                                                                                                                                                                             |
| `interaction` state                  | Variant property State: default, hover, pressed, loading, disabled                                                                                                                                                                                    |
| `focus` state                        | Boolean **Focus** (independent axis, combines with every state)                                                                                                                                                                                       |
| `label`                              | Text property **Label**                                                                                                                                                                                                                               |
| `leading` (icon)                     | Boolean **Show leading**; exposed instance **Leading icon** (icon set, property Name)                                                                                                                                                                 |
| `trailing` (icon, counter, shortcut) | Boolean **Show trailing**; exposed instance **Trailing item** (internal `_Button/Trailing`): **Type** Icon (nested exposed **Icon**, property Name) or Content (swap **Content**: Counter or Shortcut). One trailing item at most, as in the contract |
| `href`, `disabled`, `loading`        | Not properties: href has no visual effect; disabled and loading are State values                                                                                                                                                                      |
| parts                                | Layers Container, Leading, Label/Text, Trailing, Loading indicator, Focus ring                                                                                                                                                                        |

Every color, dimension, radius, padding, margin, stroke and typography value of the masters is bound to a variable of the Primitives, Brand, Appearance and Density collections; brand, appearance and density are chosen by the consuming frame's variable modes, never by component properties.

## Construction notes

- **Root** reserves the 44px interaction height (`size/target/min`) around the container; the container keeps the size height.
- **Container** padding is `space/control/edge-inline/{size}` and `space/control/padding-block/{size}`; **Label** carries `space/control/label-inline/{size}` on both sides; **Leading** and **Trailing** carry `space/control/slot-inline/{size}`.
- **Optical icon spacing**: icons sit in a _Drawing box_ sized to the icon's drawing (iconSize × 3/4), so the box overlaps the slot spacing by 1/8 of the icon size on each side, like the CSS negative margin. The compensation belongs to Button (Leading, and Type=Icon of `_Button/Trailing`); the icon component itself stays neutral.
- **Trailing**: one frame carrying the slot margin, holding an exposed instance of the internal `_Button/Trailing` set (Utilities page). Type=Icon shows the drawing box with the icon; Type=Content shows a Counter or Shortcut placed by its box. Both layers exist in both types (one hidden), so the master's per-state color overrides (icon glyph, content text and counter outline) survive switching Type, Name or Content. The Shortcut fixture carries a zero-width stroke so the counter outline color override never draws a border on it.
- **Cap-height centering**: the label text uses vertical trim (leading trim to cap height), the Figma equivalent of `text-box: trim-both cap alphabetic`.
- **Loading**: the Loading indicator is centered over the container (absolute); Leading, Label and Trailing are kept in the layout at opacity 0, so the width does not change.
- **Outline appearance**: the border is an inside stroke bound to the border role, so it never changes outer dimensions (`strokesIncludedInLayout` off on containers).
- **Focus ring**: absolute frame 2px outside the container (the focus offset), outside stroke bound to `focus/width` and `color/focus/ring`, corner radius bound to the control radius role.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the masters.

1. **Forced-colors outline.** The code keeps a transparent 1px outline so that forced-colors mode draws a boundary. Figma has no forced-colors mode: no layer stands for it (594 `outline` records noted as justified).
2. **Focus ring corner.** CSS rounds the outline by radius + offset; Figma variables cannot add, so the ring's corner equals the control radius (6 base, 2 brick, 12 orchid). The outer corner is about 2px tighter than in the browser in every brand. Color, width and offset match.
3. **Focus offset** is ring geometry (2px), not a variable binding, because Figma cannot bind an absolute position. `focus/offset` is 2 in every brand and density.
4. **Loading + focus.** The browser measurement keeps focus on a loading button (loading stays focusable), so its focus outline is computed; in Figma the State=loading variant combines with the separate Focus boolean (shown in States). 36 records noted as justified.
5. **Disabled + loading** is an instance override in the specification (State=disabled, Loading indicator visible, content at opacity 0), not a variant: it is a rare combination and would add 27 variants.
6. **Width.** Figma rounds the text layer to whole pixels and rasterizes Inter slightly differently: widths differ from the browser by 0.13 to 1.06px; parity tolerance ±1.5px. Heights, paddings and margins match exactly.
7. **Tight ellipsis.** The code ends the visible box at the ellipsis and keeps the full label as accessible name. Figma truncates the text layer (ellipsis at the end): for a constrained width, set the instance width to Fixed or Fill and set Container, Label and Text to Fill (example in Behavior & sizing).
8. **Horizontal 44px target.** The code also reserves 44px horizontally for very short labels; the Figma root reserves the height only.
9. **Spinner rotation, color transitions and reduced motion** are code-only.
10. **Fixtures.** The Phosphor library is not attached to the file: icons are local fixtures (variant set `_Fixture/Icon`, property Name, Phosphor 2.1.1 paths) with literal vector sizes, and Counter and Shortcut are local fixtures on the Utilities page, standing in for the future Icon, Counter and Shortcut components.

## Adapter mechanics

- Collection `_ggbrick button size` (modes sm, md, lg; each Button variant sets the mode of its Size) holds `button/icon-drawing` = 12, 15, 18, the optical drawing box (3/4 of `size/icon/{size}`, because Figma cannot compute a fraction of a variable), and `button/icon-size`, an alias of `size/icon/{size}`. The modes let the shared `_Button/Trailing` part follow the button size without a Size property. These are not source tokens, contract fields or code requirements.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden slot layers of instances.

## Parity method

For each of the 18 contexts (brand × appearance × density) a temporary frame with explicit modes holds instances of the 27 default cases (label Continue or Delete, leading icon on md) and, in base-light-standard, base-dark-standard, brick-light-compact and orchid-dark-comfortable, the 45 md state cases (label "Save changes"). Bound variables are resolved with `resolveForConsumer`, geometry is read from the laid-out instances, the frame is removed, and each value is compared with the matching record of `reports/components/button/svelte/computed.json`.
