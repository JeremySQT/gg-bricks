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

## IconButton, Badge and Link scripts (2026-10-19)

- `icon-button-master.plugin.js`, `icon-button-spec.plugin.js`: the IconButton component set (135 variants, Button treatments and adapter modes, a Target layer outside the layout) and its specification page.
- `badge-master.plugin.js`, `badge-spec.plugin.js`: the Badge component set (36 variants, Counter box family, the adapter variable `badge/icon-box`) and its specification page.
- `link-master.plugin.js`, `link-spec.plugin.js`: the collections `Components · link size` and `Components · link color`, the internal part `_Link/Destination` (6 variants), the Link component set (Color × Size × State, 54 variants, each setting its own modes; rebuilt on 2026-10-20 from the mode-based version of 2026-10-19) and its specification page.
- `phosphor-components.plugin.js`, `phosphor-spec.plugin.js`: the Phosphor glyph components of `assets/phosphor` and their notes frame.
- `icon-button-parity.plugin.js` + `icon-button-parity-report.mjs`, `badge-parity.plugin.js` + `badge-parity-report.mjs`, `link-parity.plugin.js` + `link-parity-report.mjs`: parity by hash. The Figma body builds one field string per case, returns per context the FNV-1a hash of the sorted `key=fields` lines (plus the lines of the contexts listed in `DETAIL`, and numeric fields that need a tolerance), and the report script builds the same strings from `computed.json`; an equal hash proves every field equal. This keeps the MCP output small (the full lines of 18 contexts exceed its limit).

## Mechanics learned on 2026-10-19

