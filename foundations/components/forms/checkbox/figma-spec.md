# Checkbox — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/checkbox** (`288:3`): this specification and its instances. Master and its internal parts: library page **Forms** (`343:1640`), section **Checkbox** ([`343:1641`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-1641)), since 2026-10-29; the specification links to the section under its title.
- Master: component set **Checkbox** ([`289:428`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=289-428)), 45 variants, built by `authoring/adapters/figma/checkbox-master.plugin.js`.
- Specification frame: **Checkbox — Specification** ([`307:2597`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=307-2597)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/checkbox/contract.json` (sha256 `08dad298…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/checkbox`).
- Node and variable IDs: `reports/components/checkbox/figma/ledger.json`. Parity: `reports/components/checkbox/figma/parity.json` (7968 records, 0 failures, 224 justified). Screenshots: `reports/components/checkbox/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                                   | Figma                                                                                                                                                     |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`, `checked` + `indeterminate` (selection), condition | Variant properties Size (md, sm, lg), Selection (off, on, indeterminate), State (default, hover, readonly, disabled, invalid); default md · off · default |
| `label`, `description`                                     | Text properties **Label**, **Description**; boolean **Show description**                                                                                  |
| `hideLabel`                                                | Boolean **Show label** (off hides the Text layer; the label stays the accessible name in code)                                                            |
| focus (independent axis)                                   | Boolean **Focus** (Focus ring layer)                                                                                                                      |
| parts `control`, `mark`, `label`, `description`            | Layers Control, Mark (internal parts `_Checkbox/Check`, `_Checkbox/Minus`), Label, Description                                                            |
| `disabled`, `readonly`, `invalid`, `required`              | State variants; required has no visual on the checkbox (the Field shows the asterisk)                                                                     |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- **Row**: horizontal auto layout, hug, gap `space/control/gap/{size}`, top aligned. A **First line** frame as tall as `typography/body/{size}/lineHeight` centers the Control, so that the box sits on the first line of the label in every density (the code's rule).
- **Control**: fixed `size/choice/{size}`, corners `radius/indicator`, fill and inside stroke from `color/choice/{off|on}/{state}/…` at `border/width/default`, stroke kept out of the layout (the code draws an inset shadow). Indeterminate uses the on colors.
- **Mark**: Phosphor 2.1.1 bold check and minus as internal components (256-unit grid, children scaled), stretched over the box and colored with `color/choice/on/{state}/content`, as the code draws the bold glyph at the box size. Off variants have no Mark layer.
- **Focus ring**: a frame 2 px outside the box with an outside stroke `color/focus/ring` at `focus/width`, corners bound to `checkbox/focus-radius` (radius/indicator + focus/offset: 6, 4, 6 px in base, brick, orchid), so the ring is concentric with the box as in the code (user remark, 2026-10-28).
- **Target**: an empty frame of `size/target/min` across the row, absolute and centered, as the 44 px interaction target of the code.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Off mark color.** The code keeps a color on the empty off box for the transition; an off box draws nothing, so the master has no Mark layer (224 `mark` records noted as justified).
2. **Transparent outline.** Outside focus the code keeps a transparent outline for forced-colors mode; Figma has no forced colors and the ring is hidden (`outline` compares as empty).
3. **First line.** At lg the 28.8 px line is rounded to 29 px by Figma's text box: the box center differs by 0.1 px from the line center (tolerance ±0.11 px).

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) redrawn in the blueprint ink: surfaces in a light tint with tint borders, text and glyphs in ink (secondary texts at 60 %), layout boxes dashed. Numbered callouts sit straight above, below or beside their part with straight leaders, and lettered dimension lines give the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- **Brand** collection: `checkbox/focus-radius` (hidden from publishing) = radius/indicator + focus/offset per brand, computed and bound by `checkbox-focus-radius.plugin.js`. It lives in the Brand collection because the indicator radius changes with the brand, which the Components collection (size modes) cannot follow. The prune script must keep it.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/checkbox/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs checkbox <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.

The browser spec now drops the focus left by the previous context's focus check before measuring hover (2026-10-27): the first parity run showed the hover records of the representative contexts carrying a focus ring, a measurement artifact of the code side; `computed.json` was regenerated and all 18 hashes are equal.
