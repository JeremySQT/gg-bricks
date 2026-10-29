# Switch — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/switch** (`288:8`): this specification and its instances. Master: library page **Forms** (`343:1640`), section **Switch** ([`343:1646`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-1646)), since 2026-10-29; the specification links to the section under its title.
- Master: component set **Switch** ([`291:434`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=291-434)), 48 variants, built by `authoring/adapters/figma/switch-master.plugin.js`.
- Specification frame: **Switch — Specification** ([`306:454`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=306-454)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/switch/contract.json` (sha256 `c43a5de4…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/switch`).
- Node and variable IDs: `reports/components/switch/figma/ledger.json`. Parity: `reports/components/switch/figma/parity.json` (4368 records, 0 failures). Screenshots: `reports/components/switch/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                       | Figma                                                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `labelPosition`, `size`, `checked`, condition  | Variant properties Label position (end, start), Size, Selection (off, on), State (default, hover, readonly, disabled); default end · md · off · default |
| `label`, `description`, `hideLabel`            | Text properties **Label**, **Description**; booleans **Show description**, **Show label**                                                               |
| focus                                          | Boolean **Focus**                                                                                                                                       |
| parts `track`, `thumb`, `label`, `description` | Layers Track, Thumb (ellipse), Label, Description                                                                                                       |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- **Track**: horizontal auto layout, width `switch/track-width` (2 × trackSize − 4 × borderWidth: 28, 36, 44), height `size/switch/{size}`, padding `switch/inset` (2 × borderWidth), `radius/full`, fill and inside stroke from `color/choice/{off|on}/{state}/…`. The thumb sits at the start (MIN) when off and at the end (MAX) when on.
- **Thumb**: an ellipse of `switch/thumb` (trackSize − 4 × borderWidth) in `color/choice/{off|on}/{state}/content`.
- **First line** frame (`typography/body/{size}/lineHeight`) centers the track on the first line of the label; **Label position start** puts the text first and spreads the row (SPACE_BETWEEN) on a fixed width, as the code fills its container.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Right to left** (thumb mirrored) is a behavior of the code.
2. **Text width.** `rootWidth` and `trackEndGap` depend on the label “Setting”: Figma sets the text in whole pixels and shapes Inter slightly wider (largest difference 1.80 px); compared at ±2 px.
3. **Transparent outline** outside focus (forced colors) and **first line** at lg (±0.11 px), as for Checkbox.

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) redrawn in the blueprint ink: surfaces in a light tint with tint borders, text and glyphs in ink (secondary texts at 60 %), layout boxes dashed. Numbered callouts sit straight above, below or beside their part with straight leaders, and lettered dimension lines give the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- **Components** collection (hidden): `switch/track-width` = 28 · 36 · 44, `switch/thumb` = 12 · 16 · 20, `switch/inset` = 2 (sm · md · lg). Derived from `size/switch/{size}` and `border/width/default`, which Figma cannot compute.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/switch/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs switch <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.

The browser spec now drops the focus left by the previous context's focus check before measuring hover (2026-10-27): the first parity run showed the hover records of the representative contexts carrying a focus ring, a measurement artifact of the code side; `computed.json` was regenerated and all 18 hashes are equal.
