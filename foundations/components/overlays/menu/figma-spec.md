# Menu — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **overlays/menu** (`407:121`). Masters: library page **Overlays** (`407:119`), section **Menu** (`437:273`).
- Masters: **Menu** ([`437:795`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=437-795)), 6 variants; **MenuItem** (`437:343`), 6 variants; **MenuSeparator** (`437:344`); **MenuGroup** (`437:401`), 2 variants. Built by `authoring/adapters/figma/menu-master.plugin.js`.
- Specification frame: **Menu — Specification** ([`439:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=439-2)); built by `menu-spec.plugin.js` on `spec-lib.plugin.js`.
- Reproduces: contract `foundations/components/overlays/menu/contract.json` (approved 2026-11-03 with the group alignment amendment) and the implementation approved on 2026-11-03 (`packages/svelte/src/components/menu`).
- Node IDs: `reports/components/menu/figma/ledger.json`. Parity: `reports/components/menu/figma/parity.json` (60 records, 0 failures) plus 270 extra checks. Screenshots: `master-set.png`, `specification.png`, `blueprint-anatomy.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                          | Figma                                                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `side`, `align`                                   | Menu: variant properties Side (bottom, top), Align (start, center, end); default bottom · start                           |
| `label`                                           | Menu: text property **Label** on a hidden layer                                                                           |
| parts `trigger`, `panel`, `items`                 | Slot **Trigger** (Button, IconButton), layer Panel, slot **Items** (MenuItem, MenuSeparator, MenuGroup)                   |
| item `intent`, state `interaction`                | MenuItem: Intent (neutral, danger), State (default, hover = highlighted, disabled)                                        |
| item `label`, parts `leading`, `trailing`         | MenuItem: text **Label**, booleans **Show leading**, **Show trailing**, instance swap **Icon**; Trailing is a Shortcut sm |
| item `disabled`                                   | State=disabled                                                                                                            |
| item `value`, `href`                              | Not drawn: what activating the item does (a link item looks the same)                                                     |
| separator                                         | MenuSeparator                                                                                                             |
| group `label`, part `items`                       | MenuGroup: text **Label**, slot **Items** (MenuItem only), variant Indent (yes, no)                                       |
| `open`, keyboard, typeahead, focus, motion, layer | Not drawn: behaviors of the code                                                                                          |

## Construction notes

- MenuItem is 240 px wide by default and fills the panel inside a Menu; its height is the line of body/sm plus the padding-block, at least `size/control/sm` (29, 33 and 37 px in compact, standard and comfortable, as the code).
- MenuGroup Indent=yes keeps a room of `size/icon/sm` + `space/control/gap/sm` before the heading, so that it aligns with the labels of items with a leading icon (the group tokens `leadingSize` and `leadingGap`).

## Justified differences

None in `computed.json`. Not drawn: keyboard navigation, typeahead, focus and the motion (behaviors of the code).

## Parity method

`menu-parity.plugin.js` hashes the four items (highlighted, default, disabled, danger) and the panel of the default Menu variant in the four contexts of `computed.json` and runs the extra checks (plain item height, placements, group headings) in the 18 contexts; `node authoring/adapters/figma/wave3-parity-report.mjs menu <result.json>` writes `parity.json`.
