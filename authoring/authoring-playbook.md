# Phase execution playbook

Use the workflow router first. Read only the phase needed. Button supplies concrete artifacts; its behavior and Figma workaround are not defaults for every component.

## Contract and tokens

Follow the contract skill and guide. Inspect actual sources before introducing roles. Keep props, parts, states, tokens and intrinsic rules compact and platform-independent. Required behavior must not be deferred entirely to prose docs. Define new contracts as components are addressed, after resolving scope; do not pre-author an entire catalog speculatively.

Use tokens/base plus sparse brand overlays with the same file/token names. Resolve aliases after merging; validate coverage across configured brand, appearance and density contexts. No desktop/mobile token axis exists. Layout selects composition and explicit component options without rewriting token definitions.

Button examples: components/actions/button/contract.json and foundations/tokens/base/semantic/. Commands: npm run validate, npm test, npm run generate. Validation and generation cover every discovered contract; a new contract is picked up as soon as components/<family>/<id>/contract.json exists.

## Figma design and specifications

Use current Figma tool instructions. Inspect existing pages, variables, masters and ledgers before changes. Preserve IDs when possible and distinguish review instances from production masters. Choose variants, booleans, text properties and instance swaps according to their meaning; do not multiply variants for every optional child.

Expose useful nested properties through the public component. Check repeated instance swaps, default content, empty optional content, long labels, constraints and inheritance across supported contexts. Complete authoring/templates/figma-specification.md after design review. Store precise file/node references and review evidence; never manufacture an immutable revision.

Use authoring/adapters/figma/README.md for the tested token mapping. Button's private slot-color context collections solve a Figma limitation; they are not source tokens, new public axes or required code layers. A different component must justify any equivalent workaround. Figma changes enter Modify for source reconciliation.

## Svelte implementation

Inspect packages/svelte/src/button, its tests and package exports. Use the installed/pinned Svelte and Bits UI versions as the initial reference. For a new component, verify the relevant primitive's actual API and behavior before relying on it; Button.Root does not specify a datepicker.

Separate shared requirements from native semantics and target-specific API. Prefer platform behavior and existing accessible primitives. Reproduce anatomy and public options without copying Figma-only nesting. Use inherited content color/currentColor for compatible children. Document actual snippet restrictions; do not claim static identity enforcement where none exists.

Derive token/type output through Node scripts. Keep handwritten behavior in implementation files. Provide executable normal and difficult cases, actual keyboard/focus behavior and relevant loading/disabled/validation combinations. Test motion interruptions and reduced-motion behavior where motion exists. Do not inherit Button's 900 ms spinner timing as a system rule.

Use npm run verify (generate, validate, test, check, ssr, build) and npm run test:browser when relevant to changed code; browser installation may be required. Add tests/ssr/<id>.test.mjs, tests/browser/<id>.spec.ts and examples/<id>/ for each new component; existing tests are Button-specific and do not count as its coverage.

Prepare the runnable review and wait for implementation approval before final documentation. Code changes that alter contract facts return to source reconciliation.

## Documentation

Use authoring/templates/component-documentation.md and the validated documentation/components/button.md. Keep purpose and choice guidance human-readable. Put platform mechanics in API. Anatomy explains construction and slots; API explains what callers can configure. Usage guidelines precede examples.

Maintain one source for human and local agent docs. Ship per-component pages and a compact index with the installed package. Update documentation/index.json (checked by npm run build:svelte) and verify real imports/examples. Include text equivalents for visuals. An agent should find a component through the index, read its guidance, then consult API only as needed.

Relevant accessibility criteria require their number, name, level, official link and actual relationship to the component. Separate component behavior, application responsibilities, tested coverage and unverified cases. Do not infer conformance from axe or token contrast alone.

## Validation and availability

Choose checks from the changed risk and declared support. Preserve revision-linked evidence. Test a packed artifact in an isolated consumer when changing exports or distribution. Confirm Figma public property access, not only internal master structure. Distinguish installable local artifacts from public registry publication.

Use Audit for a read-only assessment and Deliver for a concrete release. The root status record tracks authoring evidence; consumer docs must stay focused on use.
