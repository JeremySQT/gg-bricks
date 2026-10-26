# Field — Svelte implementation report

Component: `packages/svelte/src/components/field/` (Svelte 5.57.1; no Bits UI primitive: Field adds a label, texts and links around the control, which owns the native semantics). Review page: `examples/field/`; preview `dist/previews/field.html`. Implemented on 2026-10-26 against the approved contract; implementation approval pending (grouped wave 2 gate).

## Structure

- `Field.svelte`: `<div class="ggb-field">` holding `ggb-field__label` (a `<label>`, with `ggb-field__requiredIndicator`, an `aria-hidden` non-breaking space and asterisk), `ggb-field__description`, `ggb-field__control` (the children snippet) and `ggb-field__message` (the Phosphor warning-circle glyph inline, `aria-hidden`, then `ggb-field__messageText`). `div`s rather than `p`s so that an application's paragraph styles cannot move them.
- Context protocol `ggb:field` (a string key, so that no component folder imports another): `controlId`, `labelId`, `describedBy` (description id then message id while shown), `required`, `invalid`, `disabled`, `register(kind, id?)`. Each control declares the same shape locally. A text entry registers its element id: the label's `for` follows the control, even with an id of its own. Every control is also named through `aria-labelledby`, which holds before hydration and with a custom id. A choice control registers as `choice`: the label loses `for`; a Checkbox wraps itself in `role="group"` named by the field label; a RadioGroup is named by it.
- `field.css`: structure only; `1lh` centers the message icon on the first line; the icon box overlaps the start and the gap by 1/8 (optical placement).

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| Order label, description, control, message; gaps | markup order; `margin-block-start` from `descriptionGap`, `controlGap`, `messageGap` | SSR order; browser gaps in 3 densities |
| Label names a text entry and focuses it; names a radio group; names the question of a checkbox | `for` + `aria-labelledby`; radiogroup `aria-labelledby`; checkbox group wrapper | browser (CDP) names for the four controls, label press focuses the input and does not toggle the checkbox |
| Description then message describe the control | `describedBy` from the context, joined with the control's own | browser descriptions; SSR order of ids |
| Passes required, invalid, disabled | controls OR the field values with their own | SSR and browser |
| Required asterisk hidden from AT | `aria-hidden` span | SSR; browser |
| Message only while invalid and non-empty, with the icon | conditional block | SSR three cases; browser form section |
| Disabled dims label, asterisk, description | `[data-disabled]` | computed colors in 18 contexts |
| Fixed typography; gaps follow density | `typography.label.md`, `typography.body.sm`; `space.content.*` | browser 3 densities and control sizes |
| Never validates or moves focus | no logic | example form validates in the page |
| Forced colors | system text colors, GrayText when disabled | browser forced-colors screenshot |

## Checks (2026-10-26)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors, SSR 64, build, docs build).
- Browser (Chromium 153, Playwright 1.63): full suite 102 passed, wave 1 included.
- Preview: `dist/previews/field.html` mounts from `file://` without errors.
- SSR: 7 Field tests (`ssr.json`). Browser: 6 Field tests (names and descriptions through CDP for the four controls, state pass-through, form section, gaps and typography in 3 densities, colors in 18 contexts, forced colors, axe light and dark with the form submitted, 390 px). `computed.json`: 504 records.

## Limitations

- Server rendering writes the label before the control registers: around a Checkbox or a RadioGroup the server markup keeps a `for` that points to no element until hydration (harmless: the names come from `aria-labelledby`); with a text entry that has an id of its own, a press on the label before hydration does not focus it.
- Error announcement after a submission (live region, focus on the first invalid field, error summary) belongs to the application.
- Only Chromium is automated; screen readers were not tested.
