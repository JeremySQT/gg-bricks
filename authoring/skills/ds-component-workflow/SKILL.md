---
name: ds-component-workflow
description: Coordinate creation, modification, audit or delivery in this design system, including Figma/source reconciliation and foundation changes. Use for DS authoring, not application screen assembly.
---

# DS component workflow

Locate the repository containing [the decision register](../../decisions.md). Keep this skill with its shared references. Read that register and the requested component's current status; do not load all component docs.

Follow [the lifecycle](../../workflow.md). Use [architecture](../../architecture.md) when resolving source ownership or paths.

1. Resolve the requested component and inspect actual artifacts, dependencies and recorded approvals. If no status exists, start from [the status template](../../templates/component-status.json); its format is proposed, and null never means approved.
2. Route to the requested procedure in the lifecycle: Create, Modify, Audit or Deliver. For creation, determine the earliest incomplete or invalidated phase. Audit is read-only unless corrections are requested.
3. For scope/contract work, follow [ds-component-contract](../ds-component-contract/SKILL.md). For Figma specifications use [the Figma template](../../templates/figma-specification.md); for documentation use [the documentation template](../../templates/component-documentation.md). For phase-specific execution, read only the relevant section of [the authoring playbook](../../authoring-playbook.md). Consult [the skill map](../../skills.md) for available entry points.
4. Complete authorized, unblocked work using existing conventions. Present contract and design for their agreed gates. After implementation and technical checks, present a runnable demo and wait for interaction/feel approval before finalizing documentation. For modifications, reopen only affected gates. Obtain delivery approval for the concrete release and destinations when not already authorized.
5. After each phase, record concrete artifacts, revision/digest references, evidence, decisions, approval provenance and the next action. Never manufacture approvals or silently mark stale work current.
6. Before Done, verify every completion condition in the lifecycle. Distinguish ready-to-review artifacts from published/usable outputs.

If a design changes a contract fact, reconcile the source and reassess affected approvals before implementing it. Routine choices within conventions do not require a new user decision. Do not expand a datepicker request into unrequested ranges, platforms or localization policies.

The pilot is evidence of token behavior, not a production component. Read [its limits](../../pilot-evidence.md) only when relying on it. External tool skills and authorization still apply; a workflow step does not grant publication permission.

Return a concise status: completed work, evidence, open decisions and next phase.
