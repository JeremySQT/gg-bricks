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
- `button-spec.plugin.js`: the two `use_figma` bodies that build the Button specification page (Wireframe collection with its light and blueprint modes, documentation components, header band with the Anatomy diagrams, then the body sections).
- `button-parity-report.mjs <folder>`: compares the saved measurements with `reports/components/button/svelte/computed.json` and writes `reports/components/button/figma/parity.json` (one record per computed record, justified differences noted, slot geometry records when `slots.json` is present).
- `icon-parity.plugin.js`: `use_figma` body measuring the Icon set in the 18 contexts (box size, bound variables, glyph fill, drawing box); save its result as JSON.
- `icon-parity-report.mjs <result.json>`: compares the measurement with `reports/components/icon/svelte/computed.json` and writes `reports/components/icon/figma/parity.json`.
- `icon-spec.plugin.js`: the `use_figma` body that builds the Icon specification page (same layout as the Button page).
- `counter-master.plugin.js`: `use_figma` body building the page `content/counter`, the `counter/foreground` adapter variable (Components collection) and the Counter component set (Size × Overflow) with every visual property bound to a variable.
- `counter-spec.plugin.js`: `use_figma` body building the Counter specification frame (same layout as the Button's).
- `counter-parity.plugin.js`: `use_figma` body measuring the six Counter variants in every context, the `button/foreground` proxies and Inter's default figure widths; save its result as a JSON file.
- `counter-parity-report.mjs <file>`: compares the saved measurements with `reports/components/counter/svelte/computed.json` and writes `reports/components/counter/figma/parity.json`.

## Mechanics learned with the Counter (2026-10-14)

- A number variable bound to layer opacity is read as a **percentage**: binding a 0.7 token renders 0.7 %. The token sync therefore emits opacity tokens ×100 (`opacity/muted` = 70, since 2026-10-14); components bind the opacity role directly.
- A text layer's auto height is rounded to whole pixels; bind the container height to the line-height variable when the box must be the line box (15.4, 16.8, 19.6).
- STRETCH constraints on an absolute child round the master's fractional width when applied to an instance; SCALE constraints keep the child equal to the box.
- `openTypeFeatures` is read-only on text nodes as on styles: tabular figures must be switched on by hand.
- The default variant of a set is the top-left one on the canvas, whatever the child order.

## Shortcut scripts (2026-10-14)

- `shortcut-master.plugin.js`: the two `use_figma` bodies that create the page `content/shortcut`, the `shortcut/…` adapter variables (Components collection), the parts `_Shortcut/Key` and `_Shortcut/Separator`, then the `Shortcut` component set (Appearance × Size × Platform).
- `shortcut-spec.plugin.js`: the `use_figma` body that builds the Shortcut specification page (same layout and documentation components as the Button page).
- `shortcut-parity.plugin.js`: `use_figma` body measuring the Shortcut master for one brand in its six appearance × density contexts (set `BRAND`); save each returned object as `<brand>.json` in one folder.
- `shortcut-parity-report.mjs <folder>`: compares the saved measurements with `reports/components/shortcut/svelte/computed.json` and writes `reports/components/shortcut/figma/parity.json` (one record per computed record, justified differences noted, opacity records from the contract role).
- Mechanics learned: the Plugin API refuses `componentPropertyReferences` on instance sublayers (expose the nested instance instead); auto-sized text layers are rounded to whole pixels; `strokesIncludedInLayout` gives a border-box border.

## Mechanics learned on 2026-10-14 (typography variables and collections)

- Text styles bind `fontFamily`, `fontWeight`, `fontSize` and `letterSpacing` to variables (`setBoundVariable` on the style); a line height cannot be bound as a percentage, so the style types the percentage and the `lineHeightRatio` string variable documents it. Font families reach Figma as STRING variables (scope FONT_FAMILY), weights as FLOAT (scope FONT_WEIGHT).
- On a TEXT node, `boundVariables.fontSize`, `lineHeight` and `letterSpacing` are arrays (one entry per styled segment); `setBoundVariable` on the node rebinds the whole text.
- A variable cannot move between collections: regrouping means creating the variable in the target collection, rebinding every consumer (masters first, then instance overrides; `explicitVariableModes` moved with `setExplicitVariableModeForCollection` and `clearExplicitVariableModeForCollection`) and deleting the old collection once no reference remains. A stale width binding override on a nested instance is cleared with `resetOverrides()` on that nested instance.
- Component adapter variables live in one hidden collection `Components` (modes sm, md, lg; size-independent variables repeat their value), grouped by component in the variable names. The Button keeps two more hidden collections, `Components · button style` and `Components · button state`, because its shared trailing part needs two independent mode axes (9 intent-appearance pairs × 5 states cannot share one collection).
- Token collections are named `Foundations · <Axis>` since 2026-10-14; every adapter script's `col()` helper accepts the short axis name (`col('Brand')`) and resolves it to the prefixed collection. The manifest and the sync, prune and verification scripts use the prefixed names.
