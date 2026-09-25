# @ggbrick/tokens

Generated outputs of the authoritative token sources in `foundations/tokens`. Do not edit these files; run `npm run build:tokens` at the repository root.

| File | Content |
| --- | --- |
| `tokens.css` | Layered rules: base tokens under `[data-ggb-brand]`, appearance roles under `[data-ggb-appearance]`, density roles under `[data-ggb-density]`, sparse brand overrides under combined selectors. Every token becomes `--ggb-<path-with-dashes>`; aliases are `var()` references. |
| `resolved/<brand>-<appearance>-<density>.json` | Flat resolved DTCG map for one context (aliases resolved after sparse overlays). |
| `figma-manifest.json` | Variable collections, routing and values for the Figma adapter. |
| `figma-expectations.json` | Expected native Figma resolution per brand and mode pair, used by the verification scripts. |

Provenance traces (which source file set each value) are written to `reports/tokens/traces/`.

```css
@import '@ggbrick/tokens/tokens.css';
```

```html
<body data-ggb-brand="base" data-ggb-appearance="light" data-ggb-density="standard">
```

Set all three attributes on one ancestor. A subtree may override any one of them alone (for example `data-ggb-density="compact"` on a toolbar): the stylesheet is layered per attribute and aliases resolve through `var()`.
