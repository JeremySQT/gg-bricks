# Table — Svelte implementation report

Component: `packages/svelte/src/components/table/` (Svelte 5.57.1, Bits UI not used (native table)). Dependencies: none. Review page: `examples/table/`; preview `dist/previews/table.html`. Implemented on 2026-11-13 (wave 5).

## Notes

- Exports Table, TableHeader, TableBody, TableFooter, TableRow, TableHeading and TableCell.
- The native caption is visually hidden and names the table; the visible caption above the frame is a copy hidden from assistive technology, so that it sits outside the frame.
- The frame and the focus indicator are drawn by ::after on a frame wrapper, above the scroll area and the sticky header; the scroll area clips the table to the rounded corners.
- Lines are inset box-shadows (rows keep minHeight whether they draw a line or not), replaced by borders in forced colors.
- The scroll area becomes role region, named by the caption, with tabindex 0, only while it overflows (ResizeObserver on the area and the table).
- The table is max-content wide with a minimum of 100%: columns keep their content on one line and the area scrolls.

## Decisions taken during implementation

- Svelte API: compound children as components (TableHeader, TableBody, TableFooter, TableRow, TableHeading, TableCell); align on cells and headings; rowHeader renders a th scope row.
- Contract amendments recorded in pendingChanges (paddingBlock, columns on one line).
- 2026-11-17 (user, Figma parity review): the table has no size; rows follow the density only (minHeight size.control.md: 32, 40, 44 px in compact, standard, comfortable). The size prop and data-size were removed; the review page shows the three densities.

## Checks (2026-11-13)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 104, build, docs build).
- Browser (Chromium): `tests/browser/table.spec.ts`, also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): passed.
- SSR: `tests/ssr/data-structure.test.ts`.
- Evidence: `reports/components/table/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
