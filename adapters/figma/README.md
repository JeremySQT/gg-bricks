# Figma reference adapter

Read docs/button-contract-review.md for the mapping and known limitations. This folder contains reusable Plugin API script bodies, not a packaged Figma plugin or a one-click CLI importer.

## Inputs and execution

1. Run `npm run build:tokens`. It writes dist/figma-manifest.json, resolved maps and native-resolution expectations.
2. Inspect the destination file. Create or reuse Brand, Appearance and Density collections with exactly the configured modes. Follow the external Figma tool's required skill.
3. For variable synchronization, prepend `const defs = <a manifest.variables slice>;` to sync-variables.plugin.js. Keep batches below the tool's code limit. Primitive variables must precede aliases. The script matches collection/name, preserves IDs and updates values; renames/removals/type migrations require separate review.
4. For Button construction, concatenate helpers.plugin.js and build-button-skin.plugin.js, providing `intent`, `appearance`, `index` and `fixtures`. The checked-in page and fixture IDs identify this reference file; replace them with the destination ledger before execution. Do not guess IDs. Build one internal set at a time and verify it visually.
5. The public wrapper has intent × appearance variants and exposes the internal instance properties. Its transparent target binds size.target.min. See the recorded structure in reports/figma/ledger.json.
6. review-helpers.plugin.js creates examples from the public component. Its public set ID also belongs to this file. Generic fixture swaps need explicit contextual paint and sizing validation.
7. For verification, prepend `paths`, `values` and `contexts` to verify-resolution.plugin.js using the generated expectations and current context node IDs. It uses native resolveForConsumer and a 0.000002 numerical tolerance.

The scripts are construction references for an agent, not a guarantee of rebuilding the whole document with no adaptation. Tokens and component contracts remain authoritative. Layout and specification prose use docs and templates.

## Resume

Read reports/figma/ledger.json, then inspect the actual file before editing. Persist new IDs and snapshot evidence after each successful batch. Never use a broad name prefix to delete or modify unrelated content. Reconcile user edits before replaying any construction script.

## Known mechanics

- Hidden instance children must be traversed for icon color binding (`skipInvisibleInstanceChildren = false`).
- Use resolved fallback paints when assigning an already-bound paint after cloning; the reference run exposed stale fallback rendering otherwise.
- Review containers must not clip a focus outline. Only adjust containers owned by the review.
- Imported Plus is from Figma Simple Design System, component key afef62430a3011f42389d0b20fada3c93a0b0684. The broader icon strategy and distribution license review belong to the implementation/release phase.
- No Code Connect association is emitted. A Svelte implementation now exists in packages/svelte/, but Code Connect mapping has not been added.

## Slot foreground inheritance — corrected reference

The Button rule is: leading and trailing foreground uses the resolved Button content color. A direct paint override on a swapped instance is insufficient: repeated swaps restored stale per-component colors in this reference file, even after grouping compatible components into a variant family.

The Figma adapter therefore supplies two internal context collections:

- `_Button content/Style`: nine intent/appearance modes and one foreground alias.
- `_Button content/State`: five resolved states and nine style-specific aliases.

The foreground alias points to a style alias, which points to the existing `color/action/{intent}/{appearance}/{state}/content` variable. Existing Appearance and Brand modes still resolve that source variable. Disabled-loading selects disabled colors. Each internal Button surface sets its own two context modes; fixtures inherit them. All fixtures bind the same foreground alias, so swapping does not restore a stale intent/state-specific paint.

These ten generated aliases are Figma implementation machinery, not additional JSON tokens, public customization axes or a new semantic layer. The file now has 466 variables: 456 existing variables and 10 adapter aliases. Collections have nine and five modes in this tested file; portability to other files/plans must be checked before replication. Adapter variables are hidden from publishing and have `currentColor` code syntax; publishing/distribution remains unvalidated.

Reference migration order:

1. `configure-slot-context.plugin.js`: create/reuse aliases and bind known fixture children.
2. `group-slot-fixtures.plugin.js`: retain fixture component IDs, group them and separate Counter value / Shortcut value defaults.
3. `migrate-button-slot-context.plugin.js`: set inherited context on the 162 existing surface variants and bind both slots.
4. Migrate owned review examples by preserving slot property values, resetting stale slot overrides, then restoring properties. Do not reset unrelated user overrides globally.
5. `verify-button-slot-context.plugin.js`: exercise repeated swaps on the recorded regression instance; inspect the screenshot too.

For new internal surfaces, `build-button-skin.plugin.js` now sets the context modes and binds slots to the shared alias. `review-helpers.plugin.js` no longer adds contextual per-example paint overrides. Fixture family `24:2` keeps components icon `20:2`, counter `7:9`, shortcut `7:11`. Do not infer support for arbitrary imported components: their foreground must conform to this adapter binding. Complete dependency contracts are still pending.

Evidence: `reports/figma/slot-context-regression.json` and `slot-context.png`. The earlier slot-color-review report records a failed intermediate approach, superseded by this correction. The mutation ledger is supplemental to the original build ledger.
