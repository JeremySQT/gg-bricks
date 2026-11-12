# Accordion — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **navigation/accordion** (`495:17`). Masters: library page **Navigation** (`495:16`), section **Accordion** (`505:357`).
- Masters: **Accordion** ([`505:429`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=505-429)), a component with the slot Items; **Accordion/Item** (`505:428`, 6 variants: State × Expanded). Built by `authoring/adapters/figma/accordion-master.plugin.js`.
- Specification frame: **Accordion — Specification** ([`533:374`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=520-2)); built by `wave4-spec.plugin.js` on `spec-lib.plugin.js`, with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/navigation/accordion/contract.json` and the implementation approved on 2026-11-10 at the grouped wave 4 implementation gate (`packages/svelte/src/components/accordion`).
- Node IDs: `reports/components/accordion/figma/ledger.json`. Parity: `reports/components/accordion/figma/parity.json` (116 records, 116 passed, 0 failures). Screenshots: `master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                          | Figma                                                                                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`, `multiple`                               | not drawn: the designer expands items (Expanded true)                                                                                                                     |
| `headingLevel`                                    | Not drawn: heading semantics of the code                                                                                                                                  |
| part `items`                                      | slot **Items** (Accordion/Item)                                                                                                                                           |
| child `item`: `label`, `disabled`, part `leading` | Accordion/Item: text **Label**; State disabled; **Show leading**, **Leading icon**                                                                                        |
| item states `interaction`, `expanded`, `focus`    | State (default, hover, disabled), variant Expanded (false, true; the indicator is caret-down or caret-up, as the code's rotation), boolean **Focus** (inside the trigger) |
| item part `content`                               | slot **Content** inside Content › Body                                                                                                                                    |

## Construction notes

- The anatomy board draws the lines above and below the items only: `spec-lib` drew a one-sided stroke as a full outline (reported at the Figma parity gate, 2026-11-12) and now keeps the sides of the stroke (rebuilt specification `533:374`).
- The content starts `focus/width` + `focus/offset` below the trigger: two nested paddings (Content, then Body), since one padding binds one variable.
- The lines are the item's bottom stroke and the Accordion's top stroke, included in the layout (the code's borders).
- The family layout script now accepts a single component (the Accordion) as well as a component set.

## Justified differences

None in `computed.json`. Not drawn: the expand animation, keyboard navigation and heading levels.

## Parity method

`wave4-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes (the alpha of a bound paint read from the variable), sizes, paddings, radii and typography. `node authoring/adapters/figma/wave4-parity-report.mjs accordion <result.json>` compares every record of `computed.json` and writes `parity.json`. The real dimensions of an inserted default instance were checked as well (no frame collapses).
