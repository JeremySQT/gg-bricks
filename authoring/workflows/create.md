# Create a component

The executable form of this procedure is the `ggb-component` skill; this page records the rationale and the checks of each step.

## Inputs

Read the decision register, the roadmap, the component catalog, relevant existing contracts and the target status. Use the most recently completed component as the example of artifact structure (before any exists, the archived reference kit), never as a universal behavior specification. Resolve the requested scope and actual dependencies before work.

## Steps

1. **Scope.** Purpose, alternatives, supported use cases and exclusions. Separate reusable dependencies from explanatory fixtures. Group decisions that materially affect API or behavior.
2. **Contract.** Minimal platform-independent JSON contract and justified token additions. Intrinsic rules and state combinations in the contract; platform mechanics in implementation notes. Schema, consistency and token-coverage checks pass. **Contract gate.**
3. **Implementation and technical checks.** Target conventions and existing primitives; behavior, accessibility, composition and styling; mechanical artifacts generated from sources. Legal states, theme/density coverage, keyboard behavior, transitions, package imports checked. Interactive example, SSR and browser tests, computed-value report, self-contained preview.
4. **Implementation review.** The reviewer exercises the real rendering: mouse, touch, keyboard, focus, feedback, transitions, difficult cases, and judges the visual result, which comes from approved tokens. Feedback is applied; a changed contract fact is reconciled in the source first. **Implementation gate.** This review replaces a separate design review.
5. **Figma parity.** Masters bound to variables reproduce the approved implementation; specification page from the template; parity report comparing Figma resolution with the browser's computed values for every option and state. **Figma parity gate.** When no Figma tool is connected, the phase is recorded as pending and completed in a later session.
6. **Documentation.** Shared template; one maintained source for humans and agents; economical index; accurate API facts and verified examples; applicable accessibility criteria with actual evidence.
7. **Final consistency.** Links, API examples, source/output parity, availability of required artifacts. Status and limitations updated. Hand off to Deliver when distribution is requested; never publish silently.

## Why implementation before Figma

Tokens already fix the visual language, and the reviewer judges the interactive rendering anyway. Reviewing once on the real component avoids a double visual review and lets Figma be built against validated, measurable values, which turns Figma construction into a reproducible parity task instead of an exploration.

## Outputs

Contract, token changes if needed, implementation, examples, tests and evidence, Figma masters and specification with a parity report, human/agent documentation, status. At a gate, provide the complete review material and the exact decision needed.

## Completion

The component is Done only when the shared definition of Done is met. A reviewed implementation or a Figma master alone is insufficient.
