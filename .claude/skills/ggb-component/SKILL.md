---
name: ggb-component
description: Build one ggbrick component (or a whole roadmap wave) end to end - scope, contract, Figma design and specification, Svelte implementation with examples and tests, interactive review, documentation - stopping only at the contract, design and implementation gates. Use for "do the Button", "build InputText", "build wave 2".
---

# Build a component

Read `AGENTS.md`, `authoring/roadmap.md`, `authoring/decisions.md`, `authoring/workflow.md` (Create, and Batch for a wave) and `authoring/component-catalog.md` for the component's scope notes. Then read only the playbook section of the current phase (`authoring/playbook.md`).

## Prerequisites

- `foundations/status.json` must record approved primitives and semantic tokens. If not, answer with the blocker and the next step (`ggb-foundations`); create nothing.
- Dependencies declared for the component (for example Icon for Button's slots) must have passed their implementation gate, or be built in the same wave before their dependents. Fixtures used only in examples are not dependencies.
- If `components/<family>/<id>/status.json` exists, resume at the earliest incomplete or invalidated phase it records; do not redo approved phases.

## Phases and gates

1. **Scope** (playbook: Scope). `npm run new:component -- <family> <id>` with the family folder from `authoring/component-catalog.md`. Fill `status.json` (`scope`, `dependencies`, `openDecisions`). Update the roadmap state.
2. **Contract** (skill `ggb-contract`). Draft `contract.json` and any token additions; `npm run validate`; `npm run build:tokens`. **Stop: contract gate.** Present the contract table (options, parts, states, rules, token roles), token additions, choices made, grouped questions. Record the approval in the format given in `authoring/workflow.md` (`npm run digest -- <paths>`).
3. **Figma design and specification** (skill `ggb-figma`). Build masters and the specification page. **Stop: design gate.** Record file key, node IDs, evidence, approval. If no Figma tool is connected, record `artifacts.figma: "pending"` with the reason, continue to implementation, and leave the design gate open for a follow-up session (see `authoring/workflow.md`).
4. **Implementation** (skill `ggb-svelte`). Implementation, examples, SSR and browser tests, `npm run verify`, `npm run test:browser`, `npm run build:preview <id>`. **Stop: implementation gate.** Present the preview, exercise list and test/limitation summary. Record the approval with the source digests.
5. **Documentation** (skill `ggb-docs`). Page, index entry, `npm run build:svelte`. Optional editorial feedback is recorded, not a gate.
6. **Final consistency** (playbook: Final consistency). Update status (`phase: done` only when the definition of Done in `authoring/workflow.md` holds within the declared scope), evidence and the roadmap.

For a wave, run each phase for all components of the wave, then stop once at that gate with one grouped review. A component blocked on a decision does not block the others; record it and raise it at the gate.

## Between gates

Do not ask for routine choices; decide within `authoring/decisions.md`, record the choice in the status and list it in the next gate summary. Ask before the gate only if proceeding under any assumption would make the work useless.

## Output at each gate

Completed work, exact artifacts (paths, digests, Figma nodes, preview page), evidence, decisions taken, open questions, and the single decision you need from the reviewer.
