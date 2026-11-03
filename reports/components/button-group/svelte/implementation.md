# ButtonGroup — Svelte implementation report

Component: `packages/svelte/src/components/button-group/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `button`, `icon-button`. Review page: `examples/button-group/`; preview `dist/previews/button-group.html`. Implemented on 2026-11-03; implementation approval pending (grouped wave 3 gate).

## Notes

- Button and IconButton read the group size through the context key ggb:button-group (a string; each folder declares the shape again), so an item's own size is ignored inside a group.
- A host (Alert) may ask for a default size through the context key ggb:button-group-host; an explicit size on the group wins.
- reflow stack: a ResizeObserver compares the extent of the items (first start edge to last end edge, whatever the alignment) with the inline size, stacks the group and remembers that extent to return to the line. In the horizontal layout items never shrink below their content.
- Overlays (Popover, Dialog, Menu) clear the ggb:button-group context for their content, so that a group around their declaration does not size their buttons.

## Checks (2026-11-03)

- `npm run verify`: passed (generate, lint, validate, unit tests 48, svelte-check 0 errors, SSR 86, build, docs build).
- Browser (Chromium 153, Playwright 1.63): `tests/browser/button-group.spec.ts`; full suite run before the gate (see the status checks).
- SSR: 4 recorded checks (`tests/ssr/button-group.test.ts`).
- `computed.json`: 216 records.
- Preview: `dist/previews/button-group.html` mounts from `file://` without errors.

## Fixed during implementation

- Round 2 (user feedback): vertical groups stretch their Buttons (IconButtons stay square at the start); the reflow prop and wrapping are removed, a line that does not fit stacks.

- reflow stack first compared scrollWidth with clientWidth, which misses an overflow towards the inline start (end alignment): it now compares the extent of the items.
- The measuring effect read and wrote its own state (an update loop): the measure runs untracked.
