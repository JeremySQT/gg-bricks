# Combobox — Svelte implementation report

Component: `packages/svelte/src/components/combobox/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon`, `lib/overlay`. Review page: `examples/combobox/`; preview `dist/previews/combobox.html`. Implemented on 2026-11-09; implementation approved on 2026-11-10 (grouped wave 4 gate, round 4).

## Notes

- Exports Combobox and the ComboboxOptionsRecord type.
- The empty state is a polite status kept in the panel; it takes no room while options match.
- `name` submits the value (not the text) through a hidden input.

## Decisions taken during implementation

- Bits UI Combobox is not used, for the same reasons as Select; the panel is a manual popover (focus stays in the input, presses outside and focus leaving are handled by the component).
- Filtering folds case and diacritics (Unicode NFD); filter none leaves the options to the application.

## Checks (2026-11-09)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 98, build, docs build).
- Browser (Chromium, Playwright 1.63): `tests/browser/combobox.spec.ts`, `tests/browser/overlays-smoke.spec.ts`; full suite run before the gate (see the status checks).
- SSR: `tests/ssr/choice.test.ts`.

## Round 2 (2026-11-10)

Changes after the user's review: see the status decisionsTaken entries starting with "Round 2" and the pendingChanges entries (contract facts re-presented at the gate).
