# DataField — Svelte implementation report

Component: `packages/svelte/src/components/data-field/` (Svelte 5.57.1, Bits UI not used (no native semantics to borrow)). Dependencies: none. Review page: `examples/data-field/`; preview `dist/previews/data-field.html`. Implemented on 2026-11-13 (wave 5).

## Notes

- Exports DataField and the type DataFieldProps.
- Horizontal layout without a container query (custom properties are not allowed in container conditions): a wrapping flex line where the label is min(100%, max(labelInlineSize, (2 × labelInlineSize − 100%) × 999)) wide, so it is labelInlineSize from twice that width and the whole line below; the value then wraps under it.
- Rich values are the `children` snippet; value is plain text.

## Decisions taken during implementation

- Svelte API: `children` replaces value; the group is named through aria-labelledby on the visible label.

## Checks (2026-11-13)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 104, build, docs build).
- Browser (Chromium): `tests/browser/data-field.spec.ts`, also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): passed.
- SSR: `tests/ssr/data-structure.test.ts`.
- Evidence: `reports/components/data-field/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
