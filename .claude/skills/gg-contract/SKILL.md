---
name: gg-contract
description: Draft or revise the compact platform-independent JSON contract of a ggbrick component (props, parts, states, token roles, intrinsic rules) and the token additions it needs, then validate it. Used by gg-component before design; use directly when only the contract changes.
---

# Component contract

Read `authoring/contract-guide.md`, `authoring/contract-format.md`, the schema in `authoring/schemas/component-contract.schema.json`, the component status, adjacent contracts in `components/` and the resolved semantic inventory (`packages/tokens/resolved/base-light-standard.json`). `tests/fixtures/button.contract.json` shows the notation on a complete example; it is a format sample, not a ggbrick decision.

1. Confirm the scope recorded in the status; ask only about consequential choices not covered by `authoring/decisions.md`, and group them for the gate.
2. Draft the five blocks in `components/<family>/<id>/contract.json`:
   - `props`: enum (`values` + `default`), boolean (`type` + `default`), string (`type`, `required` or `default`). Conceptual options only; no DOM, Svelte or Figma mechanics.
   - `parts`: anatomy; `{}` for an internal part; `{ "accepts": [ids], "max": n }` for a slot limited to component ids.
   - `states`: observed or derived axes (interaction, validation…), distinct names from props.
   - `tokens`: role → semantic token path, parameterized with `{prop}` or `{state}` segments; role names follow the type convention (`surface`/`content`/`border`/`*Color` colors, `typography*`, others dimensions). Never bind `primitive.*`.
   - `rules`: short English invariants that another platform needs to rebuild the component (ordering, sizing, precedence, activation guards, accessible name).
3. Reuse semantic roles. When a role is missing, add it to `foundations/tokens/base/semantic/*` with coverage in every context (and brand overlays if the brands differ); this is a foundation change to list at the gate.
4. `npm run validate` and `npm run build:tokens`. Fix every error; do not manufacture tokens to satisfy the checker.
5. Check portability: could a non-Svelte target implement the same component from these facts? Move anything target-specific to the implementation notes in the status.
6. Update the status (`artifacts.contract` with digest, `openDecisions`) and hand back to `gg-component` for the contract gate. Never approve your own draft.
