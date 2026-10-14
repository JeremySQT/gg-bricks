# @ggbrick/tokens

Generated outputs of the authoritative token sources in `foundations/tokens`. Do not edit these files; run `npm run build:tokens` at the repository root.

| File | Content |
| --- | --- |
| `tokens.css` | Layered rules: base tokens and the default appearance and density under `:root, [data-ggb-brand]`, appearance roles under `[data-ggb-appearance]`, density roles under `[data-ggb-density]`, sparse brand overrides under combined selectors. Every token becomes `--ggb-<path-with-dashes>`; aliases are `var()` references. |
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

Set the three attributes on one ancestor. Without any of them the document is `base`, `light` and `standard` (the defaults of `foundations/tokens/config.json`); a brand attribute alone gets that brand with the defaults. A subtree may override `data-ggb-appearance` or `data-ggb-density` alone (for example `data-ggb-density="compact"` on a toolbar). A subtree that switches `data-ggb-brand` gets the defaults for the other two unless it restates them on the same element: the color roles are computed where the appearance is declared, with the palette in effect there.

Opacity tokens (`opacity.*`, `primitive.opacity.*`) are emitted ×100 in `figma-manifest.json` and `figma-expectations.json` (0.7 → 70): Figma reads a number variable bound to layer opacity as a percentage. CSS keeps the source values.
