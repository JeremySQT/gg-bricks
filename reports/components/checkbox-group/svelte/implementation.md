# CheckboxGroup — Svelte implementation report

Component: `packages/svelte/src/components/checkbox-group/` (Svelte 5.57.1, Bits UI 2.19.3 `Checkbox.Group`: group role, list value, readonly and disabled passed to its checkboxes, hidden inputs when `name` is set). Checkbox children: `packages/svelte/src/components/checkbox/` (declared dependency, amended with a `value` prop). Review page: `examples/checkbox-group/`; preview `dist/previews/checkbox-group.html`. Implemented on 2026-10-28; implementation approval pending.

## Structure

- `CheckboxGroup.svelte`: the Bits group with `data-orientation`, `data-size`, `data-invalid`, `data-required`, the Field protocol (named by the field label, described by its description and message) or `aria-label`. Context `ggb:checkbox-group` (string key) gives every Checkbox the group value, size, readonly, invalid and disabled.
- `required` is not passed to the primitive: Bits UI would set `aria-required` on every checkbox, announcing each option as mandatory. The group carries `data-required`; the Field shows its indicator and its label or description states the rule in words.
- Value order: Bits UI appends a newly checked value; the group sorts the list by the source order of the checkboxes (`data-checkbox-value`) before updating `value` and calling `onvaluechange`. Values matching no checkbox are kept at the end and ignored.
- `checkbox-group.css`: column with `verticalGap`; horizontal row that wraps, `verticalGap` between lines and `horizontalGap` between checkboxes.

## Checkbox amendments

- `value` prop (default empty), required inside a group (an empty value throws).
- Inside a group the checkbox ignores the Field (the group answers to it) and is not wrapped in its own named group; size comes from the group; disabled, readonly and invalid combine with the group's.
- Never indeterminate inside a group. Its selection (`data-selection`) follows the group value, so the server markup shows the checked boxes before hydration (the primitive syncs `checked` only after the label has rendered).

## Contract rules and how they are met

| Rule | Implementation | Evidence |
| --- | --- | --- |
| value lists the checked values in source order; unknown values ignored | Bits group + sort | SSR; browser value readout after mixed-order toggles |
| Name from Field or label prop; each checkbox keeps its label | `aria-labelledby` / `aria-label` | SSR; browser CDP |
| size, readonly, invalid, disabled reach every checkbox; invalid on each checkbox, Field message describes the group | context | SSR; browser |
| required: at least one, not on the checkboxes, stated in words | `data-required`, no `aria-required` | SSR; browser (no aria-required on the group or a checkbox) |
| Vertical and horizontal layouts, wrapping in order | flex | browser gaps in 3 densities and 3 sizes, narrow column order |
| Every enabled checkbox a tab stop; Space toggles; readonly focusable, ignores activation; disabled skipped | Bits | browser tab order, Space, Enter, arrows, pointer |
| valueChange on user change only | `changed` setter | browser change count after application sets |
| No validation; select-all outside, never indeterminate inside | application in the review page | browser: required Field composition, select all |

## Checks (2026-10-28)

- `npm run verify`: passed (generate, lint, validate, unit tests 40, svelte-check 0 errors 0 warnings, SSR 69, build, docs build).
- Browser (Chromium, Playwright): full suite 111 passed, waves 1 and 2 included; checkbox computed values unchanged.
- Preview: `dist/previews/checkbox-group.html` mounts from `file://` without errors.
- SSR: 5 tests (`checkbox-group.test.ts`, fixture `CheckGroup.svelte`, `FieldWith.svelte` gains a checkbox-group control). Browser: 9 tests. `computed.json`: checkbox colors, mark, label, size per size × condition × selection in 18 contexts, hover and focus in the representative contexts, vertical and horizontal gaps.

## Limitations

- The Field label keeps `for` pointing to the control id in the server markup until hydration (as for RadioGroup).
- Only Chromium is automated.
