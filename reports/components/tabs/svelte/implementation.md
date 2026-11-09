# Tabs — Svelte implementation report

Component: `packages/svelte/src/components/tabs/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon`, `counter`, `badge`, `lib/roving-focus`. Review page: `examples/tabs/`; preview `dist/previews/tabs.html`. Implemented on 2026-11-09; implementation approval pending (grouped wave 4 gate).

## Notes

- Exports Tabs, TabsTrigger and TabsPanel.
- Panels stay mounted and are hidden with the hidden attribute (form state is kept).
- A panel without focusable content is a tab stop (tabindex 0), checked by a MutationObserver.
- A Counter or Badge in the trailing slot takes the size the application gives it (as in Button).

## Decisions taken during implementation

- Bits UI Tabs is not used: the roving focus is shared with Toolbar in one module (lib/roving-focus), which Bits UI Toolbar cannot apply to ggbrick Buttons, Menus and Popovers; one implementation keeps the two components identical. Recorded for the implementation gate.
- Svelte API: a `list` snippet holds the TabsTrigger children and `children` the TabsPanel children; triggers register in source order so that the fallback to the first enabled tab also works during server rendering (a value not registered yet is trusted until mount).

## Checks (2026-11-09)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 98, build, docs build).
- Browser (Chromium, Playwright 1.63): `tests/browser/tabs.spec.ts`; full suite run before the gate (see the status checks).
- SSR: `tests/ssr/tabs-toolbar.test.ts`.
