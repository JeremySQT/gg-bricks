# CheckboxGroup — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/checkbox-group** (`347:243`): this specification and its instances. Master: library page **Forms** (`343:1640`), section **CheckboxGroup** ([`347:244`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=347-244)); the specification links to the section under its title.
- Master: component set **CheckboxGroup** ([`347:303`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=347-303)), 2 variants and an **Options** slot, built by `authoring/adapters/figma/checkbox-group-master.plugin.js` on the RadioGroup model approved on 2026-10-29.
- Specification frame: **CheckboxGroup — Specification** ([`348:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=348-2)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/checkbox-group/contract.json` (sha256 `335fb582…`, approved 2026-10-28) and the implementation approved on 2026-10-28 (`packages/svelte/src/components/checkbox-group`).
- Node and variable IDs: `reports/components/checkbox-group/figma/ledger.json`. Parity: `reports/components/checkbox-group/figma/parity.json` (3144 records, 0 failures). Screenshots: `reports/components/checkbox-group/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                          | Figma                                                                                                                                                                                                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`                     | Variant property Orientation (vertical, horizontal); default vertical                                                                                                                                                                                                                   |
| `size`                            | The Size of each Checkbox in the slot (the designer sets the same size on all of them; a slot cannot pass the group's size to its content)                                                                                                                                              |
| `label` (when no Field)           | Text property **Label** on a hidden text layer (accessible name, not shown)                                                                                                                                                                                                             |
| `value`                           | The checked checkboxes: Selection on on any number of Checkbox instances                                                                                                                                                                                                                |
| `readonly`, `invalid`, `disabled` | The State of every Checkbox instance (set by the designer; the code passes them)                                                                                                                                                                                                        |
| `required`                        | Stated in words by the enclosing Field (Required and its label or description); no Figma property, as in the code no checkbox is marked required                                                                                                                                        |
| `items` (checkbox, min 2)         | SLOT property **Options** on the layer Options (one slot shared by both variants): Checkbox instances (`289:428`) added, removed and reordered by the designer; at least two, Checkbox the preferred and only allowed content; default content three Checkbox md, the first one checked |

Every color, dimension and typography value comes from the Checkbox master and the slot's gap bindings (Brand, Appearance and Density collections); brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- The variant is a vertical auto layout holding the slot **Options** and the hidden Label layer. The slot carries the layout: vertical, gap `space/content/sm`; horizontal, wrapping, gap `space/content/lg` between checkboxes and `space/content/sm` between lines, as the code's flex wrap. The horizontal variant has a fixed width (one line for the default content) and the slot fills it: resize an instance to change where it wraps.
- Slot settings: `minChildren` 2, preferred value the Checkbox set, `allowPreferredValuesOnly` (Figma flags other content). The content of an instance's slot is kept when its Orientation changes.
- A select-all checkbox stays outside the group (the specification shows it above an indented group), as the contract says.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Off mark**: an unchecked box draws no mark, so the master has no Mark layer; the code keeps the color for the transition only (224 records, as for Checkbox).
2. **Keyboard, value order and validation** are behaviors of the code; Figma shows the resulting state only.
3. **Group size and state** are not on the group: the designer sets the same Size and State on each checkbox (the page shows how). Parity measures a checkbox of the slot per size, condition and selection.

## Page style and diagrams

Same layout as the other form pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js`. The Anatomy board shows a real instance enlarged with `rescale`, redrawn in the blueprint ink, with straight leaders, `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- None.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).

## Parity method

`forms-parity.plugin.js` (ID `checkbox-group`) instantiates the vertical variant in each of the 18 contexts, swaps the first checkbox of its slot to the Checkbox variant of each case of `reports/components/checkbox-group/svelte/computed.json` (size × condition × selection, hover and focus in the four representative contexts) and reads its resolved bound variables, then reads the slot gaps of both variants. `forms-parity-report.mjs checkbox-group <result>` compares the FNV-1a hashes per context and the box size with its tolerance and writes `parity.json`.
