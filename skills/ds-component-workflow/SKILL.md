---
name: ds-component-workflow
description: Coordinate or resume creation of a component in this design system, from scope and contract through Figma, Svelte, documentation and delivery. Use for DS authoring, not application screen assembly.
---

# DS component workflow

Locate the repository containing [the decision register](../../docs/decisions.md). Keep this skill with its shared references. Read that register and the requested component's current status; do not load all component docs.

Follow [the lifecycle](../../docs/workflow.md). Use [architecture](../../docs/architecture.md) when resolving source ownership or paths.

1. Resolve the requested component and inspect actual artifacts, dependencies and recorded approvals. If no status exists, start from [the status template](../../templates/component-status.json); its format is proposed, and null never means approved.
2. Determine the earliest incomplete or invalidated phase. Summarize that phase and any blocking product decisions.
3. For scope/contract work, follow [ds-component-contract](../ds-component-contract/SKILL.md). For Figma specifications use [the Figma template](../../templates/figma-specification.md); for documentation use [the documentation template](../../templates/component-documentation.md). Other specialized DS skills are planned, not available yet; consult [the skill map](../../docs/skills.md).
4. Complete authorized, unblocked work using existing conventions. Present contract, design and delivery for the agreed human gates when not already approved for that exact revision.
5. After each phase, record concrete artifacts, revision/digest references, evidence, decisions, approval provenance and the next action. Never manufacture approvals or silently mark stale work current.
6. Before Done, verify every completion condition in the lifecycle. Distinguish ready-to-review artifacts from published/usable outputs.

If a design changes a contract fact, reconcile the source and reassess affected approvals before implementing it. Routine choices within conventions do not require a new user decision. Do not expand a datepicker request into unrequested ranges, platforms or localization policies.

The pilot is evidence of token behavior, not a production component. Read [its limits](../../docs/pilot-evidence.md) only when relying on it. External tool skills and authorization still apply; a workflow step does not grant publication permission.

Return a concise status: completed work, evidence, open decisions and next phase.
