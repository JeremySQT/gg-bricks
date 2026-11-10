# Breadcrumb — Figma specification

## Overview

- File: [GG.Bricks — Design system](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system), component page **navigation/breadcrumb** (`495:18`). Masters: library page **Navigation** (`495:16`), section **Breadcrumb** (`503:164`).
- Masters: **Breadcrumb** ([`503:405`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=503-405)), 4 variants (Size × Separator); **Breadcrumb/Item** (`503:247`, 8 variants: Size × State), **Breadcrumb/More** (`503:284`, 4 variants); internal parts **\_Breadcrumb/Separator** (`503:180`, Size × Shape) and **\_Breadcrumb/Slash** (`503:167`). Built by `authoring/adapters/figma/breadcrumb-master.plugin.js`.
- Specification frame: **Breadcrumb — Specification** ([`518:2`](https://www.figma.com/design/TDPqojP4KvbWJlKSYc4zKC/GG.Bricks---Design-system?node-id=518-2)); built by `wave4-spec.plugin.js` on `spec-lib.plugin.js`, with the Master link of `spec-header-links.plugin.js`.
- Reproduces: contract `foundations/components/navigation/breadcrumb/contract.json` and the implementation approved on 2026-11-10 at the grouped wave 4 implementation gate (`packages/svelte/src/components/breadcrumb`).
- Node IDs: `reports/components/breadcrumb/figma/ledger.json`. Parity: `reports/components/breadcrumb/figma/parity.json` (64 records, 64 passed, 0 failures). Screenshots: `master-set.png`, `specification.png`.
- The library is not published (publication needs explicit authorization).

## Mapping from the contract

| Contract                                                   | Figma                                                                                                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`                                                     | variant Size (sm, md)                                                                                                                                            |
| `separator`                                                | variant Separator on the Breadcrumb (default items); each item holds an exposed Separator (_Breadcrumb/Separator: Shape chevron or slash)                        |
| `label`                                                    | text property **Label** on a hidden layer                                                                                                                        |
| part `items`                                               | slot **Items** (Breadcrumb/Item, Breadcrumb/More)                                                                                                                |
| child `item`: `label`, `href`, `hideLabel`, part `leading` | Breadcrumb/Item: text **Label**; State link (href), text (no href), current (last); **Show label** off for hideLabel; **Show leading**, **Leading icon** (house) |
| item states `interaction`, `current`, `focus`              | State hover (underline), current; boolean **Focus**                                                                                                              |
| part `more`, `moreLabel`, `maxItems`                       | Breadcrumb/More (text **Label** on a hidden layer); the collapse is a behavior of the code                                                                       |
| truncation, Menu of hidden items                           | Not drawn: behaviors of the code                                                                                                                                 |

## Construction notes

- The slash separator is the code's own path on the 256-unit grid (`_Breadcrumb/Slash`), not a Phosphor glyph.
- The hover underline is an Underline layer under the label (`border/width/default` in `color/content/primary`, under the baseline): Figma keeps a single text decoration for every text layer bound to one Text property, so the decoration of the hover variant could not live on the bound label. The first build lost it and a later edit spread it to every variant; the Label property was recreated and the formatting restored (`breadcrumb-master.plugin.js`, parts 2 to 4).
- Breadcrumb/More keeps a real text underline (its ellipsis is not bound to a property).

## Justified differences

The underline is drawn as a layer, not as a text decoration (Figma mechanics, above): it does not skip descenders as the browser does. Not drawn: truncation, the collapse with maxItems and the Menu of hidden items.

## Parity method

`wave4-parity.plugin.js` measures the masters with explicit Brand, Appearance and Density modes in the four contexts of `computed.json` (base light standard, base dark standard, brick light compact, orchid dark comfortable): resolved fills and strokes (the alpha of a bound paint read from the variable), sizes, paddings, radii and typography. `node authoring/adapters/figma/wave4-parity-report.mjs breadcrumb <result.json>` compares every record of `computed.json` and writes `parity.json`. The real dimensions of an inserted default instance were checked as well (no frame collapses).
