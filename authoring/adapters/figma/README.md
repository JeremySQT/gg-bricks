# Figma adapter notes

The Plugin API script bodies inherited from the reference kit were removed after the foundations review (2026-09-26): they encoded the kit's Button node IDs and are still readable at tag `reference-kit-2026-09` (`git show cd0a2a2:authoring/adapters/figma/<name>.plugin.js`, names: helpers, sync-variables, verify-resolution, build-button-skin, review-helpers, group-slot-fixtures, configure-slot-context, migrate-button-slot-context, verify-button-slot-context). ggbrick scripts are written per task through the Figma MCP server, following `authoring/figma.md`; new reusable script bodies written for ggbrick live in this folder.

## Inputs

`npm run build:tokens` writes `packages/tokens/figma-manifest.json` (collections, variables with axis routing, text styles, effect styles) and `packages/tokens/figma-expectations.json` (expected native resolution per brand and mode pair). Primitive variables must be created before the aliases that reference them.

## Known mechanics (from the reference kit)

- Variable sync must match on collection and name, preserve IDs and update values; renames, removals and type migrations are separate, reviewed migration steps.
- Verification uses native `resolveForConsumer` on a context node per brand and mode pair, with a 0.000002 numerical tolerance against the expectations file.
- Hidden instance children must be traversed to bind icon colors (`skipInvisibleInstanceChildren = false`).
- Assign resolved fallback paints when re-binding an already-bound paint after cloning; stale fallbacks otherwise render.
- A swapped slot instance may restore stale per-component paints; an inherited foreground alias set by the parent surface's context solves it.
- Review containers must not clip a focus outline; only adjust containers the review owns.
- Never use a broad name prefix to delete or modify content the design system does not own; read IDs from the file and persist them in the ledger after each batch.

## Component parity scripts

- `button-parity.plugin.js`: `use_figma` body measuring the Button masters for one brand and its appearances (set `BRAND` and `APS`); save each returned object as `<brand>-<appearance>.json` in one folder.
- `button-parity-slots.plugin.js`: `use_figma` body checking leading and trailing slot geometry against the contract spacing rule in every context and size; save its `all` object as `slots.json` in the same folder.
- `button-spec.plugin.js`: the `use_figma` bodies that build the Button specification page (Wireframe collection and documentation components, then the sections with their diagrams).
- `button-parity-report.mjs <folder>`: compares the saved measurements with `reports/components/button/svelte/computed.json` and writes `reports/components/button/figma/parity.json` (one record per computed record, justified differences noted, slot geometry records when `slots.json` is present).
