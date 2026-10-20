# Badge — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), page **content/badge** (`220:2`), first of the content pages; it holds the master and this specification.
- Master: component set **Badge** ([`220:293`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=220-293)), 36 variants, built by `authoring/adapters/figma/badge-master.plugin.js`.
- Specification frame: **Badge — Specification** ([`223:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=223-2)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/badge-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/content/badge/contract.json` (sha256 `87242b5e…`, approved 2026-10-17) and the implementation approved on 2026-10-19 (`packages/svelte/src/components/badge`).
- Node and variable IDs: `reports/components/badge/figma/ledger.json`. Parity: `reports/components/badge/figma/parity.json` (12 312 records, 0 failures). Screenshots: `reports/components/badge/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                       | Figma                                                                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intent`, `appearance`, `size` | Variant properties Intent, Appearance, Size (default neutral · subtle · md, the top-left variant)                                                                    |
| `label`                        | Text property **Label** (layer Label)                                                                                                                                |
| part `leading` (one icon)      | Boolean **Show leading** (layer Leading); exposed instance **Leading icon** (Icon xs) whose **Glyph** takes any glyph of `assets/phosphor`; each intent proposes one |
| part `container`               | The variant itself (auto layout)                                                                                                                                     |
| states                         | None: the badge is not interactive                                                                                                                                   |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to the adapter variable `badge/icon-box`; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- **Container** (the variant): horizontal auto layout, hug width, height and minimum width bound to `typography/indicator/{size}/lineHeight` (the line box, 15.4 / 16.8 / 19.6 px: Figma rounds an auto text height to whole pixels, so the box cannot hug the text), content centered, side padding bound to `space/content/xs`, corners to `radius/indicator`. As in the Counter, the box family the badge shares.
- **Appearance**: subtle fills `color/status/{intent}/surface` and draws an inside stroke in `color/status/{intent}/border` at `border/width/default`, kept out of the layout (`strokesIncludedInLayout` false) because the code draws it as an inset shadow that takes no room; strong fills `surfaceStrong` with no stroke. Label and icon use `content` and `icon` (subtle) or `contentStrong` (strong).
- **Label**: text layer bound to the five `typography/indicator/{size}/*` variables, leading trim set to cap height (the code's `text-box: trim-both cap alphabetic`), so the capitals sit centered in the line box and descenders overflow unclipped. One line, truncation at the end: a fixed instance width shortens the label with an ellipsis.
- **Leading**: a frame with right padding `space/content/xs` (the leading gap) holding a **Drawing box** whose width is `badge/icon-box` (iconSize − 2 × iconSize/8 = 9) and height `size/icon/xs`, with the 12 px Icon centered: the icon box overlaps the padding and the gap by iconSize/8 on each side, as the code's negative margins do (and as in Button), so the drawing starts at the padding and ends at the leading gap. Until 2026-10-20 only the start side was compensated, which left the drawing 1.5 px further from the label (user remark at the Figma parity review).
- **Default glyph per intent** (as on the code's review page): neutral pencil-simple, accent star, info info, success check, warning and danger warning-circle.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Strong edge.** The code keeps a transparent inset shadow on strong badges (forced-colors mode draws an edge from the transparent outline); Figma has no forced-colors mode, so strong badges have no stroke (324 `boxShadow` records noted as justified).
2. **Not focusable.** `tabIndex` has no Figma equivalent; the master has no interaction (648 records noted as justified).
3. **Line box.** Figma resolves the line height to font size × 1.4 (16.8) where the browser rounds to 1/64 px (16.796875): height and minimum width compared at ±0.01 px.
4. **Width.** Text layout differs slightly between Figma and the browser (largest difference 1.08 px); width compared at ±1.5 px, as for Button.
5. **Truncation** is a fixed instance width in Figma; the code truncates whenever the container is narrower than the badge, keeping the full text available to assistive technology.
6. **Re-selecting the default glyph** of the Icon resets the nested color override (see the IconButton and Button specifications); the scripts set each intent's glyph explicitly.

## Page style and diagrams

Same layout as the Button, Icon and IconButton pages. The Anatomy board shows an md badge “Paid” with its icon zoomed six times: the container, the icon box overlapping the padding and the gap by 1/8 (dashed), the label on its cap height, with callouts 1 Container, 2 Leading icon, 3 Label and the dimensions A (height), B (padding) and C (gap). Colors come from the Figma-only **Wireframe** collection and the documentation components `_Spec/Board`, `_Spec/Callout`, `_Spec/Marker` on the Utilities page.

## Adapter mechanics

- **Components** collection (hidden): `badge/icon-box` = 9 in its three modes (size-independent, like `counter/foreground`). Not a source token, contract field or code requirement.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read the hidden Leading layer of instances.

## Parity method

For each of the 18 contexts a temporary frame with explicit modes holds the 36 cases of `reports/components/badge/svelte/computed.json` (every intent, appearance and size, Show leading on, the label of the review page: Draft, New, In review, Paid, Due soon, Overdue). `badge-parity.plugin.js` reads the label color, surface, stroke and weight, radius, paddings, font size and weight, icon color, size and offset from the container edge, the leading gap and the distance from the icon box to the label as an exact field string, hashed per context, and the height, minimum width and width as numbers. `badge-parity-report.mjs` builds the same strings from `computed.json`: the 18 hashes are equal, and the numeric fields are within their tolerances. A first run found the subtle stroke included in the layout (corrected before recording). Re-measured on 2026-10-20 after the icon gap amendment, with the icon-to-label distance added: the 18 hashes are equal.
