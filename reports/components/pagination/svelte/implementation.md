# Pagination — Svelte implementation report

Component: `packages/svelte/src/components/pagination/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon-button`. Review page: `examples/pagination/`; preview `dist/previews/pagination.html`. Implemented on 2026-11-09; implementation approved on 2026-11-10 (grouped wave 4 gate, round 4).

## Notes

- Exports Pagination.
- The item algorithm lives in pages.ts with a unit test (tests/pagination-entries.test.ts) over every page of counts 1 to 40 and siblings 0 to 3.
- Previous and next reset the ButtonGroup size context (their size is the pagination size).

## Decisions taken during implementation

- Contract fact found during implementation: typography.numeral.{size} became typography.label.{size} (numeral.lg is 24 px), with tabular figures set by the component. Recorded in pendingChanges for the implementation gate.

## Checks (2026-11-09)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 98, build, docs build).
- Browser (Chromium, Playwright 1.63): `tests/browser/pagination.spec.ts`; full suite run before the gate (see the status checks).
- SSR: `tests/ssr/navigation.test.ts`.

## Round 2 (2026-11-10)

Changes after the user's review: see the status decisionsTaken entries starting with "Round 2" and the pendingChanges entries (contract facts re-presented at the gate).
