# Breadcrumb — Svelte implementation report

Component: `packages/svelte/src/components/breadcrumb/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon`, `icon-button`, `menu`. Review page: `examples/breadcrumb/`; preview `dist/previews/breadcrumb.html`. Implemented on 2026-11-09; implementation approval pending (grouped wave 4 gate).

## Notes

- Exports Breadcrumb and the BreadcrumbItem type.
- An ancestor keeps 4em of label before its ellipsis; the full label is set as title when truncated.

## Decisions taken during implementation

- Svelte API: the items are an `items` array (label, href) with a `leading` snippet receiving the item and its index, instead of child components, so that the current page (last item) and the collapsed items are known during server rendering. The contract child item is unchanged. Recorded for the implementation gate.
- The slash separator is drawn on the 256-unit grid (Phosphor has no slash glyph); the chevron is Phosphor caret-right.

## Checks (2026-11-09)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 98, build, docs build).
- Browser (Chromium, Playwright 1.63): `tests/browser/breadcrumb.spec.ts`; full suite run before the gate (see the status checks).
- SSR: `tests/ssr/navigation.test.ts`.
