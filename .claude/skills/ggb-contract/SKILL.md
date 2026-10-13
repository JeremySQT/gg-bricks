---
name: ggb-contract
description: Scope a ggbrick component and draft or revise its compact platform-independent JSON contract (props, parts, states, events, token roles, intrinsic rules) plus the token additions it needs, then validate it. Used by ggb-component before implementation; use directly when only the contract changes.
---

# Scope and contract

Read `authoring/contract-guide.md`, `authoring/contract-format.md`, the schema in `authoring/schemas/component-contract.schema.json`, the component status, adjacent contracts in `components/`, the component's notes in `authoring/component-catalog.md` and the resolved semantic inventory (`packages/tokens/resolved/base-light-standard.json`). `tests/fixtures/button.contract.json` shows the notation on a complete example; it is a format sample, not a ggbrick decision.

## Scope

State purpose, alternatives, supported use cases and exclusions in the status `scope` block. Separate reusable dependencies (other ggbrick components, listed in `dependencies`) from explanatory fixtures (`fixtures`). Apply the composition defaults of the catalog (entry controls are standalone; Field wraps them). Group the decisions that materially affect API or behavior in `openDecisions`; do not ask about routine choices covered by `authoring/decisions.md`.

## Contract

1. Draft the blocks in `foundations/components/<family>/<id>/contract.json`:
   - `props`: enum (`values` + `default`), boolean, string (`required` or `default`), number (`default`, optional `min`/`max`); `bindable: true` for two-way values. Conceptual options only; no DOM, Svelte or Figma mechanics.
   - `parts`: anatomy; `{}` for an internal part; `{ "accepts": [ids], "min", "max" }` for a slot or compound child.
   - `states`: observed or derived axes (interaction, validation…), names distinct from props.
   - `events`: conceptual outputs, `when` in English, optional `payload`.
   - `tokens`: role → semantic token path, parameterized with `{prop}` or `{state}` segments; role names follow the type convention. Never bind `primitive.*`.
   - `rules`: short English invariants another platform needs to rebuild the component (ordering, sizing, precedence, activation guards, accessible name). Required behavior is never deferred entirely to prose docs.
2. Reuse semantic roles. When a role is missing, add it to `foundations/tokens/base/semantic/*` with coverage in every context (and brand overlays if brands differ); list it at the gate as a foundation change.
3. `npm run validate` and `npm run build:tokens`. Fix every error; never manufacture tokens to satisfy the checker.
4. Check portability: could a non-Svelte target implement the same component from these facts? Move anything target-specific to `implementationNotes` in the status.
5. Update the status (`artifacts.contract` with digest, `openDecisions`, `decisionsTaken`) and hand back to `ggb-component` for the contract gate. Never approve your own draft.
