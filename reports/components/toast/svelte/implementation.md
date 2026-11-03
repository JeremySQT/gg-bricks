# Toast — Svelte implementation report

Component: `packages/svelte/src/components/toast/` (Svelte 5.57.1, Bits UI 2.19.3: not used). Dependencies: `icon`, `icon-button`, `button`, `lib/overlay`. Review page: `examples/toast/`; preview `dist/previews/toast.html`. Implemented on 2026-11-03; implementation approval pending (grouped wave 3 gate).

## Notes

- Exports ToastRegion (the region, root of the contract) and Toast (the item child).
- The region is a div with role region (not a section: an application's section styles moved it) shown as a manual popover in the top layer; it raises itself again whenever another overlay enters the top layer after it (a capture listener on toggle events).
- Platform limit: a modal dialog makes everything outside it inert, top layer included. A toast sent while a modal dialog is open is seen above the dialog but cannot be pressed, focused or announced until the dialog closes (checked in toast.spec.ts). The contract says the region stays above open dialogs; visually it does.
- The countdown is paused while the pointer is over the region, while focus is inside it, while the document is hidden and while the toast is queued (data-queued set by the region beyond max).
- Leaving uses a Svelte out transition (global) reading the motion tokens from CSS: the application removes the toast from the list, so a CSS exit transition has nothing to run on; under reduced motion it only fades. Entering uses @starting-style.

## Checks (2026-11-03)

- `npm run verify`: passed (generate, lint, validate, unit tests 48, svelte-check 0 errors, SSR 86, build, docs build).
- Browser (Chromium 153, Playwright 1.63): `tests/browser/toast.spec.ts`; full suite run before the gate (see the status checks). The overlay smoke spec also runs in Firefox 155 and WebKit 26.6 (both support CSS anchor positioning and closedby natively; the measured fallback is covered in Chromium by the spike spec).
- SSR: 3 recorded checks (`tests/ssr/alert-toast.test.ts`).
- `computed.json`: 36 records.
- Preview: `dist/previews/toast.html` mounts from `file://` without errors.

## Fixed during implementation

- Round 2: appearance neutral or intense, automatic single or multi line layout, centered; default countdowns 5 s, 8 s with an action, none for danger; closable; in intense, accent actions take the intent family. The browser tests use Playwright's clock for the default countdowns.

- The region was a section: a page rule on section margins moved it 48 px from the viewport edge; it is a div with role region.
- Title and description were p elements (same problem as Alert).
