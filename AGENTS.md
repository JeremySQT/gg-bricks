# ggbrick authoring entry point

ggbrick is a design system delivered as a Figma library, a Svelte 5 package built on Bits UI, and documentation, all generated from or checked against JSON sources: DTCG tokens in `foundations/tokens` and one compact contract per component in `components/`. This file routes every authoring task. It is not the consumer guide (that ships in `documentation/`).

## Route the request

| Request | Do this |
| --- | --- |
| "Define / extend the foundations", primitives, palette, semantic tokens | Skill `ggb-foundations` |
| "Build / do / create <component>" (Button, InputText, Textarea…) or "build wave N" | Skill `ggb-component` (it chains `ggb-contract`, `ggb-figma`, `ggb-svelte`, `ggb-docs`) |
| Change an existing component, token or Figma master; reconcile Figma with sources | Skill `ggb-maintain`, procedure Modify |
| Check consistency or readiness without changing anything | Skill `ggb-maintain`, procedure Audit |
| Prepare or publish a version (package, Figma library, docs site) | Skill `ggb-maintain`, procedure Deliver |
| Documentation site, marketing site, theme builder, Figma plugin | See `authoring/roadmap.md`; these are products with their own tasks, not component work |

Skills live in `.claude/skills/<name>/SKILL.md`. Each one says which `authoring/` documents to read for the phase; read only those.

## Before any work

1. `authoring/decisions.md`: settled principles. Do not reopen them; record a new question in the relevant status file instead.
2. `authoring/roadmap.md`: waves, current wave, and what must be done before a component can start (foundations first).
3. `foundations/status.json` and, for a component, `components/<family>/<id>/status.json`. A missing status means the component has not started. `null` never means approved.

## Rules that apply everywhere

- Sources are authoritative and platform independent: tokens and contracts. Figma is the validated visual representation; Svelte is the target implementation. Change the source first, then regenerate (`npm run generate`), then reconcile outputs.
- Never hand-edit generated files (`packages/tokens/*`, `packages/svelte/src/*/*.generated.*`, `reports/**/*.json` written by tooling). Commit them together with the source change.
- Every component must be **self-contained and copyable**: `packages/svelte/src/<id>/` plus `tokens.css`, Bits UI and the internal dependencies its status declares are all a consumer needs. No other shared runtime code without a decision.
- Naming: package scope `@ggbrick/*`, CSS classes `ggb-<id>` and `ggb-<id>__<part>`, theme attributes `data-ggb-brand`, `data-ggb-appearance`, `data-ggb-density`, custom properties `--ggb-<token-path-with-dashes>`. English identifiers, rules and maintained docs; gate summaries and questions in the user's language.
- Human review gates are the only mandatory interruptions: foundations review; per component contract, Figma design and interactive implementation; delivery approval. Group every other consequential question and present it at the next gate. Complete routine, unblocked work autonomously and record the choices you made.
- A passing check is not an approval; an approval covers exactly the recorded revision and scope. Record evidence paths and digests in status files.
- Publication (npm, Figma library, site) needs explicit authorization for that destination and version. Never modify Figma objects the design system does not own.
- Until a ggbrick component is done, the archived kit shows the artifact structure; afterwards the most recently completed component is the example. Use the deterministic scripts in `tooling/`. Extend them generically; no component-specific branches in shared tooling.
- The pre-ggbrick reference kit is archived at git tag `reference-kit-2026-09` (commit cd0a2a2, always reachable in the branch history). Consult it only when a skill says so; nothing from it is a decision for ggbrick.

Finish every batch with `npm run verify`, updated status files, and a concise summary: completed work, evidence, open decisions, next phase.
