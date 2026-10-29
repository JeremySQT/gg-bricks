# Textarea — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/textarea** (`288:9`): this specification and its instances. Master: library page **Forms** (`343:1640`), section **Textarea** ([`343:1647`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-1647)), since 2026-10-29; the specification links to the section under its title.
- Master: component set **Textarea** ([`294:291`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=294-291)), 36 variants, built by `authoring/adapters/figma/textarea-master.plugin.js`.
- Specification frame: **Textarea — Specification** ([`307:320`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=307-320)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/textarea/contract.json` (sha256 `80fd0379…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/textarea`).
- Node and variable IDs: `reports/components/textarea/figma/ledger.json`. Parity: `reports/components/textarea/figma/parity.json` (1656 records, 0 failures, 192 justified). Screenshots: `reports/components/textarea/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                    | Figma                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `size`, condition, focus    | Variant properties Size, State (default, hover, readonly, disabled, invalid); boolean **Focus** (ring; Focus border on default and hover) |
| `value`, `placeholder`      | Variant Content; text properties **Value**, **Placeholder**                                                                               |
| `label` (when no Field)     | Text property **Label** on a hidden layer                                                                                                 |
| `rows`, `maxRows`, `resize` | Not variants: the master shows the default 3 rows (see the justified differences)                                                         |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- **Container** as InputText: padding `space/control/padding-inline/{size}`, field colors, `radius/control`.
- **Block padding** (size/control − one line) / 2, which Figma cannot compute: the **Area** stacks a **First row** of `size/control/{size}` and **More rows** of `textarea/more-rows` (two lines); the **Text box** (`textarea/text-rows`, three lines) is centered on that stack, so its top sits at exactly the code's padding in every density.
- The text is top aligned, fills the width and wraps; the Text box clips beyond 3 lines.

- **Focus** is a property only (2026-10-28): the ring follows Focus and, on default and hover, a **Focus border** layer (inside stroke `color/field/focus/border`) follows it too; a disabled field is never focused.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Rows and resizing** (`rows`, `maxRows`, `resize`): behaviors of the code. A taller instance gives more room; the text shows up to 3 lines (138 `resize` records noted as justified).
2. **Height** is compared for the code's rows (2 and 1 on the review page): observed = master height − (3 − rows) × line height.
3. **Placeholder of the paired textareas.** The review page pairs 1-row textareas with a value and no placeholder; the browser reports the text color for `::placeholder` there. Those 54 records are justified; the placeholder color is checked on the condition cases.

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) redrawn in the blueprint ink: surfaces in a light tint with tint borders, text and glyphs in ink (secondary texts at 60 %), layout boxes dashed. Numbered callouts sit straight above, below or beside their part with straight leaders, and lettered dimension lines give the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- **Components** collection (hidden): `textarea/more-rows` = 42 · 48 · 57.6 and `textarea/text-rows` = 63 · 72 · 86.4 (sm · md · lg): two and three lines of `typography/body/{size}`.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/textarea/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs textarea <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.
