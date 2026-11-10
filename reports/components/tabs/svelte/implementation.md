# Tabs — Svelte implementation report

Component: `packages/svelte/src/components/tabs/` (Svelte 5.57.1, Bits UI 2.19.3: used since round 2). Dependencies: `icon`, `counter`, `badge`, `lib/roving-focus`. Review page: `examples/tabs/`; preview `dist/previews/tabs.html`. Implemented on 2026-11-09; implementation approved on 2026-11-10 (grouped wave 4 gate, round 5).

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

## Round 2 (2026-11-10)

Changes after the user's review: see the status decisionsTaken entries starting with "Round 2" and the pendingChanges entries (contract facts re-presented at the gate).

## Rounds 3 to 5 (2026-11-10)

- Round 3: appearance contained (default) and line; scroll buttons; see the status pendingChanges.
- Round 4: the list clips only while it scrolls, with room for the focus indicator and the selected tab's shadow; an empty slot takes no room; list surface `color.surface.inset`, selected tab `color.surface.overlay`.
- Round 5: contained tabs are separated by `listGap` (`space.content.xs`), so that a hovered tab and the selected tab never touch. The equal shares hold where the list has room; in a tight column a tab keeps its content width (browser test `contained (the default)`). Checked at 2× in light and dark, with hover next to the selected tab, keyboard focus, vertical orientation, the scrolling list and at 390 px.
