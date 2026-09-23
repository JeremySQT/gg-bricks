# Minimal component contract

A contract is a compact, platform-independent description sufficient to preserve the component's identity and essential behavior across targets. It is not an implementation tutorial.

Use five substantive blocks:
- props: conceptual input options, types, allowed values and defaults.
- parts: structural parts and constrained composition points.
- states: relevant state axes and allowed combinations.
- tokens: visual roles mapped to token paths.
- rules: short English statements for intrinsic invariants not captured structurally.

An id field identifies the component. A concrete encoding and JSON Schema are now available for review in [contract-format.md](contract-format.md). The compact encoding was accepted during the design discussion. templates/component-contract.json remains an intentionally incomplete skeleton; complete its anatomy before schema validation.

## Boundaries

Keep CSS selectors, DOM events, Svelte snippets, ARIA attributes and Figma-specific property mechanisms in target adapters. Preserve the underlying requirements in the contract when essential: an accessible action name, one-line content, an activation constraint, or state precedence.

Put layout advice, selection guidance and explanatory prose in usage docs. Do not remove behavior essential to reconstructing the component merely to shorten the contract.

Parts are not automatically public properties. Distinguish a slot from the component it may contain. Specify allowed content and cardinality where needed. Do not represent every icon as a component variant.

Separate independent state axes. A validation result is not the same kind of state as hover, focus, disabled or readonly. Specify conflicting combinations only when they affect construction or behavior; do not invent a universal state precedence.

## Authoring procedure

1. Inspect adjacent approved contracts and the actual token inventory.
2. State purpose, alternatives and scope; find required existing subcomponents.
3. Identify product choices not determined by conventions and obtain a decision.
4. Draft the five blocks with clear defaults and legal content/state combinations.
5. Reference existing semantic roles; propose missing tokens separately with ownership and configuration coverage.
6. Review whether another target could implement the same component from these facts.
7. Run the agreed schema and semantic checks when available. Before a schema exists, report a manual structural review; JSON parsing alone is not contract validation.
8. Present a concise change summary and record approval for the exact reviewed revision.

Never approve your own draft. A pilot contract marked partial does not define the complete production component.
