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
- No Code Connect association is emitted: there is no actual Svelte component to map yet.
