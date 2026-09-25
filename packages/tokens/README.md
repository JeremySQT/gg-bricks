# @ggbrick/tokens

Generated outputs of the authoritative token sources in `foundations/tokens`. Do not edit these files; run `npm run build:tokens` at the repository root.

| File | Content |
| --- | --- |
| `tokens.css` | One rule per brand × appearance × density context, selected by `data-gg-brand`, `data-gg-appearance` and `data-gg-density` on a common ancestor. Every semantic token becomes `--<path-with-dashes>`. |
| `resolved/<brand>-<appearance>-<density>.json` | Flat resolved DTCG map for one context (aliases resolved after sparse overlays). |
| `figma-manifest.json` | Variable collections, routing and values for the Figma adapter. |
| `figma-expectations.json` | Expected native Figma resolution per brand and mode pair, used by the verification scripts. |

Provenance traces (which source file set each value) are written to `reports/tokens/traces/`.

```css
@import '@ggbrick/tokens/tokens.css';
```

```html
<body data-gg-brand="base" data-gg-appearance="light" data-gg-density="standard">
```

Set all three attributes on the same element. A nested override repeats all three.
