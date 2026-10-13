---
name: ggb-figma
description: Build or update ggbrick's Figma library through the Figma MCP server - variables and styles from the token manifest, component masters reproducing an approved Svelte implementation, specification pages - and verify parity for the Figma parity gate. Used by ggb-component and ggb-foundations; use directly for Figma-only tasks.
---

# Figma

Read `authoring/figma.md` and `authoring/templates/figma-specification.md`. Inspect the Figma MCP server's tools and instructions at session start and follow them. If no Figma tool is connected, report it to the calling skill (which records the phase as pending) or to the user; never simulate Figma work.

## Variables and styles (foundations)

1. `npm run build:tokens`; read `packages/tokens/figma-manifest.json` and `figma-expectations.json`.
2. Inspect the library file: collections, modes, variables, styles. Create or reuse Brand, Appearance and Density with exactly the configured modes.
3. Sync in batches (primitives before aliases), matching by collection and name, updating values and preserving IDs. Create text styles for typography roles and effect styles for shadow roles. Renames, removals and type changes are explicit migration steps listed in the status.
4. Verify native resolution for every brand and mode pair against the expectations; write `reports/tokens/figma/ledger.json` and record evidence in `foundations/tokens/status.json`.

## Component masters (parity phase, after the implementation gate)

1. Read the contract, the approved implementation (`packages/svelte/src/components/<id>/`), the example page screenshots and `reports/components/<id>/svelte/computed.json` (computed colors and dimensions per option and state). Inspect existing fixtures in the Utilities page and the ledger.
2. Map the contract: enum props → variant properties (or a boolean when two values), boolean props → booleans, string props → text properties, slot parts → instance-swap properties limited to compatible fixtures, parts → named layers, token roles → variable bindings, states → variants. Keep each variant set under about 30 variants by nesting an internal set when the matrix is large. Reserve the minimum interaction target around the visible surface.
3. Build in small batches verified by screenshot. Bind every visual property to a variable; no literal colors or sizes in masters. Read every ID from the file.
4. Build the specification page from the template with explanatory instances: Overview, Anatomy, Variants, States, Behavior & sizing, Usage examples.
5. **Parity check.** For every option and state, compare the Figma master's resolved values (fills, strokes, radius, padding, gap, typography, sizes) with `computed.json`, in each brand and appearance and density; check difficult cases (long labels, empty optional slots, constrained width). Write `reports/components/<id>/figma/parity.json`: `{ "records": [ { context, props, state, part, property, expected, observed, passed, note } ] }`, one record per computed-value record, and screenshots. A justified difference (Figma cannot express a behavior) is recorded as such, not hidden.
6. Write `foundations/components/<family>/<id>/figma-spec.md` and `reports/components/<id>/figma/ledger.json`. Update the status (`artifacts.figma`, `artifacts.figmaSpec`, checks). Hand back to `ggb-component` for the Figma parity gate with links, screenshots and the parity report.

## Rules

- Never guess or reuse IDs from the archived reference kit. Never modify objects the design system does not own. Never publish the library without authorization.
- Figma workarounds (context collections, fixture aliases) are adapter mechanics recorded in `figma-spec.md`; they never become source tokens, contract fields or code requirements.
