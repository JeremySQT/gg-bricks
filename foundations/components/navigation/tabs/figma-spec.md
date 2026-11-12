# Tabs — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **navigation/tabs** (`495:20`). Masters: library page **Navigation** (`495:16`), section **Tabs** (`501:2`).
- Masters: **Tabs** ([`502:530`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=502-530)), 12 variants (Appearance × Orientation × Size); **Tabs/Trigger** (`501:249`) and **Tabs/Vertical trigger** (`501:496`), 24 variants each (Appearance × Size × State). Built by `authoring/adapters/figma/tabs-master.plugin.js`.
- Specification frame: **Tabs — Specification** ([`534:512`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=534-512)); built by `wave4-spec.plugin.js` on `spec-lib.plugin.js`, with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/navigation/tabs/contract.json` and the implementation approved on 2026-11-10 at the grouped wave 4 implementation gate (`packages/svelte/src/components/tabs`).
- Node IDs: `reports/components/tabs/figma/ledger.json`. Parity: `reports/components/tabs/figma/parity.json` (612 records, 612 passed, 0 failures). Screenshots: `master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                          | Figma                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appearance`                                      | variant Appearance (contained, line), default contained                                                                                                                                                                                                                               |
| `orientation`                                     | variant Orientation; the vertical list holds Tabs/Vertical trigger                                                                                                                                                                                                                    |
| `size`                                            | variant Size                                                                                                                                                                                                                                                                          |
| `label`                                           | text property **Label** on a hidden layer                                                                                                                                                                                                                                             |
| `value`, `activation`                             | not drawn: the selected tab is State selected                                                                                                                                                                                                                                         |
| part `list`                                       | layer Bar holding the slot **Tabs**                                                                                                                                                                                                                                                   |
| child `trigger` (selected, interaction)           | Tabs/Trigger: State (selected, default, hover, disabled), text **Label**, **Show leading**, **Leading icon**, **Show trailing** with the slot **Trailing** (Counter or Badge), **Focus**                                                                                              |
| part `panels`, child `panel`                      | Not in the master (user decision at the Figma parity gate, 2026-11-12): the Figma Tabs is the tab list only; the designer places the content of the selected tab `space/content/lg` from the list (panelGap). The contract and the code keep the panels, which they link to the tabs. |
| part `scrollButtons`, overflow fade, roving focus | Not drawn: behaviors of the code                                                                                                                                                                                                                                                      |

## Construction notes

- **Line, selected label in the indicator color** (user decision at the Figma parity gate, 2026-11-12, option C): the selected tab of a line list paints its label and leading icon in `color/item/indicator` (the contract role `selectedColor`); the selected tab keeps its look under the pointer in both appearances (no hover surface), so the accent label always reads on the list's surface.
- **The tab list only** (user decision, 2026-11-12): the Panel slot of the first build was removed, since the panel is functional logic and was in the way in design. Each variant is the list (Bar); a horizontal list is 400 px wide by default and resizable, a vertical list 200 px.
- Two trigger sets keep each under 30 variants: the vertical tab is as wide as the list and starts its content at the inline start, and its line indicator sits on the inline end.
- The line of a line list is a Line layer under the tabs (horizontal: at the bottom; vertical: at the inline end, with the list padding reserving its width as the code's border); the selected indicator covers it.
- The contained list (Bar) is painted in the new role `color/surface/inset` (VariableID:493:4); the selected tab in `color/surface/overlay` with an inside stroke in `color/elevation/border` and the effect style shadow/raised. Tabs are `space/content/xs` apart in both appearances (round 5).
- The Trailing slot holds `_Counter/Nested`, sized by the Components mode the tab sets.

## Justified differences

- `panelGap` (4 records of `computed.json`) is not part of the master: the panel is placed by the designer (above).
- A contained horizontal list shares its width equally: Figma tabs set to fill do so, but cannot keep a tab at least as wide as its content when the list is narrow (the code's min-inline-size: max-content). Not drawn: overflow scrolling, fade and scroll buttons, roving focus and activation.

## Parity method

`wave4-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes (the alpha of a bound paint read from the variable), sizes, paddings, radii and typography. `node authoring/adapters/figma/wave4-parity-report.mjs tabs <result.json>` compares every record of `computed.json` and writes `parity.json`. The real dimensions of an inserted default instance were checked as well (no frame collapses).
