# Textarea — Svelte implementation report

Component: `packages/svelte/src/components/textarea/` (Svelte 5.57.1; a native `<textarea>`). Review page: `examples/textarea/`; preview `dist/previews/textarea.html`. Implemented on 2026-10-26; implementation approval pending (grouped wave 2 gate).

## Structure

- `Textarea.svelte`: `<div class="ggb-textarea" data-size data-resize …>` (surface, inset border, ring, 44 px target) with the `<textarea class="ggb-textarea__input">`. Rows and maxRows reach CSS as `--_rows` and `--_max-rows`; rows are clamped to at least 1 and maxRows to at least rows. Resize auto measures `scrollHeight` after every value change (also when the application sets it) and the CSS limits clamp it between rows and maxRows; beyond, the content scrolls. Same Field protocol as InputText.
- `textarea.css`: block padding `(minHeight − 1lh) / 2`, so one row is exactly an InputText; `resize: vertical` or `none`; same `:where()` condition order as InputText.

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| Wraps, keeps line breaks, Enter adds a line | native | browser |
| Name from Field or label prop; placeholder never the name | as InputText | SSR, browser |
| Padding and one-row height of an InputText | `padding-inline`, derived block padding | browser: one row equals the InputText of the same size, text at the same place, 3 sizes in 3 densities |
| rows, resize vertical / auto / none, maxRows | CSS block size, native resize, measured auto height | browser: 3 rows, auto 2 to 5 rows then scroll and back to 2, none fixed, playground rows option |
| Colors, precedence, ring on every focus | as InputText | browser: 4 conditions in 18 contexts, hover, focus, invalid + focus in 4 contexts |
| Disabled, readonly, invalid, required | native attributes and `aria-invalid` | SSR, browser |

## Checks (2026-10-26)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors, SSR 64, build, docs build).
- Browser (Chromium 153, Playwright 1.63): full suite 102 passed, wave 1 included.
- Preview: `dist/previews/textarea.html` mounts from `file://` without errors.
- SSR: 3 Textarea tests. Browser: 6 Textarea tests. `computed.json`: 1 656 records.

## Limitations

- Resize auto measures with script after each change: a value changed while the textarea is hidden is measured at the next change.
- The native resize handle is drawn by the browser; it is hidden by `resize: none` for auto and none.
- Only Chromium is automated.

## Review round 1 (2026-10-27)

- Lighter border in light mode, as InputText (neutral.450).
