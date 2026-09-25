# Create a component

## Inputs

Read the decision register, component catalog, relevant existing contracts and target status. Use the most recently completed component as the example of artifact structure (before any exists, the archived reference kit at tag `reference-kit-2026-09` (commit cd0a2a2, always reachable in the branch history)), not as a universal behavior specification. Resolve the requested scope and actual dependencies before work.

## Procedure

1. **Scope.** State purpose, alternatives, supported use cases and exclusions. Separate reusable dependencies from explanatory fixtures. Group decisions that materially affect API or behavior.
2. **Contract.** Draft the minimal platform-independent JSON contract and justified token additions. Define intrinsic rules and state combinations; keep platform mechanics in adapter notes. Run schema and token-reference checks. Present the contract and record approval before design.
3. **Figma design.** Inspect the destination and existing resources. Build reusable masters with appropriate properties, slots, variable bindings and constraints. Explore the states and difficult cases that can affect construction. Present a concrete design review and record approval.
4. **Figma specifications.** Complete the specification template: Overview, Anatomy, Variants, States, Behavior & sizing, Usage examples. Distinguish explanatory instances from masters. Reconcile any approved source changes before implementation.
5. **Implementation and technical checks.** Use the target's conventions and existing primitives. Implement behavior, accessibility, composition and styling. Generate mechanical artifacts from sources. Check legal states, theme/density coverage, keyboard behavior, loading or other applicable transitions, and package imports. Prepare an interactive demo and state untested contexts.
6. **Implementation review — stop here.** Give the user the runnable demo, reviewed revision, brief exercise list and test/limitation summary. Ask them to assess actual behavior and feel: mouse/touch/keyboard as applicable, focus, feedback, transitions, animation timing and interruptions, and micro-interactions. Wait for approval before finalizing documentation. Apply feedback, reconcile affected sources/Figma, rerun affected checks and present changed behavior when needed. Preserve unaffected approvals.
7. **Documentation.** Document the approved implementation using the shared template. Keep one maintained usage source for humans and agents, an economical local index, accurate API facts and verified examples. List applicable accessibility criteria and actual evidence. An early outline is allowed; final content must describe approved behavior.
8. **Final consistency.** Check links, API examples, source/output parity and availability of required artifacts. Update status and record limitations. Hand off to Deliver when distribution is requested; do not silently publish.

## Outputs

Contract, token changes if needed, usable Figma component and specifications, target implementation, runnable examples, human/agent documentation, evidence and status. At a review gate, provide the complete review material and the exact decision needed; continue other independent authorized work when useful.

## Completion

The component is Done only when the shared definition of Done is met. A reviewed design or working demo alone is insufficient.
