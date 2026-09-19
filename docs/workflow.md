# Component lifecycle

## Phases and outputs

| Phase | Required work | Exit |
| --- | --- | --- |
| Scope | Read catalog, dependencies and conventions; identify missing product decisions | Scope clear; material unknowns resolved |
| Contract | Draft compact contract and justified token additions; identify legal states and content | User approval tied to exact contract and relevant token revisions |
| Design | Build Figma component and reviewable variants, states and difficult cases | User approves the identified design revision |
| Specifications | Complete Figma template and reconcile any source changes | Contract and visual specifications coherent |
| Implementation | Implement Svelte behavior, accessibility and visual parity; produce evidence | Relevant automated checks pass and reviewable implementation exists |
| Documentation | Complete shared usage page, runnable examples, catalog entry and local discovery | Documents agree with actual artifacts and version |
| Delivery | Review readiness and make artifacts available through authorized release mechanisms | User delivery approval and all completion conditions met |

Within established conventions, proceed autonomously. Do not ask for each routine implementation decision. Ask when a missing decision changes scope, public API, intrinsic behavior or a previously approved design.

User approvals are the three agreed workflow gates, not invented tool permissions. A user can approve several stages explicitly; record that scope and do not ask again for unchanged revisions. A ready artifact is not authorization to publish or message others.

## Done

All must hold:
- Figma component is usable from the intended library, with options and specifications.
- Code component is usable through the intended package and import path.
- Human documentation is consultable.
- Agent documentation is discoverable and aligned with the installed package.
- Contract, relevant tokens, Figma and implementation correspond.
- Agreed behavior, composition, accessibility and visual cases are checked.
- Known limitations and supported contexts are documented.
- Delivery approval references the reviewed artifact revisions.

A draft Figma component, passing token tests, or a visual approval alone does not imply Done. If hosting or publication infrastructure is unresolved, report ready artifacts separately from actual availability.

## Resume and invalidation

Read the component status, latest artifacts and evidence before doing work. Confirm recorded references still exist. Capture exact file digests or commit IDs, plus a precise Figma reference and revision/export evidence where available. Never claim an unavailable immutable Figma revision identifier.

Contract changes require impact analysis for design, implementation and docs. Visual changes require parity review and possibly contract revision. Code API changes require API/example updates. Pure prose corrections need not invalidate unrelated approvals.

Mark only impacted approvals stale. Preserve the historical approval record and its source; never invent reviewer names, timestamps or acceptance.

Use templates/component-status.json as a proposed starting representation. Null means unrecorded, not approved. Fill the records from actual work. Do not overwrite later user edits when resuming.
