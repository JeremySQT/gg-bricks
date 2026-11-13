# Divider — Svelte implementation report

Component: `packages/svelte/src/components/divider/` (Svelte 5.57.1, Bits UI 2.19.3 (Separator: role, orientation, decorative)). Dependencies: none. Review page: `examples/divider/`; preview `dist/previews/divider.html`. Implemented on 2026-11-13 (wave 5).

## Notes

- Exports Divider and the type DividerProps.
- The line is a border (painted by the system in forced colors); a labeled divider draws its two lines with ::before and ::after.
- A vertical divider is an inline-block of 1lh minimum, stretched by a flex row (align-self: stretch).

## Decisions taken during implementation

- None beyond the contract.

## Checks (2026-11-13)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 104, build, docs build).
- Browser (Chromium): `tests/browser/divider.spec.ts`, also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): passed.
- SSR: `tests/ssr/data-structure.test.ts`.
- Evidence: `reports/components/divider/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
