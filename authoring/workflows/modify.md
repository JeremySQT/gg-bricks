# Modify a component or foundations

This procedure includes Figma-to-source reconciliation, token/foundation edits, implementation fixes and incompatible evolution. They are branches of the same change process.

## Procedure

1. **Identify the change.** Record the requested result and starting point: contract, token JSON, Figma master/instance, target code or documentation. Inspect current sources and the last synchronized evidence. If no baseline exists, report the uncertainty and establish a reviewed comparison; never overwrite by assuming the newest timestamp wins.
2. **Analyze impact.** Locate direct and transitive consumers, affected brands/appearances/densities, composition points, public API and documentation. Classify compatibility, including visual sizing or behavioral changes that break existing usage even without a renamed property.
3. **Reconcile authoritative sources.** For Figma edits, separate source-worthy changes from adapter-only construction and instance overrides. Do not promote a local override to a shared token automatically. Accept a shared change only within the authorized scope; resolve conflicting intent before overwriting. Update tokens or contract facts first. Target-only mechanics stay in code/adapter notes. Never reverse-engineer generated CSS into source by default.
4. **Propagate.** Run existing generators for resolved tokens, CSS and adapter data. Apply design/code/specification changes that cannot be generated mechanically. Preserve stable Figma identities where possible. Reuse shared dependencies instead of cloning near-identical components.
5. **Verify and review.** Run checks proportionate to the affected behavior and contexts. Reopen the contract review only when approved contract facts change. For visual or interaction changes, present an interactive implementation review, then re-check Figma parity for the affected masters, before finalizing dependent documentation. A broad foundation change needs representative affected components and contexts, not only the initiating component.
6. **Update documentation and records.** Refresh examples, API, guidance, local discovery and evidence after behavior approval. Record old/new references, compatibility, remaining limitations and approval scope. Prepare a delivery handoff if requested.

## Incompatible change branch

Before propagating an incompatible change:

- Identify affected consumers and the replacement behavior/API/token.
- Decide whether a temporary compatibility path or deprecation is warranted; do not retain aliases forever by default.
- Describe migration with before/after examples, ordering, removal conditions and release implications.
- Offer a deterministic migration only where it can preserve meaning; identify manual cases.
- Check at least one representative existing consumer after migration.

Use [the change record](../templates/change-record.md). Version-number policy remains a release decision until formally adopted; do not silently impose one.

## Outputs

Reconciled sources and outputs, focused regression evidence, updated documentation/status and migration guidance when applicable. Preserve historical evidence; do not present old tests as evidence for changed behavior.
