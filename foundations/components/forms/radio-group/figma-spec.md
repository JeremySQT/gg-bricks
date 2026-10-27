# RadioGroup — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), page **forms/radio-group** (`288:7`); it holds the master and this specification.
- Master: component set **RadioGroup** ([`292:327`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=292-327)), 6 variants, built by `authoring/adapters/figma/radio-group-master.plugin.js`.
- Specification frame: **RadioGroup — Specification** ([`305:780`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=305-780)) with Overview, Anatomy, Variants, States, Behavior & sizing and Usage examples, in plain sentences for designers; built by `authoring/adapters/figma/forms-spec.plugin.js`. Its instances are explanatory, never masters.
- Reproduces: contract `foundations/components/forms/radio-group/contract.json` (sha256 `3bff76a8…`, approved 2026-10-26) and the implementation approved on 2026-10-27 (`packages/svelte/src/components/radio-group`).
- Node and variable IDs: `reports/components/radio-group/figma/ledger.json`. Parity: `reports/components/radio-group/figma/parity.json` (36 records, 0 failures). Screenshots: `reports/components/radio-group/figma/master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                          | Figma                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| `orientation`, `size`             | Variant properties Orientation (vertical, horizontal), Size (md, sm, lg); default vertical · md |
| `label` (when no Field)           | Text property **Label** on a hidden text layer (accessible name, not shown)                     |
| `value`                           | The selected radio: Selection on on one Radio instance                                          |
| `readonly`, `invalid`, `disabled` | The State of every Radio instance (set by the designer; the code passes them)                   |
| `radios` (slot)                   | Three Radio instances (`290:257`); duplicate or delete them                                     |

Every color, dimension, radius, stroke and typography value of the masters is bound to a variable of the Brand, Appearance and Density collections or to an adapter variable of the hidden **Components** collection; brand, appearance and density are chosen by the consuming frame's variable modes.

## Construction notes

- Vertical: auto layout, gap `space/content/sm`. Horizontal: wrapping auto layout, gap `space/content/lg` between radios and `space/content/sm` between lines, as the code's flex wrap.
- The radios are instances of Radio in the group's size, the second one selected, State default.

## Justified differences

Recorded as such in `parity.json`; none hides a defect of the master.

1. **Keyboard and selection rules** (single focus stop, arrows, no return to none) are behaviors of the code; Figma shows the resulting state only.
2. **Group state** is not a variant: the designer sets readonly, invalid or disabled on each radio (the page shows how).

## Page style and diagrams

Same layout as the wave 1 pages (white header on a gray page, hero card, blueprint anatomy board, white cards in the body), built by the shared body `authoring/adapters/figma/forms-spec.plugin.js` (one block per component). The Anatomy board shows a real instance enlarged with `rescale` (a drawing, not a master) in the dark appearance, so its text reads on the blueprint; numbered callouts name the parts and lettered dimension lines the measures, with `_Spec/Callout` (`115:6`), `_Spec/Marker` (`115:8`) and the Figma-only **Wireframe** collection.

## Adapter mechanics

- None.
- `figma.skipInvisibleInstanceChildren = false` is required when scripts read hidden layers (Description, Focus ring, slots).
- Adapter variables are Figma mechanics only: never source tokens, contract fields or code requirements.

## Parity method

`forms-parity.plugin.js` (ID set to the component) instantiates, in a temporary frame with explicit Brand, Appearance and Density modes, the cases of `reports/components/radio-group/svelte/computed.json` in each of the 18 contexts (hover and focus only in the four representative contexts, as the browser spec), reads the resolved bound variables as exact field strings hashed per context (FNV-1a) and the geometry as numbers. `forms-parity-report.mjs radio-group <result>` builds the same strings from `computed.json`, compares the hashes and the numbers with their tolerances and writes `parity.json`, one record per computed record.
