# InputText — Svelte implementation report

Component: `packages/svelte/src/components/input-text/` (Svelte 5.57.1; a native `<input>`: Bits UI has no text input primitive). Review page: `examples/input-text/`; preview `dist/previews/input-text.html`. Implemented on 2026-10-26; implementation approval pending (grouped wave 2 gate).

## Structure

- `InputText.svelte`: `<div class="ggb-input-text" data-size data-disabled data-readonly data-invalid data-action>` (the container: surface, inset border, focus ring, 44 px target through `::before`), optional `ggb-input-text__leading` and `ggb-input-text__trailing` (`aria-hidden` icons), the `<input class="ggb-input-text__input">`, and `ggb-input-text__action`. Native attributes (`id`, `name`, `autocomplete`, `inputmode`, `oninput`…) go to the input, `class` to the container; `value` and `ref` bindable; `onvaluechange` on user edits only.
- Trailing part: two snippet props, `trailing` (decorative icon) and `action` (an IconButton). `action` receives `{ size, intent: 'neutral', appearance: 'ghost', disabled }` with the next smaller size (sm in md, md in lg) to spread on an IconButton: InputText does not import IconButton and IconButton reads no context, so both folders stay self-contained. At sm the action is not rendered and a warning is logged. The action wrapper is a square as tall as the field with the IconButton centered, so the end inset equals the block inset.
- `input-text.css`: structure only. Conditions are written with `:where()` so that every condition selector has the same specificity and source order is the precedence (disabled, readonly, invalid, focus, hover). Focus is `:has(input:focus)`: the ring shows on every focus of the input, not while the action is focused.

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| leading, input, trailing; one line, scrolls inline | flex row; native input | screenshots, long value case |
| Name from Field or label prop, required; placeholder never the name | `aria-labelledby`/`for` from the field, else `aria-label`; error on a missing name | SSR rejection; browser names through CDP |
| Button spacing, optical icon placement | `padding-inline: edgeInline`, input `padding-inline: textInline`, slots `slotInline`, svg `margin-inline: -iconSize/8` | browser: icon drawing at edge + slot, text at padding-inline, in 3 densities |
| Fills the inline size; block size minHeight; 44 px target | `inline-size: 100%`, `block-size`, `::before` | browser: same height and top as the Button beside it; presses 21 px above and below an sm input focus it |
| Colors per condition; precedence; invalid keeps its border while focused | custom properties per condition | browser: 4 conditions in 18 contexts, hover, focus, invalid + focus, readonly + focus in 4 contexts |
| Focus ring on every focus | outline on the container | browser ring values |
| Disabled / readonly behavior | native attributes | browser: readonly focusable not editable, disabled skipped |
| Invalid and required exposed | `aria-invalid`, `required` | browser (CDP) |
| type | native type | SSR 18 combinations; show-password example |
| valueChange on user edits only | `oninput` | browser edit count |
| Trailing IconButton at md and lg | `action` snippet | browser: box size.control of the smaller size, equal insets in 3 densities, separate tab stop, absent at sm, disabled with the input, enabled when readonly |
| Transitions, reduced motion, forced colors | CSS | browser |

## Checks (2026-10-26)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors, SSR 64, build, docs build).
- Browser (Chromium 153, Playwright 1.63): full suite 102 passed, wave 1 included.
- Preview: `dist/previews/input-text.html` mounts from `file://` without errors.
- SSR: 5 InputText tests. Browser: 7 InputText tests. `computed.json`: 1 656 records (3 sizes and 4 conditions in 18 contexts, hover and focus states in 4 contexts).

## Fixed during implementation

- With an id of its own inside a Field, the input had no accessible name (the label's `for` targeted the field's default id; axe flagged the password and coupon examples). Text entries now register their element id with the Field and are also named through `aria-labelledby`.
- Condition selectors had different specificities (`:hover`, `:has()` beat `[data-invalid]`); all are wrapped in `:where()`.

## Limitations

- The action's icon is one size smaller than a decorative icon of the same field (16 px beside 20 px in md): a consequence of the imposed IconButton size; to judge at the review.
- At compact density the action of an md field sits 2 px from the field edge: its focus ring touches the field border.
- Autofill colors are overridden with an inset shadow in the field surface (Chromium); other engines not checked.
- Only Chromium is automated.
