# Audit design-system consistency

## Scope

Record the components, source revision, target implementation, Figma references and variation contexts examined. Audit is read-only by default. User-authorized fixes follow Modify; do not silently repair findings during an inspection.

## Checks

| Area | Inspect |
| --- | --- |
| Sources | Schema validity, alias resolution, cycles, types, coverage after sparse overrides, unnecessary duplicate roles |
| Contract | Props, defaults, parts, legal content, states, intrinsic rules and token bindings |
| Figma | Public options and nested properties, variable bindings, layout/overflow, state representations, master versus fixture roles |
| Implementation | Actual API, state transitions, slot constraints, target semantics, visual result and shared dependency usage |
| Accessibility | Relevant keyboard/focus/naming/contrast behavior, applicable criteria, manual versus automated evidence |
| Parity | Same public capabilities and intrinsic behavior; justified target differences documented |
| Documentation | Current examples, API, alternative selection guidance, links, local discoverability and version alignment |
| Distribution | Installability/imports, exposed package docs, usable Figma entry point and declared delivery channels |

Use existing generators and validators before adding new checks. Expand testing only to resolve a specific risk. Browser screenshots do not prove assistive-technology behavior; token contrast does not prove every rendered context.

## Findings

Use [the audit report](../../templates/audit-report.md). Each finding gives location, expected versus observed result, user/agent impact, severity, evidence and recommended correction.

Classify each item as confirmed divergence, justified adaptation, improvement or unverified. Do not report unverified behavior as a defect or a pass. Severity is relative to the declared goal: a reference-kit limitation may still block a production release.

## Outputs

A bounded report with checks performed, findings and remaining uncertainties. Provide a prioritized correction batch. Complete corrections only when authorized and record fresh evidence separately.
