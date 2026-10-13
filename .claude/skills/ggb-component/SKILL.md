---
name: ggb-component
description: Build one ggbrick component (or a whole roadmap wave) end to end - scope, contract, Svelte implementation with examples and tests, interactive review, Figma reproduction with parity check, documentation - stopping only at the contract, implementation and Figma parity gates. Use for "do the Button", "build InputText", "build wave 2".
---

# Build a component

Read `AGENTS.md`, `authoring/roadmap.md`, `authoring/decisions.md`, `authoring/workflow.md` (Create, Batch) and the component's notes in `authoring/component-catalog.md`. Phase details live in the chained skills; read each one when its phase starts.

## Prerequisites

- `foundations/tokens/status.json` must have `phase: "approved"` with non-null `approvals.primitives` and `approvals.semantic`. Otherwise answer with the blocker and the next step (`ggb-foundations`); create nothing.
- Dependencies declared for the component must have passed their implementation gate, or be planned in the same wave. A slot may accept a component that is not built yet (Button accepts `icon` before Icon exists): declare it in `dependencies`, use a local fixture in examples and tests, and note in the status that Done waits for that dependency. Fixtures used only in examples are not dependencies.
- If `foundations/components/<family>/<id>/status.json` exists, resume at the earliest incomplete or invalidated phase it records; do not redo approved phases.

## Phases and gates

Order: **contract → implementation → Figma parity → documentation**. The interactive implementation review is the design review: visuals come from approved tokens, and the reviewer judges the real rendering. Figma then reproduces the validated implementation and is checked for parity.

1. **Scope.** `npm run new:component -- <family> <id>` (family folder from `authoring/component-catalog.md`). Fill `status.json`: `wave` (from the roadmap), `scope` (purpose, use cases, exclusions, alternatives), `dependencies`, `fixtures`, `openDecisions`. Add the component row to the roadmap progress table.
2. **Contract** (skill `ggb-contract`). Draft `contract.json` and any token additions; `npm run validate`; `npm run build:tokens`. **Stop: contract gate.** Present the contract table (options, parts, states, events, rules, token roles), token additions, choices made, grouped questions. Record the approval (format in `authoring/workflow.md`, digests via `npm run digest -- <paths>`).
3. **Implementation** (skill `ggb-svelte`). Component folder, examples page, SSR and browser tests, `npm run verify`, `npm run test:browser`, `npm run build:preview <id>`. **Stop: implementation gate.** Present the preview page (publish it as an artifact when the reviewer is remote), the exercise list (mouse, touch, keyboard, focus, transitions, difficult cases) and the test/limitation summary. Apply feedback; a change to a contract fact returns to step 2 for that fact only. Record the approval with source digests.
4. **Figma parity** (skill `ggb-figma`). Reproduce the approved implementation as masters bound to variables, build the specification page, verify parity (computed values from the browser versus Figma resolution, all options and states). **Stop: Figma parity gate.** Present file and node links, screenshots and the parity report. If no Figma tool is connected, record `artifacts.figma: "pending"` with the reason, leave this gate open for a follow-up session, and continue.
5. **Documentation** (skill `ggb-docs`). Page, index entry, `npm run build:svelte`. Optional editorial feedback is recorded, not a gate.
6. **Final consistency.** Check links, API facts, `npm run verify:generated`, availability of every artifact the status references. Set `phase: done` only when the definition of Done in `authoring/workflow.md` holds within the declared scope. Update the status (phase, approvals, checks, decisions taken, open decisions, next action) and the roadmap.
7. **Pull request.** Push the branch and open one pull request to `main` with the repository template (gates, evidence, checks, what is left out). Do this once per component or wave, when the work is complete or when only the Figma parity gate is pending and stated as such. The user merges.

For a wave, run each phase for all components of the wave, then stop once at that gate with one grouped review. A component blocked on a decision does not block the others; record it and raise it at the gate.

## Between gates

Do not ask for routine choices; decide within `authoring/decisions.md`, record the choice under `decisionsTaken` in the status and list it in the next gate summary. Ask before a gate only if proceeding under any assumption would make the work useless.

## Output at each gate

Completed work, exact artifacts (paths, digests, Figma nodes, preview page), evidence, decisions taken, open questions, and the single decision needed from the reviewer, written in the user's language.
