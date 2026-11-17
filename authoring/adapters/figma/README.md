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
- `radio-group-options.plugin.js` (superseded the same day, not approved): eight exposed options shown with booleans. Do not run it.
- `radio-group-slot.plugin.js`: Figma slots. `component.createSlot()` on each variant creates a SlotNode and a SLOT property; slots of the same name in the variants of a set share one property (bind a second slot with `componentPropertyReferences = { slotContentId: key }`). Settings (`minChildren`, `preferredValues` with the component set key, `allowPreferredValuesOnly`) go through `set.editComponentProperty`. In an instance, fill a slot by appending instances to the SlotNode (`setProperties` cannot set a SLOT); this works in nested instances too. The content of an instance's slot survives a variant change, and the layout follows the variant. A slot cannot pass a property of the group (Size) to its content: set it on each child. Groups (RadioGroup, CheckboxGroup) use a slot for their options.
- Swapping instances found with `findAllWithCriteria` must skip instance sublayers (ids starting with `I`) and read the main component with `getMainComponentAsync` (the synchronous getter throws on some nested instances).

## Library pages (2026-10-29)

- The masters live on the library pages `Actions` (`343:2`), `Content` (`343:1635`) and `Forms` (`343:1640`), one section per component (fill `wireframe/canvas`); the component pages keep the specifications and their instances. `library-pages.plugin.js` (FAMILY per run) created the pages and sections and moved the 14 component sets and their internal parts: a node moved to another page of the file keeps its ID and its instances stay linked (checked: 172 Button instances, every listed ID resolved in its section). `spec-master-links.plugin.js` added the line "Master: <family> › <component>" under each specification title (replaced on 2026-10-30 by `spec-header-links.plugin.js`).
- Scripts find a master by its component set ID (ledger), never through a page: `forms-spec.plugin.js` (third value of PAGES), `forms-parity.plugin.js`, `checkbox-focus-radius.plugin.js` and `field-focus-migrate.plugin.js` were updated; the wave 1 spec scripts no longer move the set next to the specification.
- Master builders written before this date (`*-master.plugin.js`) create their set on the former component page and remove an older set found there: before rerunning one, point it at the family page, build inside the component's section and remove the previous set from the section.

## Family pages and specification headers (2026-10-30)

