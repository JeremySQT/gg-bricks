# Field — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), page **forms/field** (`288:4`); it holds the master and this specification.
- Master: component set **Field** ([`295:77`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=295-77)), 3 variants, built by `authoring/adapters/figma/field-master.plugin.js`.
- Specification frame: **Field — Specification** ([`307:897`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=307-897)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/field/contract.json` (sha256 `61eb96cd…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/field`).
- Node and variable IDs: `reports/components/field/figma/ledger.json`. Parity: `reports/components/field/figma/parity.json` (504 records, 0 failures). Screenshots: `reports/components/field/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                          | Figma                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `invalid`, `disabled`             | Variant State (default, invalid, disabled)                                                                              |
| `label`, `description`, `message` | Text properties **Label**, **Description**, **Message**; boolean **Show description**                                   |
| `required`                        | Boolean **Required** (asterisk)                                                                                         |
| slot `control`                    | Exposed InputText instance **Control** (`293:1046`): swap it for a Textarea, Checkbox or RadioGroup in the layers panel |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- Vertical stack, gap `space/content/sm` between the **Header** (Label row and Description, gap `space/content/xs`) and the **Body** (Control and Message, gap `space/content/xs`).
- **Label** in `typography/label/md`, **Required indicator** “ *” in `color/content/secondary`; **Description** in `typography/body/sm`; disabled paints the three in `color/content/disabled`.
- **Message** (invalid only): a **First line** frame (`typography/body/sm/lineHeight`) centers a drawing box of `field/icon-box` (iconSize − iconSize/4) holding the warning-circle at `size/icon/sm` in `color/status/danger/icon`; the text in `color/status/danger/content` wraps.
- The Control is an exposed instance in the state of the field. An instance-swap property is not used: its single default would reset every variant's control to one state.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **State passing.** The code passes required, invalid and disabled to the control; in Figma the designer sets the control's State (the default InputText follows the field's State in each variant).
2. **Label wrapping.** The code wraps a long label; in Figma the label stays on one line (the asterisk follows it in a hug row).

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) redrawn in the blueprint ink: surfaces in a light tint with tint borders, text and glyphs in ink (secondary texts at 60 %), layout boxes dashed. Numbered callouts sit straight above, below or beside their part with straight leaders, and lettered dimension lines give the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- **Components** collection (hidden): `field/icon-box` = 12 (size/icon/sm − 2 × size/icon/sm ÷ 8).
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/field/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs field <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.
