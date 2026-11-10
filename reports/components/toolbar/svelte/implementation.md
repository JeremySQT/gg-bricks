# Toolbar — Svelte implementation report

Component: `packages/svelte/src/components/toolbar/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `button`, `icon-button`, `menu`, `popover`, `tooltip`, `lib/roving-focus`. Review page: `examples/toolbar/`; preview `dist/previews/toolbar.html`. Implemented on 2026-11-09; implementation approved on 2026-11-10 (grouped wave 4 gate, round 4).

## Notes

- Exports Toolbar and ToolbarSeparator.
- The module writes tabindex on the items (one 0, others -1) and keeps it in sync with a MutationObserver.

## Decisions taken during implementation

- The toolbar size reaches its items through the ButtonGroup context key (ggb:button-group); Popover content resets it and Menu no longer does (gate question 4).
- Roving focus from lib/roving-focus: keys handled in the capture phase and only when they come from an item, so that a Menu trigger in a vertical toolbar moves focus instead of opening, and keys inside an open menu or popover stay with it.

## Checks (2026-11-09)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 98, build, docs build).
- Browser (Chromium, Playwright 1.63): `tests/browser/toolbar.spec.ts`; full suite run before the gate (see the status checks).
- SSR: `tests/ssr/tabs-toolbar.test.ts`.

## Round 2 (2026-11-10)

Changes after the user's review: see the status decisionsTaken entries starting with "Round 2" and the pendingChanges entries (contract facts re-presented at the gate).