- `family-pages.plugin.js` (FAMILY per run): the overview frame `<Family> — Overview` at the top of the library page (description, isometric cover, one card per component with Master and Specification links), a `Section header` at the top of each section (name, summary, Specification link, internal parts note, a Properties panel read from `componentPropertyDefinitions`), then a compact layout: the master under the header with its backdrop if any, the internal parts stacked on its right with theirs (locked `_Backdrop …` rectangles travel with the node they sit behind: the Link's on inverse rows, the white Checkbox glyphs on the checked box color), each internal set packed into a tight grid (32 px between columns and rows, order kept, so the top-left default variant stays the default). Sections stack below the overview in the order of the list. A rerun replaces the overview and the headers (new IDs; scripts find them by name) and moves masters only inside their section, so their IDs and instances are unchanged.
- The cover is live: instances on cards (some with explicit Brand or Appearance modes), scaled to fit (`ZOOM` per family), laid out as a masonry (one card width, height from the content with the same vertical padding, each card dropped into the shortest column, every column a vertical auto layout with a fixed 44 px gap: heights read back while a script runs can be stale, and cards placed by coordinates overlapped; a seeded pseudo-random order that avoids the cards already placed in the same or the next columns within 400 px), on a plane projected isometrically. Figma accepts a skew in `relativeTransform` but normalizes its scale away: scale the plane with `rescale` first, then set the unit isometric matrix `[[0.866, 0.866, tx], [-0.5, 0.5, ty]]`.
- `spec-header-links.plugin.js`: wraps the Title of each specification header in a `Title row` with a `Links` group on the right (Master, linked to the section; Documentation and Contract once `LINKS` holds their published URL templates, at the first Deliver). Rerun after rebuilding a specification page, adding a component or publishing.
- A new component: add it to `FAMILIES` (and a cover item if useful) and to `SPECS`, then run both scripts after `library-pages.plugin.js`.

## Wave 3 scripts (2026-11-03)

- **Stored libraries.** The Plugin API sandbox evaluates code built at run time, so the long shared bodies are stored once in the file as hidden, locked text layers of the Utilities page and run with `await eval('(' + node.characters + ')')(figma, …)`: `_Script/spec-lib` (`411:2`, source `spec-lib.plugin.js`: the specification page helpers of `forms-spec.plugin.js` and `build(ID, spec)`, sections may be async) and `_Script/family-pages` (`440:2`, the function form of `family-pages.plugin.js`, called with the family name). After changing a source, store it again (a body that sets `node.characters = lib.toString()`).
- `spinner-master`, `progress-master`, `skeleton-master`, `button-group-master`, `alert-master`, `toast-master` (Toast and ToastRegion), `overlays-master` (Tooltip and Popover), `dialog-master` (Dialog and `_Dialog/Backdrop`), `menu-master` (Menu, MenuItem, MenuSeparator, MenuGroup) (`.plugin.js`): one builder per section of the Feedback, Overlays and Actions library pages; `<id>-spec.plugin.js` and `overlays-spec.plugin.js` build the specification pages on `spec-lib`.
- `button-spinner-swap.plugin.js` (run once): the 270 loading indicators of the Button and IconButton masters became Spinner instances; `action-family.plugin.js` (run once): the hidden collection **Components · action family** and the rebinding of the accent and neutral paints of Button and IconButton (see Alert).
- Parity: `<id>-parity.plugin.js` and `overlays-parity.plugin.js` return one FNV-1a hash per context of the sorted field lines; `wave3-parity-report.mjs <id> <result.json>` builds the same lines from `computed.json` (`--lines <context>` prints them) and writes `parity.json`. Extra checks (alignment, placements, button families) are returned as `bad` lists by the same bodies. The Spinner has its own report (`spinner-parity-report.mjs`).

## Mechanics learned on 2026-11-03

- Figma reads a number bound to layer opacity as a percentage: component opacity tokens (`component.spinner.track-opacity`) are emitted ×100 too (`tooling/build-tokens.ts`).
- An instance sublayer cannot be resized (the override is refused or reverted): a fraction that a designer sets (the Progress indicator) is a variant of an exposed internal part.
- A paint override bound to the same variable as the main component renders its stale fallback (black): bind paints with the resolved color as fallback.
- Figma has no subtree remap of variables, but modes reach nested instances: a hidden adapter collection with one mode per host intent (Components · action family) lets a host (Alert, intense Toast) point the accent and neutral buttons at its intent, unchanged in the default mode.
- A hugging auto layout with a max width and a filling text with height auto-resize wraps at the max width and hugs short text (Tooltip, Popover).
- `combineAsVariants` merges slots of the same name into one SLOT property; `isExposedInstance` can be set only once the instance sits in a component; a nested instance cannot override its minimum height after a swap (change its variant properties instead).
- The Button master reserves its 44 px target as a minimum height: inside a group the instances clear it so that gaps separate the surfaces.
- An alpha of 0.7 is stored as float32 (178.49, `b2`): reports round alpha from `Math.fround`, like `tooling/check-figma.ts`.

## Mechanics learned on 2026-11-04 (user review of the wave 3 Figma parity)

- A slot cannot reverse the order of its children: a placement variant that should put the newest item first changes nothing (ToastRegion became a single component; the designer orders the toasts).
- A boolean cannot change a padding: a property that adds room (the Alert actions and `actionsPaddingEnd`) is a variant.
- A slot layer is named after its SLOT property: renaming one renames the other, so a variant property cannot share the name of a slot (Show actions beside the slot Actions).
- `clone()` of a variant inside its set turns its slots into plain frames: keep the slots in the original variants and give the clones the variant value without them.
- An auto layout whose children are all hidden does not collapse: bind the visibility of the wrapping frame (the Progress First line) rather than of each child.
- Properties of an exposed nested instance show on the host only in the variants that hold it (Size and Lines of `_Skeleton/Text`, only for Shape=text).
- An overlay meant to sit over an existing control takes an optional trigger: a boolean bound to the visibility of its Trigger slot, off by default (Tooltip, Popover, Menu).
- In-place changes keep node IDs and the instances placed by designers; the builders record the resulting structure for a rerun from scratch.

## Wave 4 scripts (2026-11-10)

- `wave4-pages.plugin.js`: the Navigation family page (`495:16`) after the Overlays group, its component pages and `forms/combobox`, `forms/select`, `actions/toolbar`. The variable delta (`primitive/dimension/v320`, `size/overlay/list`, `color/surface/inset`) was synced with the `sync-variables.plugin.js` body restricted to those manifest entries; the verification body ran without the name lists (they are the sorted names, so the hashes are the same) and excluded `checkbox/focus-radius`.
- `listbox-select-master`, `combobox-master`, `tabs-master`, `breadcrumb-master`, `pagination-master`, `accordion-master`, `toolbar-master` (`.plugin.js`): one builder per section. `Listbox/Option`, `Listbox/Group` and `Listbox/Empty` are public components shared by Select and Combobox (identical contract children), in the Select section.
- `wave4-spec.plugin.js`: the seven specification pages on `spec-lib` and the Master links (`spec-header-links.plugin.js` lists them too).
- `wave4-parity.plugin.js` + `wave4-parity-report.mjs <id> <measured.json>`: parity by value. The bodies measure the masters in the four contexts of `computed.json` and return the rows (`PARITY:` or the compact `PARITY2:` form); the report compares every `computed.json` record (colors ±1, alpha ±0.01, lengths ±0.01 px, inset edges by color and width) and writes `parity.json`. 1524 records, 0 failures at the wave 4 gate.
- `family-pages.plugin.js` and the stored `_Script/family-pages` (`440:2`, patched by `family-pages-wave4-patch.plugin.js`): the Navigation family, the wave 4 components and covers; a family component may be a single component (Accordion) as well as a component set.

## Mechanics learned on 2026-11-10

- **Text decoration is shared by every text layer bound to one Text property.** Binding a label resets its decoration to that of the other bound layers, and setting the decoration (with `textStyleId`) on one bound layer spreads it to all of them; text styles and sizes stay per layer. A per-variant underline (Breadcrumb hover) is a layer under the label. To repair spread formatting: unbind, delete the property, restore each layer, create a new property and bind again.
- **A bound paint mirrors the variable alpha in its `opacity`.** Read a bound color from `resolveForConsumer` alone; multiplying by the paint opacity squares the alpha (0.05 read as 0.0025).
- **`autoRename`**: a text layer named before its characters are set is renamed after its content; set `autoRename = false` or the name after the characters.
- **`resize()` resets `primaryAxisSizingMode` to FIXED**, also after `combineAsVariants`: set AUTO on every variant afterwards when a variant must grow (an open Select).
- **Choosing the default glyph again resets the glyph layer** (also through an instance property in a specification): the anatomy pins then miss the layer by name. Pass the swap only for another glyph.
- **The `use_figma` return is limited to 48 KB**: group parity rows by context and abbreviate the props.

## Mechanics learned on 2026-11-12 (user review of the wave 4 Figma parity)

- The anatomy drawing of `spec-lib` set one uniform stroke weight on every stroked frame, so a stroke on some sides only (the Accordion's lines) became a full outline. `weight()` now keeps the sides that had a stroke (dashed layout boxes stay outlined); the stored copy `411:2` was patched the same day. Boards already drawn change only when their specification is rebuilt.
- The Figma Tabs is the tab list only (user decision): the panel is functional logic placed by the designer; `wave4-parity-report.mjs` records `panelGap` as a justified difference.

## Wave 5 scripts (2026-11-14)

- `wave5-pages.plugin.js`: the Data family page (`540:63`) after the Navigation group, its component pages, and `content/avatar`, `content/avatar-group`, `content/divider`. The 52 component variables of wave 5 (`component/avatar*`, `component/data-field/*`, `component/divider/*`) were synced with the `sync-variables` mechanics restricted to those manifest entries, and the five `component/avatar/typography/*` text styles with the `sync-styles` mechanics (a component typography token becomes a text style like a semantic one).
- `wave5-avatar-master`, `wave5-avatar-group-master`, `wave5-divider-master`, `wave5-data-field-master`, `wave5-table-master` (`.plugin.js`): one builder per section (Content: Avatar, AvatarGroup, Divider; Data: DataField, Table). The Table builder's part 2 (Table/Column and Table, run the same day) is summarized in its file: Table/Column = Table/Heading instance, a Cells slot of Table/Cell instances, a Table/Footer cell (Show footer) and an absolute Column line (Column line); Table = Caption, a Frame (inside stroke, radius/container, clipping) holding a Columns slot.
- Specifications: the five bodies follow `wave4-spec.plugin.js` on the stored `_Script/spec-lib` and were run inline in the session (frames `551:2`, `553:554`, `552:703`, `555:5755`, `555:3502`); Master links with the wave 5 entries of `spec-header-links.plugin.js`. The stored `_Script/family-pages` (`440:2`) was patched for the Content components and the Data family, then run for Content and Data.
- Parity: `wave5-parity.plugin.js` + `wave5-parity-report.mjs <result.json>` (parity by hash, one FNV-1a hash per context and component); 724 records, 0 failures.

## Mechanics learned on 2026-11-14

- Figma cannot negate a variable: the negative auto layout spacing of AvatarGroup comes from Figma-only Brand variables `avatar-group/spacing/{size}` (hidden from publishing); add them to the prune keep list with `checkbox/focus-radius`.
- Figma has no `min()`: the Table cell block padding comes from Figma-only Density variables `table/padding-block/{size}` (min(space/content/sm, (size/control/{size} − 21) / 2) per density); keep them in the prune keep list too.
- `leadingTrim = 'CAP_HEIGHT'` on a text layer reproduces the code's `text-box: trim-both cap alphabetic`: centered initials sit on the cap height.
- `figma.createImage(figma.base64Decode(…))` needs the bytes in the script; pictures in masters are SVG nodes (`createNodeFromSvg`) that designers replace with an image fill.
- The blueprint ink of `spec-lib` paints SVG pictures as solid tint disks: anatomy instances use initials avatars.
- A Figma table is built from columns (each a vertical stack of cells) so that cells share their column width; spec boards keep tables narrow (two columns) in context cards, or the specification frame widens beyond 1232 px.

## Mechanics learned on 2026-11-17 (user review of the wave 5 Figma parity)

- **Slot content survives a variant switch**: a Size variant on a host whose children sit in a slot changes nothing for them (Table). Drive such a size through a mode of the hidden Components collection set by the host variant (`table/min-height`, `table/padding-block`): modes reach the instances placed in the slot.
- The same holds for an instance in a slot whose own slot content was overridden: switching its variant keeps the old content; replace the instance instead (Table/Cell).
- A variant and a slot can share a name (Content): `setProperties` must pick the key whose type is not SLOT.
- A slot switched to a horizontal layout after creation needs `counterAxisSizingMode = 'AUTO'` again, or it keeps the default 100 px height (DataField avatar).
- Baseline alignment of a horizontal auto layout does not reach into a slot whose first child is an instance: center those variants instead.
