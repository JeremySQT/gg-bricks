# Contracts and evidence

## Overview

Every ggbrick component is defined once by a platform-independent contract: its options, parts, states, events, the tokens it reads and the rules it follows. The Svelte package, the Figma library and this documentation are built from it or checked against it. Evidence records how each component was verified and who approved it.

You need neither to use the components. Read the contract to build ggbrick components in another technology, or to check what an implementation must guarantee.

## The contract

The package ships one contract per component as `contracts/<id>.json` (for example `node_modules/@ggbrick/svelte/contracts/button.json`).

| Field    | Content                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| `props`  | Options with their values or type, default, and whether they are required or two-way (`bindable`).                   |
| `parts`  | The named pieces of the component; a slot lists the content it accepts and how many items.                           |
| `states` | Interaction and derived states (hover, pressed, loading, overflow) that change the rendering.                        |
| `events` | What the component reports, and when.                                                                                |
| `tokens` | Each visual role mapped to a token path; `{size}` or `{intent}` stands for the value of that option or state.        |
| `rules`  | Intrinsic behavior in plain sentences: layout, accessibility, edge cases. An implementation must follow all of them. |

The contract names concepts, not code: `props.size` is `size` in Svelte and the Size variant in Figma, and each component page documents the names of the Svelte API. Token paths become CSS custom properties: `typography.indicator.{size}` is `var(--ggb-typography-indicator-md)` for the `md` size.

## Building another implementation

- Read every rule of the contract; the component page explains the intent behind them.
- Bind visual roles to the token paths of `tokens`, through `tokens.css` or the resolved values of `@ggbrick/tokens` (`resolved/<brand>-<appearance>-<density>.json`).
- Reproduce the accessibility guarantees listed on the component page: they are part of the behavior.
- Check contrast only on the surfaces the [Color](color.md) guide lists: other pairs are not tested.

## Evidence

A component is Done when its contract, its implementation (the design review) and its Figma reproduction have each been approved by a person, and its documentation is written. Each approval covers an exact revision of the files, recorded in the repository with automated evidence:

| Evidence            | What it shows                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Contract validation | The contract matches its schema and every token path resolves in the 18 brand × appearance × density contexts. |
| Contrast            | Every color pair the component binds (content, border, focus) measured on its surfaces in the 18 contexts.     |
| Browser tests       | Behavior, keyboard, accessibility tree, axe-core in light and dark, forced colors, computed values.            |
| Figma parity        | The Figma master measured against the Svelte rendering, property by property.                                  |

Evidence lives in the repository (the status file next to each contract and the `reports/` folder), not in the package.

<!-- site:evidence -->
