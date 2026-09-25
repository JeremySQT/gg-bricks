# Agent handoff

## Goal

Build the complete design system from this repository: Figma library, Svelte package and documentation, component by component through the recorded procedures. Button is the worked reference. The roadmap orders the work in waves; the user is consulted at the review gates and for the grouped open decisions.

## Start here

1. Read AGENTS.md, authoring/decisions.md and authoring/roadmap.md.
2. Identify the requested operation through authoring/workflow.md (Create, Modify, Audit, Deliver, or Batch for a wave); load only that procedure.
3. Read the target status and actual sources. Use authoring/authoring-playbook.md for the current phase.
4. Use Button as an example of artifact structure, not as a universal interaction model.

## Reference artifacts

| Need | Entry |
| --- | --- |
| Shared component contract | components/actions/button/contract.json |
| Tokens and contexts | foundations/tokens/ and foundations/config.json |
| Figma reference | components/actions/button/status.json, components/actions/button/figma-review.md and authoring/adapters/figma/README.md |
| Svelte implementation | packages/svelte/src/button/ |
| Interactive review | examples/button/ (`npm run dev`) or `npm run build:preview button` |
| Validated human/agent content | documentation/components/button.md |
| Local agent discovery | documentation/index.json and documentation/AGENTS.md |
| Existing verification evidence | reports/components/button/ and reports/tokens/ |
| Repository layout | authoring/repository-reference.md |
| Component scope and order | authoring/component-catalog.md and authoring/roadmap.md |

## What is established

- JSON-owned tokens and compact contracts; sparse brand overrides; independent appearance/density selection; no viewport token axis.
- Svelte/Bits UI reference implementation. CSS inheritance handles compatible slot foregrounds.
- Four authoring procedures plus batch authoring for waves, with contract, design and interactive implementation reviews; separate delivery approval.
- Generic tooling: contract validation, token resolution, CSS/type generation, contrast and coverage evidence for every discovered contract.
- One maintained documentation source with local agent discovery and an agreed editorial template.
- A working Button reference with automated evidence (unit, SSR, Chromium browser suite, packed-consumer check).

## Remaining reference/release work

| Item | Current fact | Next action when relevant |
| --- | --- | --- |
| Figma nested fixture properties | User reported missing public exposure; still open | Inspect current Figma and expose useful nested properties without changing source semantics |
| Icon/Counter/Shortcut | Examples/fixtures, not finished independent DS components | Wave 1 of the roadmap |
| Svelte slots | Allowed content is a contract rule; snippets do not enforce identity statically | Keep the limitation explicit; tighten only with an agreed API change |
| Typography and neutral hover | User noted soft-looking typography and subtle light hover; no requested adjustment | Review visually when the semantic inventory is extended in wave 1 |
| Accessibility/browser coverage | Chromium automation and SSR evidence exist | Complete relevant browser, assistive-technology, zoom/reflow/text-spacing checks for the declared release scope |
| Distribution | Local packages exist; no public publication | Choose destinations, version policy and support scope through Deliver |
| Documentation site | Content ready; Astro + Starlight proposed | Scaffold `apps/docs` once two or more components are documented |
| Figma reproducibility | Ledgers and reconstruction notes exist; not a turnkey generator | Inspect the current file before changes and preserve IDs |

## Example task: build wave 1

Read AGENTS.md. Follow Batch for the wave 1 components listed in the roadmap. Propose the foundation tokens the wave needs with the contracts. Stop for the contract gate with one grouped review. After design approval, implement, test and present the interactive review for all components of the wave; stop for the implementation gate before final documentation.

## Example task: apply a Figma edit

Follow Modify. Compare source, current Figma and last synchronized evidence. Separate instance overrides, adapter mechanics and shared changes. Update authoritative tokens/contract where warranted, run `npm run generate`, review changed behavior and then update documentation. Keep unchanged approvals.

## Example task: assess readiness

Follow Audit for a read-only assessment of the requested scope. Separate confirmed drift, justified adaptations and unverified checks. Do not turn an audit into an unsolicited redesign or release.
