# Icon — Svelte implementation report

Component: `packages/svelte/src/components/icon/` (Svelte 5.57.1, no Bits UI primitive: a plain `svg` root). Review page: `examples/icon/`; self-contained preview: `dist/previews/icon.html` (`npm run build && npm run build:preview icon`).

## Structure

- `Icon.svelte`: a single `svg` root (class `ggb-icon`, `data-size`, `viewBox` option defaulting to the Phosphor grid `0 0 256 256`, `fill="currentColor"`, `focusable="false"`) whose content is the `children` snippet (the glyph). A non-blank `label` gives `role="img"` and `aria-label`; otherwise `aria-hidden="true"`. Native svg attributes pass through, `class` is merged.
- `types.ts`: `IconProps` (size, label, viewBox, children) plus `SVGAttributes` minus the owned attributes (`viewBox`, `width`, `height`, `fill`, `focusable`, `role`, `aria-label`, `aria-hidden`).
- `icon.css`: square box from `--ggb-icon-size`, `inline-block`, `vertical-align: middle`, `flex: none`, `fill: currentColor`. Values only from `tokens.generated.css` (one custom property per size bound to `size.icon.*`).

## Contract rules and how they are met

| Rule                                                        | Implementation                                                                                        | Evidence                                                           |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Square box of size, glyph without distortion, current color | `inline-size` and `block-size` from the size token; svg default `preserveAspectRatio`; `fill: currentColor` | browser: 5 sizes × 18 contexts (270 computed records), fill equals color |
| Reference set conventions (Phosphor grid, 1/8 inset)        | `viewBox` defaults to `0 0 256 256`; another grid through the option                                  | browser: a 24-grid square spans 18/24 of the box                   |
| Decorative unless labelled                                  | `aria-hidden` without label; `role="img"` + `aria-label` with a non-blank label                       | SSR and browser (playground toggles the label)                     |
| Fixed size in a flexible layout, density-independent        | `flex: none`; sizes identical across the three densities                                              | browser: squeezed flex row keeps 24 px; 18 contexts                |
| No interaction, no state, one color                         | No handlers, no states; `fill: currentColor` on the root                                              | SSR (no role or tabindex), browser (color follows the container)   |
| A host slot's size wins                                     | The svg is the root, so `.ggb-button__leading > svg` sizes it                                         | browser: sm, md, lg buttons; a trailing xs icon renders at md      |

## Checks (2026-10-14)

- `npm run verify`: passed (generate, lint, validate, unit tests, svelte-check, SSR, build).
- `npm run test:ssr`: 4 Icon tests (`reports/components/icon/svelte/ssr.json`).
- Browser: 4 Chromium tests in `tests/browser/icon.spec.ts`: sizes in the 18 contexts with `computed.json` (270 records), decorative versus named, host sizing and layout behavior, axe (WCAG 2.0/2.1/2.2 A and AA) in light and dark with screenshots and a forced-colors capture.
- Preview: `npm run build:preview icon` mounts from `file://` without errors.

## Limitations

- Only Chromium is automated; Firefox, Safari and screen readers were not tested.
- The optical 1/8 inset is a convention of the reference set: glyphs from a set with another inset render correctly but sit slightly off in hosts that compensate for it (Button).
- The glyph is application content: the component cannot check that it is one color or that it fits the grid.
