# Select — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **forms/select** (`495:22`). Masters: library page **Forms** (`343:1640`), section **Select** (`496:1247`).
- Masters: **Select** ([`497:2541`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=497-2541)), 30 variants (Size × Content × State); **Listbox/Option** (`496:1323`, 15 variants: Size × State), **Listbox/Group** (`496:1324`), **Listbox/Empty** (`496:1338`). Built by `authoring/adapters/figma/listbox-select-master.plugin.js`.
- Specification frame: **Select — Specification** ([`515:648`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=515-648)); built by `wave4-spec.plugin.js` on `spec-lib.plugin.js`, with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/forms/select/contract.json` and the implementation approved on 2026-11-10 at the grouped wave 4 implementation gate (`packages/svelte/src/components/select`).
- Node IDs: `reports/components/select/figma/ledger.json`. Parity: `reports/components/select/figma/parity.json` (204 records, 204 passed, 0 failures). Screenshots: `master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                                                                             | Figma                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                                                                                               | variant Size (sm, md, lg), default md                                                                                                             |
| `value`, `placeholder`                                                                               | variant Content (placeholder, value); text properties **Value**, **Placeholder**                                                                  |
| `label`                                                                                              | text property **Label** on a hidden layer                                                                                                         |
| state `condition`                                                                                    | variant State (default, hover, readonly, disabled, invalid) and boolean **Focus** (ring, and the focus border on default and hover), as InputText |
| `open`                                                                                               | boolean **Open** (the Panel; never on readonly or disabled variants)                                                                              |
| part `leading`                                                                                       | boolean **Show leading**, instance swap **Leading icon**                                                                                          |
| parts `value`, `indicator`                                                                           | layers Value, Indicator (caret-down)                                                                                                              |
| parts `panel`, `list`                                                                                | layer Panel, slot **Options** (Listbox/Option, Listbox/Group)                                                                                     |
| child `option` (state `interaction`)                                                                 | Listbox/Option: Size, State (default, hover = highlighted, selected, selected-hover, disabled), text **Label**                                    |
| child `group`                                                                                        | Listbox/Group: text **Heading**, slot **Options**                                                                                                 |
| `options` records, `required`, `invalid` exposure, keyboard, typeahead, placement, scrolling, motion | Not drawn: data and behaviors of the code                                                                                                         |

## Construction notes

- Listbox/Option, Listbox/Group and Listbox/Empty are the contract children `option`, `group` and the part `empty`; Select and Combobox define them identically, so the two share one set of public components, built in the Select section (named under Listbox in the Assets panel; instance layers keep the names Option, Group, Empty for the specification helpers).
- The field reproduces the InputText: Leading and Indicator are slot frames with `space/control/slot-inline/{size}` and a drawing box of `input-text/icon-box` (the glyph's drawing, iconSize − iconSize/4, as the code's negative margins), so that the spacing matches the code.
- The Panel follows the field at `space/content/sm` (a vertical auto layout: the variant grows when Open is on); its height is capped by `size/overlay/list` (maxHeight) and it clips.
- Every variant hugs vertically (primaryAxisSizingMode AUTO, set again after combineAsVariants since resize() leaves it FIXED) and is 240 px wide by default, resizable on the instance; the Panel and the options fill it.

## Justified differences

The panel is as wide as the field: the code widens it for a long option label up to `size/overlay/panel`; Figma cannot make a filling panel wider than its parent (the label truncates in Figma). Not measured in `computed.json`. Not drawn: the scrollbar of a long list, keyboard, typeahead, placement (flip, shift) and motion.

## Parity method

`wave4-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes (the alpha of a bound paint read from the variable), sizes, paddings, radii and typography. `node authoring/adapters/figma/wave4-parity-report.mjs select <result.json>` compares every record of `computed.json` and writes `parity.json`. The real dimensions of an inserted default instance were checked as well (no frame collapses).
