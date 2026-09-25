---
name: ggb-figma
description: Build or update ggbrick's Figma library through the Figma MCP server - variables from the token manifest, component masters from a contract, specification pages - and prepare the design review. Used by ggb-component and ggb-foundations; use directly for Figma-only tasks.
---

# Figma

Read `authoring/figma.md` and `authoring/templates/figma-specification.md`. Inspect the Figma MCP server's tools and instructions at session start and follow them; if no Figma tool is connected, stop and report it instead of simulating the work.

## Variables (foundations)

1. `npm run build:tokens`; read `packages/tokens/figma-manifest.json` (collections, variables, values, scopes) and `figma-expectations.json`.
2. Inspect the library file: existing collections, modes, variables, styles. Create or reuse Brand, Appearance and Density collections with exactly the configured modes.
3. Sync in batches (primitives before aliases), matching by collection and name, updating values and preserving IDs. Create text styles for typography roles and effect styles for shadow roles. Renames, removals and type changes are explicit migration steps to list in the status.
4. Verify native resolution for every brand and mode pair against the expectations; record the ledger in `reports/foundations/figma/ledger.json` and the evidence in `foundations/status.json`.

## Component masters (design phase)

1. Read the contract, its token requirements (`reports/components/<id>/token-requirements.json`) and existing fixtures in the Utilities page.
2. Map the contract: enum props → variant properties (or a boolean when two values), boolean props → booleans, string props → text properties, slot parts → instance-swap properties limited to compatible fixtures, parts → named layers, token roles → variable bindings, states → variants or the master's interactive states as decided in the contract.
3. Build in small verified batches with screenshots; keep each variant set under about 30 variants by nesting an internal set when the matrix is large. Reserve the minimum interaction target around the visible surface. Bind every visual property to a variable.
4. Build the specification page from the template with explanatory instances. Check difficult cases: long labels, empty optional slots, constrained width, all states in light and dark, each brand and density.
5. Write `components/<family>/<id>/figma-spec.md`, the ledger `reports/components/<id>/figma/ledger.json` (every owned node ID) and screenshots. Update the status (`artifacts.figma`).
6. Hand back to `ggb-component` for the design gate with file and node links, screenshots and the checked cases.

## Rules

- Read IDs from the file; never guess or reuse IDs from the archived reference kit.
- Do not modify objects the design system does not own. Do not publish the library without authorization.
- Figma workarounds (context collections, fixture aliases) are adapter mechanics; they never become source tokens, contract fields or required code structures.
