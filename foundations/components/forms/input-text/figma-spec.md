# InputText — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/input-text** (`288:5`): this specification and its instances. Master: library page **Forms** (`343:1640`), section **InputText** ([`343:1643`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-1643)), since 2026-10-29; the specification links to the section from the top right of its title row (since 2026-10-30), and the section starts with a header that links back to the specification.
- Master: component set **InputText** ([`293:1046`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=293-1046)), 60 variants, built by `authoring/adapters/figma/input-text-master.plugin.js`.
- Specification frame: **InputText — Specification** ([`306:1344`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=306-1344)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/input-text/contract.json` (sha256 `c3e5118a…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/input-text`).
- Node and variable IDs: `reports/components/input-text/figma/ledger.json`. Parity: `reports/components/input-text/figma/parity.json` (1656 records, 0 failures). Screenshots: `reports/components/input-text/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                         | Figma                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`, condition, focus         | Variant properties Size (md, sm, lg), State (default, hover, readonly, disabled, invalid); boolean **Focus** shows the keyboard focus (ring; Focus border on default and hover) |
| `value`, `placeholder`           | Variant Content (placeholder, value); text properties **Value**, **Placeholder**                                                                                                |
| `label` (when no Field)          | Text property **Label** on a hidden layer                                                                                                                                       |
| slot `leading` (icon)            | Boolean **Show leading**, instance swap **Leading icon** (default magnifying-glass)                                                                                             |
| slot `trailing` (icon or action) | Boolean **Show trailing** + **Trailing icon** (default globe); variant **Action** icon-button (md and lg only) with an IconButton (`211:1167`) one size smaller                 |
| `type`                           | Not represented: a behavior of the code                                                                                                                                         |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- **Container** (the variant): height `size/control/{size}`, padding `space/control/edge-inline/{size}` (0 at the end with the action), fill and inside stroke from `color/field/{state}/…`, `radius/control`: the height and padding of a Button of the same size.
- **Slots** follow Button: a frame with `space/control/slot-inline/{size}` on both sides holds a drawing box of `input-text/icon-box` (iconSize − iconSize/4) with the Phosphor glyph at `size/icon/{size}` centered, so the drawing starts at the padding (the icon box overlaps it by iconSize/8). Icons use the placeholder color of the state.
- **Input** frame with `space/control/label-inline/{size}` on both sides holds the Value (content color) or the Placeholder, one line, truncated at the end.
- **Action**: a square of `size/control/{size}` holding an IconButton neutral ghost one size smaller with the x glyph, disabled with the field.
- **Focus** is a property only (2026-10-28): the ring (`radius/focus`, outside stroke) follows Focus, and on default and hover a **Focus border** layer (inside stroke `color/field/focus/border`) follows it too, as the code's precedence disabled, readonly, invalid, focus, hover paints the focus border only there; a disabled field is never focused.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Type** (email, password, search) and scrolling of a long value are behaviors of the code; Figma truncates with an ellipsis.
2. **Transparent outline** outside focus (forced colors): compared as empty.

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) redrawn in the blueprint ink: surfaces in a light tint with tint borders, text and glyphs in ink (secondary texts at 60 %), layout boxes dashed. Numbered callouts sit straight above, below or beside their part with straight leaders, and lettered dimension lines give the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- **Components** collection (hidden): `input-text/icon-box` = 12 · 15 · 18 (sm · md · lg), the icon box minus its two insets.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/input-text/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs input-text <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.
