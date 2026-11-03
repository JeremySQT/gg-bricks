# Menu — Svelte implementation report

Component: `packages/svelte/src/components/menu/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon`, `shortcut`, `lib/overlay`. Review page: `examples/menu/`; preview `dist/previews/menu.html`. Implemented on 2026-11-03; implementation approval pending (grouped wave 3 gate).

## Notes

- Exports Menu, MenuItem, MenuSeparator and MenuGroup.
- The highlighted item is the focused item (roving focus through focus(), not aria-activedescendant); opening by pointer focuses the menu itself, so no item is highlighted until an arrow key or the pointer.
- The trigger opens the menu through popovertarget; ArrowDown and ArrowUp on the trigger open it on the first or last item; Enter or Space mark a keyboard opening.
- On opening, the panel is at least as wide as the trigger and never taller than the larger room above or below it.

## Checks (2026-11-03)

- `npm run verify`: passed (generate, lint, validate, unit tests 48, svelte-check 0 errors, SSR 86, build, docs build).
- Browser (Chromium 153, Playwright 1.63): `tests/browser/menu.spec.ts`, `tests/browser/overlays-smoke.spec.ts`; full suite run before the gate (see the status checks). The overlay smoke spec also runs in Firefox 155 and WebKit 26.6 (both support CSS anchor positioning and closedby natively; the measured fallback is covered in Chromium by the spike spec).
- SSR: 3 recorded checks (`tests/ssr/overlays.test.ts`).
- `computed.json`: 60 records.
- Preview: `dist/previews/menu.html` mounts from `file://` without errors.

## Fixed during implementation

- The group heading used item roles invisible to the group: group roles leadingSize and leadingGap were added to the contract.
- A long menu could overflow a short viewport: its height is limited to the larger room around the trigger, so it flips and scrolls.
