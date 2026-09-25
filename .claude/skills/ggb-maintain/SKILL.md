---
name: ggb-maintain
description: Modify an existing ggbrick component, token or Figma master (including Figma-to-source reconciliation and incompatible changes), audit consistency and readiness read-only, or deliver a version (package, Figma library, docs). Use for "change", "fix", "reconcile Figma", "audit", "release", "publish".
---

# Maintain

Read `AGENTS.md`, `authoring/decisions.md` and the status files of the affected scope. Then read only the procedure you need:

| Request                                                                                                            | Procedure                                                          |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Change a component, token, foundation or Figma master; reconcile a Figma edit into sources; incompatible evolution | `authoring/workflows/modify.md` (+ `templates/change-record.md`)   |
| Inspect consistency or readiness without changing anything                                                         | `authoring/workflows/audit.md` (+ `templates/audit-report.md`)     |
| Prepare or distribute a version                                                                                    | `authoring/workflows/deliver.md` (+ `templates/release-record.md`) |

## Modify

Identify the change and the baseline; analyze impact (consumers, contexts, API, docs, compatibility); update the authoritative source first; `npm run generate`; propagate what cannot be generated (Figma masters via `ggb-figma`, code via `ggb-svelte`, docs via `ggb-docs`); rerun checks proportionate to the risk; reopen only the affected gates (a shared token change needs a representative visual review of affected components); record old/new references, approvals retained or reopened, evidence and limitations in the status and a change record.

## Audit

Read-only. Use existing generators and validators (`npm run verify`, `npm run verify:generated`, `npm run validate -- --dependencies`) before adding checks. Classify each finding as confirmed divergence, justified adaptation, improvement or unverified. Propose a prioritized correction batch; corrections run through Modify only when authorized.

## Deliver

Scope the release; determine version and changelog under the adopted policy (propose one if none); build through the scripts (`npm run pack:svelte`, `npm run pack:tokens`, `npm run build`); verify consumption in an isolated project; inventory Figma publishing requirements; present exact artifacts, checks, limitations and destinations; **obtain authorization for each destination and version**; distribute; verify availability; record the release. Registry, Figma library and documentation site publication are distinct operations; a local build performs none of them.
