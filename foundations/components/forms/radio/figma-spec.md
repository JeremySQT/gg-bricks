# Radio — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/radio** (`288:6`): this specification and its instances. Master: library page **Forms** (`343:1640`), section **Radio** ([`343:1644`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-1644)), since 2026-10-29; the specification links to the section under its title.
- Master: component set **Radio** ([`290:257`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=290-257)), 30 variants, built by `authoring/adapters/figma/radio-master.plugin.js`.
- Specification frame: **Radio — Specification** ([`309:404`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=309-404)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/radio/contract.json` (sha256 `2f7f7aac…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/radio`).
- Node and variable IDs: `reports/components/radio/figma/ledger.json`. Parity: `reports/components/radio/figma/parity.json` (4440 records, 0 failures). Screenshots: `reports/components/radio/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                                            | Figma                                                                                                                         |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `size` (from the group), selection (group value = value), condition | Variant properties Size, Selection (off, on), State (default, hover, readonly, disabled, invalid); default md · off · default |
| `label`, `description`                                              | Text properties **Label**, **Description**; boolean **Show description**                                                      |
| focus                                                               | Boolean **Focus**                                                                                                             |
| parts `control`, `mark`, `label`, `description`                     | Layers Control, Mark (ellipse), Label, Description                                                                            |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- Same construction as Checkbox: a **First line** frame (`typography/body/{size}/lineHeight`) centers the **Control**, a circle of `size/choice/{size}` with `radius/full`, fill and inside stroke from `color/choice/{off|on}/{state}/…`.
- **Mark**: an ellipse of `radio/dot` (3/8 of the circle: 5.25, 6, 7.5 px), centered, in `color/choice/on/{state}/content`; on variants only. Each variant sets its **Components** mode (sm, md, lg) so that `radio/dot` follows Size.
- Size is a variant here so that a RadioGroup can hold radios of its size; in code it comes from the group.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Group-owned props.** Size, readonly and invalid come from the RadioGroup in code; in Figma each radio carries them as variants and the designer sets them on every radio of a group.
2. **Transparent outline.** Outside focus the code has no outline (`none`); Figma hides the ring (`outline` compares as empty).
3. **First line** at lg: ±0.11 px, as for Checkbox.

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) redrawn in the blueprint ink: surfaces in a light tint with tint borders, text and glyphs in ink (secondary texts at 60 %), layout boxes dashed. Numbered callouts sit straight above, below or beside their part with straight leaders, and lettered dimension lines give the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- **Components** collection (hidden): `radio/dot` = 5.25 · 6 · 7.5 in modes sm · md · lg (3/8 of `size/choice/{size}`, which Figma cannot compute).
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/radio/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs radio <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.

The browser spec now drops the focus left by the previous context's focus check before measuring hover (2026-10-27): the first parity run showed the hover records of the representative contexts carrying a focus ring, a measurement artifact of the code side; `computed.json` was regenerated and all 18 hashes are equal.
