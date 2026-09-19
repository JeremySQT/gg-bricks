# Decision register

## Agreed

- Target ordinary business applications and SaaS, desktop and mobile. Basic marketing interfaces may reuse these foundations; bespoke art direction is outside the initial goal.
- The repo owns DTCG JSON tokens and compact JSON component contracts. Figma, target code and documentation derive from or conform to those sources.
- Tokens use primitive, semantic and, where justified, component layers. A theme assigns values to semantic roles; it is not an extra mandatory semantic hierarchy.
- Base is complete and usable alone. Brands are sparse overrides with matching filenames and token paths; no brand must invent a fixed count of primitive colors or spacing values.
- Every brand supports light and dark through inheritance or explicit values.
- Brand, appearance and density are independently selectable. Density values may differ by brand. Viewport adaptation is distinct from density.
- Three Figma collections, Brand / Appearance / Density, worked in the scalar-token pilot. Do not infer a tested viewport mapping or unlimited brand scalability.
- Spacing families are layout, content and control. Distinguish visible dimensions from interaction targets.
- Compact contracts use props, parts, states, tokens and rules. Keep essential intrinsic behavior in rules; platform adaptation belongs with each implementation.
- Figma and code must offer corresponding options. A Figma boolean property need not become a variant.
- Svelte is the intended first implementation target. Target-specific APIs must not enter the shared contract.
- Sources and rules use English. Reproducible transforms use Node scripts.
- Human documentation and local agent documentation share maintained content. An economical catalog leads agents to individual component sections.
- Documentation order: Overview, When to use, When not to use, Anatomy, Usage guidelines, Examples, API, Accessibility.
- Figma sections: Overview, Anatomy, Variants, States, Behavior & sizing, Usage examples. Master components are distinguished from explanatory instances.
- Lifecycle: scope, contract, design, specifications, implementation, documentation and delivery. Principal human approvals: contract, design, delivery.
- Done means usable in Figma and code with accessible, version-aligned human and agent documentation.
- Authoring skills live with the DS. Consumer instructions accompany the installed package.
- Define individual contracts as components are addressed; settle the shared catalog and conventions before expanding heavily.

## Recorded component direction, not final contracts

Button: accent / neutral / danger intentions; defaults accent, solid, md, content width. One-line label, ellipsis when constrained, full accessible name preserved. Leading icon; trailing icon, counter or shortcut. Loading uses an indicator without replacing the public label or changing geometry. Full states, token mappings and target API still need a complete contract review.

TextInput: distinguish disabled from readonly. Field owns surrounding label, help and validation presentation; a composed TextField can expose the common use case. Leading/trailing content and an integrated trailing action require explicit composition rules. Placeholder is absent by default. Validation is separate from interaction state. These are design directions, not a delivered implementation.

## Open decisions

1. Final component catalog, dependency graph and v1 scope.
2. Full semantic token inventory, names and values; viewport mapping; composite typography and motion exports.
3. Contract JSON Schema and exact representations of properties, events, slots and state combinations.
4. Svelte version, headless dependency strategy, package structure and target-specific conventions.
5. Testing tools and measurable accessibility / visual acceptance criteria.
6. Figma naming and page layout details, publishing mechanism, stable identity storage and migration policy.
7. Documentation engine, hosting, local package layout, version routing and discovery integration.
8. Definition of release units and versioning policy.
9. Exact approval/status schema and how Figma revisions are captured.

Resolve only decisions that block the current phase. Do not silently mark proposals as accepted.
