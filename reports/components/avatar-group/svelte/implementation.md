# AvatarGroup — Svelte implementation report

Component: `packages/svelte/src/components/avatar-group/` (Svelte 5.57.1, Bits UI not used). Dependencies: `avatar`. Review page: `examples/avatar-group/`; preview `dist/previews/avatar-group.html`. Implemented on 2026-11-13 (wave 5).

## Notes

- Exports AvatarGroup and the types AvatarGroupProps, AvatarGroupItem.
- Each avatar is drawn above the previous one by document order (no z-index; round 2 of the implementation review); the +N box, last, is drawn above the others.
- The ring is a box-shadow outside each avatar; the group has no padding for it, so that it aligns with neighbouring content. In forced colors the ring becomes a Canvas outline on the item.
- The ring color is the custom property --ggb-avatar-group-ringColor, which an integration sets on the group for another surface.

## Decisions taken during implementation

- Svelte API: the people are an `avatars` array (name, src, initials) rather than Avatar children, so that max, total and the +N box are known during server rendering; the contract part avatars accepts Avatar, which the group renders.

## Checks (2026-11-13)

- `npm run verify`: passed (generate, lint, validate, unit tests 51, svelte-check 0 errors, SSR 104, build, docs build).
- Browser (Chromium): `tests/browser/avatar-group.spec.ts`, also run with a CI-like font set (fontconfig limited to DejaVu, Liberation and Noto, so Inter only as a web font): passed.
- SSR: `tests/ssr/data-structure.test.ts`.
- Evidence: `reports/components/avatar-group/svelte/` (computed.json, review-light.png, review-dark.png, review-mobile.png, forced-colors.png, ssr.json).

## Limits

- Automated evidence in Chromium only.
