# Combobox — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/combobox** (`495:21`). Masters: library page **Forms** (`343:1640`), section **Combobox** (`499:1417`).
- Masters: **Combobox** ([`499:2549`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=499-2549)), 30 variants (Size × Content × State), on the shared Listbox parts of the Select section. Built by `authoring/adapters/figma/combobox-master.plugin.js`.
- Specification frame: **Combobox — Specification** ([`516:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=516-2)); built by `wave4-spec.plugin.js` on `spec-lib.plugin.js`, with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/forms/combobox/contract.json` and the implementation approved on 2026-11-10 at the grouped wave 4 implementation gate (`packages/svelte/src/components/combobox`).
- Node IDs: `reports/components/combobox/figma/ledger.json`. Parity: `reports/components/combobox/figma/parity.json` (108 records, 108 passed, 0 failures). Screenshots: `master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                                              | Figma                                                                                         |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `size`                                                                | variant Size (sm, md, lg)                                                                     |
| `inputValue`, `placeholder`                                           | variant Content (placeholder, text); text properties **Text**, **Placeholder**                |
| `value`                                                               | not a property: the selected option is State selected in the Options slot, its label the Text |
| `label`                                                               | text property **Label** on a hidden layer                                                     |
| state `condition`                                                     | variant State and boolean **Focus**, as InputText                                             |
| `open`                                                                | boolean **Open**                                                                              |
| part `leading`                                                        | boolean **Show leading**, instance swap **Leading icon** (magnifying glass by default)        |
| parts `container`, `input`, `indicator`                               | layers Container, Input, Indicator                                                            |
| parts `panel`, `list`, `empty`                                        | layer Panel, slot **Options** (Listbox/Option, Listbox/Group, Listbox/Empty)                  |
| `filter`, `emptyLabel`, `options` records, caret, keyboard, placement | Not drawn: data and behaviors of the code (Listbox/Empty **Label** carries emptyLabel)        |

## Construction notes

- Listbox/Option, Listbox/Group and Listbox/Empty are the contract children `option`, `group` and the part `empty`; Select and Combobox define them identically, so the two share one set of public components, built in the Select section (named under Listbox in the Assets panel; instance layers keep the names Option, Group, Empty for the specification helpers).
- The field reproduces the InputText: Leading and Indicator are slot frames with `space/control/slot-inline/{size}` and a drawing box of `input-text/icon-box` (the glyph's drawing, iconSize − iconSize/4, as the code's negative margins), so that the spacing matches the code.
- The Text and Placeholder layers were named after their content by Figma (autoRename) and renamed and bound in a second pass.

## Justified differences

Not drawn: filtering, the caret, keyboard, the scrollbar of a long list, placement and motion. Listbox/Empty uses body/md; set the text style of the instance for sm and lg (the code follows the combobox size; measured at md in `computed.json`).

## Parity method

`wave4-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes (the alpha of a bound paint read from the variable), sizes, paddings, radii and typography. `node authoring/adapters/figma/wave4-parity-report.mjs combobox <result.json>` compares every record of `computed.json` and writes `parity.json`. The real dimensions of an inserted default instance were checked as well (no frame collapses).
