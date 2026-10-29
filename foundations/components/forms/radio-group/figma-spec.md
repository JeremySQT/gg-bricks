# RadioGroup — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/radio-group** (`288:7`): this specification and its instances. Master: library page **Forms** (`343:1640`), section **RadioGroup** ([`343:1645`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=343-1645)), since 2026-10-29; the specification links to the section under its title.
- Master: component set **RadioGroup** ([`292:327`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=292-327)), 2 variants and an **Options** slot, built by `authoring/adapters/figma/radio-group-master.plugin.js` then `radio-group-slot.plugin.js`.
- Specification frame: **RadioGroup — Specification** ([`338:844`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=338-844)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/radio-group/contract.json` (sha256 `3bff76a8…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/radio-group`).
- Node and variable IDs: `reports/components/radio-group/figma/ledger.json`. Parity: `reports/components/radio-group/figma/parity.json` (36 records, 0 failures). Screenshots: `reports/components/radio-group/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                          | Figma                                                                                                                                                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`                     | Variant property Orientation (vertical, horizontal); default vertical                                                                                                                                                                                                        |
| `size`                            | The Size of each Radio in the slot (the designer sets the same size on all of them; a slot cannot pass the group's size to its content)                                                                                                                                      |
| `label` (when no Field)           | Text property **Label** on a hidden text layer (accessible name, not shown)                                                                                                                                                                                                  |
| `value`                           | The selected radio: Selection on on one Radio instance                                                                                                                                                                                                                       |
| `readonly`, `invalid`, `disabled` | The State of every Radio instance (set by the designer; the code passes them)                                                                                                                                                                                                |
| `radios` (slot)                   | SLOT property **Options** on the layer Options (one slot shared by both variants): Radio instances (`290:257`) added, removed and reordered by the designer; at least two, Radio the preferred and only allowed content; default content three Radio md, the second selected |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- The variant is a vertical auto layout holding the slot **Options** and the hidden Label layer. The slot carries the layout: vertical, gap `space/content/sm`; horizontal, wrapping, gap `space/content/lg` between radios and `space/content/sm` between lines, as the code's flex wrap. The horizontal variant has a fixed width (349 px, one line for the default content) and the slot fills it: resize an instance to change where it wraps.
- Slot settings: `minChildren` 2, preferred value the Radio set, `allowPreferredValuesOnly` (Figma flags other content). The content of an instance's slot is kept when its Orientation changes (checked on 2026-10-28).
- Superseded on 2026-10-28: the eight exposed options with Show option booleans (`radio-group-options.plugin.js`), not approved by the user (too many options).

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Keyboard and selection rules** (single focus stop, arrows, no return to none) are behaviors of the code; Figma shows the resulting state only.
2. **Group state** is not a variant: the designer sets readonly, invalid or disabled on each radio (the page shows how).
3. **Group size** is not on the group: a slot cannot pass it to its content, so the designer sets the same Size on each radio. Parity is unaffected (the group's computed values are its gaps).

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) redrawn in the blueprint ink: surfaces in a light tint with tint borders, text and glyphs in ink (secondary texts at 60 %), layout boxes dashed. Numbered callouts sit straight above, below or beside their part with straight leaders, and lettered dimension lines give the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- None.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/radio-group/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs radio-group <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.