- Changing the default of an instance-swap property (Icon › Glyph) re-swaps every instance that had not chosen its own value, and Figma drops the nested overrides under the swapped instance (the Button's leading glyph color, restored the same day). Explicitly setting the default value again has the same effect. Choosing any other component keeps the overrides. Scripts never set a default glyph explicitly and check slot colors after any default change.
- An inside stroke on an auto-layout frame is included in its layout by default for these masters (`strokesIncludedInLayout`); set it to false where the code draws an inset shadow that takes no room (Badge).
- `setBoundVariable('textDecorationThickness', …)` is refused (“Unknown field”): the underline thickness stays a literal (Link).
- An absolute child bound to a size variable keeps its creation position: set its x and y explicitly, then CENTER constraints keep it centered when the parent's bound size changes with the density (IconButton Target).
- Straight apostrophes in a component description are stored as `&#39;`; use the typographic apostrophe.

## Mechanics learned on 2026-10-20

- An auto-layout frame with no child keeps a width of 100 px whatever its sizing mode: an empty variant (Link's `Destination=page`) is fixed at 0.01 px wide instead.
- Modes set explicitly on a variant reach the nested instances it holds: the Link variants set the modes of `Components · link size` and `Components · link color`, and the nested `_Link/Destination` part resolves `link/quiet` and `link/font-size` through them. Exposing the nested instance (`isExposedInstance`) lets a designer set its Destination and Meta from the Link instance.
- `get_screenshot` of a component set renders the set alone: a page decoration behind it (the Link's on inverse backdrop) appears on the canvas but not in the exported master-set image.

## Icon slots (2026-10-26)

- `icon-slot-migrate.plugin.js`: replaces a nested Icon by the Phosphor glyph itself in every variant of one set, behind a new instance-swap property, and re-applies the glyph and visibility of every existing instance. Run once per set (Badge, IconButton, `_Link/Destination`, Button, `_Button/Trailing` on 2026-10-26); the master builders now build the glyph directly.
- An instance-swap property has one default for the whole set: binding a layer swaps it to that default, and swapping one variant's bound layer changes the default of every variant. Per-variant default glyphs are not possible (the Badge's per-intent glyphs became instance choices on its specification page).
- Binding the property can drop the glyph color override of the variants: set the fills again after binding.
- Replacing a layer drops the overrides instances had on it (a glyph chosen, a hidden icon): read them first and re-apply them. Swapping a hidden glyph on an instance shows it again: restore the visibility after the swap.
- Choosing the default glyph again on an instance whose glyph is already the default resets the glyph layer (its name and its color): scripts never set the default explicitly.
- `nested-parts.plugin.js` (three parts): the internal parts `_Counter/Nested` and `_Shortcut/Nested` (the md variants, sized by the host's Components mode) and the `_Button/Trailing` reduction to Type, with the content of every trailing instance re-applied.
- A variant cloned out of its set loses its component property references (visibility, text): add the properties to the new set and bind them again. `clearExplicitVariableModeForCollection` on a variant lets it take the mode of its host.
- A nested component whose size is a variant property always shows that Size once exposed; a host that must impose the size holds a copy whose size comes from a mode the host sets.

## Form scripts (wave 2, 2026-10-27)

- `forms-setup.plugin.js`: the seven `forms/*` pages and the wave 2 adapter variables of the hidden **Components** collection (`radio/dot`, `switch/track-width`, `switch/thumb`, `switch/inset`, `input-text/icon-box`, `field/icon-box`, `textarea/more-rows`; `textarea/text-rows` is created by the Textarea builder).
- `checkbox-master`, `radio-master`, `radio-group-master`, `switch-master`, `input-text-master`, `textarea-master`, `field-master` (`.plugin.js`): one component set each. Choice controls (Checkbox, Radio, Switch) center their control in a **First line** frame bound to `typography/body/{size}/lineHeight`, so it sits on the first line of the label in every density.
- `forms-spec.plugin.js`: one body for the seven specification pages (shared helpers, one block per component between `// <spec:id>` markers, `IDS` lists the pages to build; about three per call fit in the 50 000-character limit of `use_figma` once comments and indentation are dropped). The anatomy board shows a real instance enlarged with `rescale`, clamped to the 1088 px column, in the dark appearance.
- `forms-parity.plugin.js` + `forms-parity-report.mjs <id>`: parity by hash for the seven sets (set `ID` in the body). Keys carry the occurrence number of a props-and-state pair in a context (`size=md|default#1`), because the review pages measure some pairs twice. Numeric rows identical across contexts are returned once (`TUPLES`, `NUMS`), which keeps the output small enough to save from the tool result.

## Mechanics learned on 2026-10-27

- A text style binds font family, size, weight and letter spacing to variables but keeps the line height as a percentage: `boundVariables.lineHeight` is absent on text nodes; read `fontSize × lineHeight.value / 100`. Frames that must be one line tall bind their height to the `typography/*/lineHeight` variable instead.
- Figma rounds the text box of a fractional line (28.8 px) to 29 px: centering against the text box moves the first-line center by 0.1 px.
- `instance.rescale(z)` scales a whole instance (text included) for a drawing; it is never used on masters.
- An instance-swap property for a whole-control slot (Field's Control) resets every variant's control to its single default: the slot is an exposed instance set per variant instead, swapped by the designer in the layers panel.
- `componentPropertyReferences` cannot be set on a layer inside a nested instance (the RadioGroup's hidden name layer is found by exact name, not by the radios' Label).
- Every wave 2 browser spec that measures hover after a focus check must blur first: focus survives a context switch and its ring was recorded as part of the hover state.

## Mechanics learned on 2026-10-28

- `checkbox-focus-radius.plugin.js`: a Figma-only variable in the **Brand** collection (`checkbox/focus-radius`, hidden from publishing) holds radius/indicator + focus/offset per brand, for the concentric focus ring of the Checkbox. A value that depends on the brand cannot live in the Components collection (its modes are sizes). The prune script's keep list must name it (`Foundations · Brand:checkbox/focus-radius`); rerun the script after a change of either token.
- Anatomy boards draw the enlarged instance in the blueprint ink (`inkDrawing` in `forms-spec.plugin.js`): fills become `wireframe/tint/16`, strokes `wireframe/tint/48` at 1.5 px, text and glyphs `wireframe/ink`, transparent paints stay empty (their alpha is read from the bound variable). Leaders are always straight. `ANATOMY_ONLY = true` redraws only the boards of existing specification frames.
- `strokesIncludedInLayout` can be set only on auto-layout frames; text layers set to `HUG` in a drawing end at their last word, where a side pin can land.
- `field-focus-migrate.plugin.js`: Focus is a property only on InputText and Textarea (State=focus removed); the code's focus border is a “Focus border” layer shown by Focus on the default and hover variants. Frames that hold a focusable control (Field's Header, Label row, Body) must not clip, or the ring outside the control disappears. `createAutoLayout` clips by default.
- `radio-group-options.plugin.js`: an instance cannot receive new layers, so a group holds its maximum number of options (eight exposed Radio instances) and shows them with booleans (Show option 3 … 8). Overrides of an exposed option survive a variant change of the group. CheckboxGroup will follow the same pattern.
- Swapping instances found with `findAllWithCriteria` must skip instance sublayers (ids starting with `I`) and read the main component with `getMainComponentAsync` (the synchronous getter throws on some nested instances).
