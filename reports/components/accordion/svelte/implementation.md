# Accordion — Svelte implementation report

Component: `packages/svelte/src/components/accordion/` (Svelte 5.57.1, Bits UI 2.19.3: used since round 2). Dependencies: `icon`. Review page: `examples/accordion/`; preview `dist/previews/accordion.html`. Implemented on 2026-11-09; implementation approved on 2026-11-10 (grouped wave 4 gate, round 4).

## Notes

- Exports Accordion and AccordionItem.
- The focus ring is drawn inside the trigger (outline-offset of minus its width) so that it stays inside the accordion inline size, as the contract asks.
- A heading level outside 2 to 6 falls back to 3.

## Decisions taken during implementation

- Bits UI Accordion is not used: a native button in a heading and a region are enough, and the block-size animation is CSS (grid rows 0fr to 1fr, visibility switching at the end of a collapse).

## Checks (2026-11-09)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 98, build, docs build).
- Browser (Chromium, Playwright 1.63): `tests/browser/accordion.spec.ts`; full suite run before the gate (see the status checks).
- SSR: `tests/ssr/navigation.test.ts`.

## Round 2 (2026-11-10)

Changes after the user's review: see the status decisionsTaken entries starting with "Round 2" and the pendingChanges entries (contract facts re-presented at the gate).
