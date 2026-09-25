# Authoring workflows

The skills in `.claude/skills/` are the executable form of these procedures; the documents here give the rationale and the details. Where wording differs, the skill's phase order wins and the procedure supplies the checks. Read only the procedure needed for the task:

| Request | Procedure |
| --- | --- |
| Add a component | [Create](workflows/create.md) |
| Change a component, tokens, foundations or reconcile Figma | [Modify](workflows/modify.md) |
| Inspect consistency and readiness | [Audit](workflows/audit.md) |
| Prepare and distribute a version | [Deliver](workflows/deliver.md) |
| Build a whole wave of components with grouped gates | [Batch](#batch-authoring) below, applying Create per component |

## Batch authoring

The roadmap groups components into waves so that the user is interrupted only at gates. The `gg-component` skill runs it. For a wave:

1. **Scope and contracts.** Follow Create steps 1–2 for every component of the wave, including the foundation tokens the wave needs. Run `npm run validate`. Present one contract review: a table per component (options, parts, states, rules), the token additions, the decisions taken within conventions and the grouped open questions. Stop for the contract gate.
2. **Figma design.** Follow Create steps 3–4 for every component. Present one design review with file/node references. Stop for the design gate.
3. **Implementation.** Follow Create step 5 for every component: `packages/svelte/src/<id>/`, `examples/<id>/`, SSR and browser tests, `npm run verify`. Present one implementation review: the review app or `dist/previews/<id>.html` pages, an exercise list per component, and the test/limitation summary. Stop for the implementation gate.
4. **Documentation and consistency.** Create steps 7–8 for every component. Update `documentation/index.json`, statuses and evidence. Hand off to Deliver when a release is requested.

A component that blocks on a decision does not block the wave: record the decision in its status, continue the others, and raise it at the next gate. Between gates, do not ask for routine choices; record them and present them in the gate summary.

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

An approval entry in a status file has this shape:

```json
{
  "scope": "what exactly was approved",
  "revision": { "paths": ["components/forms/textarea/contract.json"], "sha256": { "components/forms/textarea/contract.json": "…" } },
  "provenance": "who approved, where (session, comment, review), when",
  "note": "limits of the approval, if any"
}
```

Digests come from `npm run digest -- <paths>`. Figma approvals record file key, node IDs and the evidence files instead of digests. An approval is invalidated when any listed path changes; record the change and re-present only the affected gate.

Artifacts, identifiers and maintained documents are in English. Gate summaries and questions are written in the user's language.

A request that cannot start (a pending gate, a missing dependency) is answered with the blocker and the next step; it creates no status file and does not change the roadmap.

When no Figma tool is connected in the session, a component may continue to implementation after the contract gate: record `artifacts.figma: "pending"` and the reason in the status, keep the design gate open, and the design phase runs as a follow-up task in a session with Figma. The implementation gate still takes place; documentation waits for both gates.


Use [the status template](templates/component-status.json). Null means unrecorded. The optional documentation approval records editorial feedback when given; it is not an additional mandatory creation gate. Each approval records scope, provenance and identifiable artifacts (paths plus digests or commits; Figma nodes plus review/export evidence when available). Do not invent an immutable Figma revision, reviewer or timestamp. Historical conversational approvals may have weaker provenance; retain that limitation.

Read current status and relevant sources at task start. This is ordinary workflow entry, not a separate interruption-recovery procedure. Keep decisions and evidence together so a new agent can proceed without the conversation.
