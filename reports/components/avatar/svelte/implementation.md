# Avatar — Svelte implementation report

Component: `packages/svelte/src/components/avatar/` (Svelte 5.57.1, Bits UI 2.19.3 (Avatar: loading status of the picture)). Dependencies: none. Review page: `examples/avatar/`; preview `dist/previews/avatar.html`. Implemented on 2026-11-13 (wave 5).

## Notes

- Exports Avatar and the types AvatarProps, AvatarImageStatus.
- Bits UI Avatar reports the loading status; ggbrick keeps it per source (a new src starts again from loading, since Bits UI does not reload once a picture has loaded) and renders the picture only without Bits UI's fallback part: the initials or the glyph are drawn while imageStatus is not loaded.
- Initials: Intl.Segmenter graphemes (fallback to code points), leading punctuation skipped, words without letters or digits ignored, toLocaleUpperCase; initials.ts in the component folder.
- The generic glyph is Phosphor user (regular) inline, attributed in the markup.
- Initials are centered on their capital height with text-box trim (browsers without it center the line box).

## Decisions taken during implementation

- Svelte API: role img named by name on the root span; decorative or nameless avatars get aria-hidden; consumer attributes go to the root after Bits UI's.

## Checks (2026-11-13)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 104, build, docs build).
- Browser (Chromium): `tests/browser/avatar.spec.ts`, also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): passed.
- SSR: `tests/ssr/data-structure.test.ts`.
- Evidence: `reports/components/avatar/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
