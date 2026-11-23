# Third-party notices

ggbrick is released under the MIT License (see [LICENSE](LICENSE)). This file lists the third-party material that is copied into this repository, with the notice its license requires. Dependencies installed from npm (Svelte, Bits UI, Astro, Starlight and the others in `package.json`) are not copied here and keep their own licenses.

## Phosphor Icons

SVG path data from [Phosphor Icons](https://phosphoricons.com) 2.1.1 is copied into:

- the intrinsic glyphs of components (chevron, check, close and similar) in `packages/svelte/src/components/`;
- the review and documentation examples (`examples/icon/glyphs.ts`, `apps/docs/src/playgrounds/`, `documentation/components/`);
- the Figma adapter scripts in `authoring/adapters/figma/`.

ggbrick bundles no icon set: an application passes its own icons to components, and every intrinsic glyph can be replaced through a snippet prop.

```
MIT License

Copyright (c) 2023 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Fonts

The documentation site loads Inter and IBM Plex Mono from the `@fontsource/inter` and `@fontsource/ibm-plex-mono` packages, both under the SIL Open Font License 1.1. The font files are not stored in this repository, and components load no font.
