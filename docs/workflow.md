# Authoring workflows

Read only the procedure needed for the task:

| Request | Procedure |
| --- | --- |
| Add a component | [Create](workflows/create.md) |
| Change a component, tokens, foundations or reconcile Figma | [Modify](workflows/modify.md) |
| Inspect consistency and readiness | [Audit](workflows/audit.md) |
| Prepare and distribute a version | [Deliver](workflows/deliver.md) |

## Shared operating rules

- Repository JSON tokens and compact contracts are authoritative. Reconcile an accepted Figma edit into those sources before propagating it.
- Use deterministic Node scripts for mechanical transformations. Design and implementation still require judgment; a compact contract cannot generate all behavior by itself.
- Preserve parity of options, anatomy, rules and results. Platform-specific implementation details stay in the relevant adapter.
- Check shared dependencies and resolved contexts before editing. Reuse existing primitives and semantic roles.
- Complete authorized routine work autonomously. Group consequential unresolved choices into one review.
- Record actual artifacts and evidence. A planned check is not a passed check; a missing capability is not proof of correctness.
- Preserve valid approvals. Invalidate only the affected scope when sources or outputs change.
- Publication needs authorization for its destination and version. A review approval is not publication authorization.

## Human review gates

Creation has three review gates: **contract**, **Figma design**, and **interactive implementation**. Delivery has a separate approval for the concrete release and intended destinations. Explicit approval already given in the session remains valid for its recorded scope.

Run technical checks before presenting the interactive implementation. Wait for the user's review of interactions and feel before finalizing documentation. Apply requested adjustments and recheck their impact; do not infer approval from passing tests.

For modifications, reopen only affected gates. Documentation-only corrections do not require design or interaction review. Shared token changes can affect many components and require a representative visual review.

## Definition of Done

All must hold within the declared supported scope:

- The Figma component is usable through the intended library, with exposed options and specifications.
- The code component is usable through the intended package and import path.
- Human documentation is consultable; local Markdown is a valid format when accepted as the delivery channel.
- Agent documentation is discoverable locally and matches the installed package version.
- Contract, tokens, Figma, implementation and documentation correspond.
- Relevant behavior, composition, accessibility and visual cases have evidence; limitations are explicit.
- Required approvals cover the delivered revisions and actual availability has been checked.

Distinguish reference-kit readiness, component completion and published release availability. An implementation example can be useful while release work remains open.

## Evidence and approval records

Use [the status template](../templates/component-status.json). Null means unrecorded. The optional documentation approval records editorial feedback when given; it is not an additional mandatory creation gate. Each approval records scope, provenance and identifiable artifacts (paths plus digests or commits; Figma nodes plus review/export evidence when available). Do not invent an immutable Figma revision, reviewer or timestamp. Historical conversational approvals may have weaker provenance; retain that limitation.

Read current status and relevant sources at task start. This is ordinary workflow entry, not a separate interruption-recovery procedure. Keep decisions and evidence together so a new agent can proceed without the conversation.
