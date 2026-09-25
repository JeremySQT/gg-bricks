# Agent handoff

## Goal

Use this kit to establish an AI-authorable, portable design system. Button is the worked reference. Do not implement the entire catalog, redesign the visual language or migrate the repository as an implied next step.

## Start here

1. Read AGENTS.md and docs/decisions.md.
2. Identify the requested operation through docs/workflow.md; load only that procedure.
3. Read the target status and actual sources. Use docs/authoring-playbook.md for the current phase.
4. Use Button as an example of artifact structure, not as a universal interaction model.

## Reference artifacts

| Need | Entry |
| --- | --- |
| Shared component contract | contracts/actions/button.contract.json |
| Tokens and contexts | tokens/ and config.json |
| Figma reference | components/button/status.json and adapters/figma/README.md |
| Svelte implementation | packages/svelte/src/button/ |
| Interactive review | examples/button/App.svelte and button-preview.html |
| Validated human/agent content | packages/svelte/docs/button.md |
| Local agent discovery | packages/svelte/docs/index.json and packages/svelte/docs/AGENTS.md |
| Existing verification evidence | reports/ and reports/svelte/ |
| Future repository integration | docs/repository-reference.md |
| Proposed component scope | docs/component-catalog.md |

## What is established

- JSON-owned tokens and compact contracts; sparse brand overrides; independent appearance/density selection; no viewport token axis.
- Svelte/Bits UI reference implementation. CSS inheritance handles compatible slot foregrounds.
- Four authoring procedures with contract, design and interactive implementation reviews; separate delivery approval.
- One maintained documentation source with local agent discovery and an agreed editorial template.
- A working Button reference and prior automated evidence. User reviewed the demo and validated the revised documentation; acceptance scope is recorded in status.

## Remaining reference/release work

| Item | Current fact | Next action when relevant |
| --- | --- | --- |
| Figma nested fixture properties | User reported missing public exposure; still open | Inspect current Figma and expose useful nested properties without changing source semantics |
| Icon/Counter/Shortcut | Examples/fixtures, not finished independent DS components | Scope their contracts before offering them as public reusable dependencies |
| Svelte slots | Allowed content is a contract rule; snippets do not enforce identity statically | Keep the limitation explicit; tighten only with an agreed API change |
| Typography and neutral hover | User noted soft-looking typography and subtle light hover; no requested adjustment | Review visually if revisiting foundations; do not silently change tokens |
| Accessibility/browser coverage | Chromium automation and SSR evidence exist | Complete relevant browser, assistive-technology, zoom/reflow/text-spacing checks for the declared release scope |
| Distribution | Local package/docs/demo exist; no public publication established | Choose destinations, version policy and support scope through Deliver |
| Documentation site | Content ready, engine/hosting undecided | Choose when a hosted site is needed; local docs already work |
| Figma reproducibility | Ledgers and reconstruction notes exist; not a universal turnkey component generator | Inspect current file before changes and preserve IDs; do not promise full deterministic Figma regeneration |

These items do not require building a second large component to make the architecture useful. Do not label the Button production release Done while applicable completion items remain unresolved.

## Example task: add a DatePicker

Read AGENTS.md. Follow Create for DatePicker, using Button only as the reference format. Inspect existing tokens and primitives, identify dependencies, propose the smallest useful contract and group unresolved choices. Stop for contract review. After design approval, implement and test an interactive example; stop for implementation review before final documentation. Do not assume ranges, multiple calendars, localization rules or a particular date model without resolving their scope.

## Example task: apply a Figma edit

Follow Modify. Compare source, current Figma and last synchronized evidence. Separate instance overrides, adapter mechanics and shared changes. Update authoritative tokens/contract where warranted, propagate affected outputs, review changed behavior and then update documentation. Keep unchanged approvals.

## Example task: assess readiness

Follow Audit for a read-only assessment of the requested scope. Separate confirmed drift, justified adaptations and unverified checks. Do not turn an audit into an unsolicited redesign or release.
