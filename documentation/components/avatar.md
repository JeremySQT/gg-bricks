# Avatar

## Overview

An avatar represents a person, or an organization, a team or a project, by their picture, their initials or a generic glyph in a small box beside or instead of their name: the author of a comment, the assignee of a task, the current user in a header.

## Anatomy

| #   | Part      | Required | Role                                                                                                                       |
| --- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 1   | Container | yes      | The box, round for a person and square for an organization, clipped to its shape; it shows the picture once it has loaded. |
| 2   | Initials  | no       | The first letter of the first and last words of the name, uppercased (one at `xs`), or the text given in `initials`.       |
| —   | Picture   | no       | The picture from `src`, cropped to fill the box; never shown before it has loaded or when it fails.                        |
| —   | Glyph     | no       | A generic person, shown in place of the initials when there is neither a name nor given initials.                          |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/avatar.json`.

## When to use

- Beside a name in a list of people, a comment or a record owner, so that people are recognized at a glance.
- Alone where the name does not fit (a table cell, a compact list), named for assistive technology.
- For an organization, a team or a project, with the square shape.
- For the current user in an application header, wrapped in the button that opens the account menu.

## When not to use

- Several people in little room (assignees, participants): AvatarGroup.
- A symbol that does not stand for an identity: Icon.
- A status or a quantity: Badge or Counter.
- A presence or status dot over the avatar: a later composition with Badge (planned).
- A name that is enough on its own: plain text.
- A logo or an illustration at a free size: an image.

## Best practices

| Guidance | Topic       | Practice                                                                                                                   |
| -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| Do       | Name        | Always pass `name`, even with a picture: it is the accessible name and the source of the initials.                         |
| Do       | Decorative  | Set `decorative` when the name is written next to the avatar, so that screen readers do not hear it twice.                 |
| Do       | Shape       | Use the circle for people and the square for organizations, teams and projects, consistently across the product.           |
| Do       | Initials    | Pass `initials` for an organization's abbreviation (“ACM”) when the computed letters would mislead.                        |
| Do       | Size        | Match the text beside it: `xs` or `sm` in comments and dense lists, `md` by default, `lg` or `xl` in profile headers.      |
| Do       | Interaction | Wrap an avatar that opens a menu or a profile in a button or a link that carries the name, and make the avatar decorative. |
| Don't    | Click       | Add a click handler to the avatar itself: it never takes focus and is not announced as a control.                          |
| Don't    | Color       | Expect colors from the name: the avatar is neutral; colored or generated portraits are pictures the application passes.    |
| Don't    | Picture     | Show a placeholder picture of your own while loading: the initials or the glyph already hold the place.                    |
| Don't    | Text        | Put a word in `initials`: it is cut to three characters.                                                                   |

## Examples

Pictures are local data URLs here; pass the URLs of your own pictures. Every case is exercised on the component's review page in the ggbrick repository (`examples/avatar/App.svelte`, not shipped in the package).

### The usual case

The name is written next to each avatar, so the avatars are decorative.

```svelte live
<script lang="ts">
  import { Avatar } from '@ggbrick/svelte';

  const portrait = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#c9d7f2"/><path d="M28 200c4-38 34-58 72-58s68 20 72 58z" fill="#5b6fb5"/><rect x="88" y="112" width="24" height="34" rx="10" fill="#e9b99a"/><ellipse cx="100" cy="86" rx="34" ry="40" fill="#e9b99a"/><path d="M58 70c0-30 18-46 42-46s42 16 42 46v54h-18V78H76v46H58z" fill="#3b2a20"/></svg>'
  )}`;
  const people = [
    { name: 'Olivia Rhye', src: portrait },
    { name: 'Lana Steiner', src: undefined },
    { name: 'Demi Wilkinson', src: undefined }
  ];
</script>

<ul style="display: grid; gap: var(--ggb-space-content-md); margin: 0; padding: 0; list-style: none">
  {#each people as person (person.name)}
    <li style="display: flex; align-items: center; gap: var(--ggb-space-content-md)">
      <Avatar name={person.name} src={person.src} decorative />
      <span>{person.name}</span>
    </li>
  {/each}
</ul>
```

### Alone, named

Without the name beside it, the avatar is an image named by `name`.

```svelte live
<table>
  <tbody>
    <tr>
      <th scope="row">Export the invoices</th>
      <td><Avatar name="Demi Wilkinson" size="sm" /></td>
    </tr>
    <tr>
      <th scope="row">Review the contract</th>
      <td><Avatar name="Phoenix Baker" size="sm" /></td>
    </tr>
  </tbody>
</table>
```

### Sizes and shapes

`xs` shows one initial. The square shape is for an organization, here with given initials.

```svelte live
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--ggb-space-content-md)">
  <Avatar name="Natali Craig" size="xs" />
  <Avatar name="Natali Craig" size="sm" />
  <Avatar name="Natali Craig" />
  <Avatar name="Natali Craig" size="lg" />
  <Avatar name="Natali Craig" size="xl" />
  <Avatar name="Northwind Traders" shape="square" />
  <Avatar name="Acme Corporation" initials="ACM" shape="square" size="xl" />
</div>
```

### Fallbacks

A picture that fails keeps the initials; without a name, the generic glyph shows and the avatar is hidden from assistive technology.

```svelte live
<div style="display: flex; align-items: center; gap: var(--ggb-space-content-md)">
  <Avatar name="Olivia Rhye" src="data:image/png;base64,bm90IGFuIGltYWdl" size="lg" />
  <Avatar size="lg" />
</div>
```

### An account button

The application wraps the avatar in its own button, which carries the name and the focus ring; the avatar inside is decorative.

```svelte live
<div>
  <button class="account" type="button" aria-label="Account: Drew Cano">
    <Avatar name="Drew Cano" size="sm" decorative />
  </button>
</div>

<style>
  .account {
    display: inline-flex;
    padding: 0;
    border: 0;
    border-radius: var(--ggb-radius-full);
    background: none;
    cursor: pointer;
  }
  .account:focus-visible {
    outline: var(--ggb-focus-width) solid var(--ggb-color-focus-ring);
    outline-offset: var(--ggb-focus-offset);
  }
</style>
```

### Difficult cases

- Initials of hyphenated, accented, Cyrillic and Chinese names, a name starting with punctuation or an emoji, and a name without letters (`#initials` on the review page).
- A picture while it loads, after it fails, and a wide picture cropped to the circle or the square (`#playground`, `#states`).
- Avatars of every size beside text of the matching size, in a list, a comment and an account button (`#contexts`).

## API

Import from `@ggbrick/svelte` (Svelte 5, built on Bits UI `Avatar` for the loading status of the picture). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Avatar } from '@ggbrick/svelte';
import type { AvatarProps, AvatarSize, AvatarShape, AvatarImageStatus } from '@ggbrick/svelte';
```

Renders a `<span>` that is the container, with `role="img"` and `aria-label` set to the name, or `aria-hidden="true"` when it is decorative or has no name. With `src`, it holds an `<img class="ggb-avatar__image" alt="">` that stays hidden until the picture has loaded; until then, or when it fails, it holds the fallback instead: a `<span class="ggb-avatar__initials" aria-hidden="true">` or the glyph `<svg class="ggb-avatar__icon" aria-hidden="true">`. The root carries `class="ggb-avatar"` plus any class you pass, `data-size`, `data-shape` and `data-image` (`none`, `loading`, `loaded` or `error`, the values of `AvatarImageStatus`). No `tabindex`.

| Prop         | Type                                   | Default    | Description                                                                                   |
| ------------ | -------------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `name`       | `string`                               | —          | The accessible name and the source of the initials. Without it the avatar is hidden.          |
| `initials`   | `string`                               | —          | Text shown instead of the computed initials, as given; cut to three characters.               |
| `src`        | `string`                               | —          | Picture URL. Shown once loaded; a new URL starts again from the fallback.                     |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`     | Box of 24 to 64 px with its initials; the density does not change it. `xs` shows one initial. |
| `shape`      | `'circle' \| 'square'`                 | `'circle'` | Circle for a person; square, with corners that follow the size, for an organization.          |
| `decorative` | `boolean`                              | `false`    | Hides the avatar from assistive technology when the name is written next to it.               |
| `ref`        | `HTMLSpanElement \| null` (bindable)   | `null`     | The rendered element.                                                                         |
| `class`      | `string`                               | —          | Merged with `ggb-avatar`.                                                                     |

Every other attribute of `HTMLAttributes<HTMLSpanElement>` is forwarded to the element, except those the component owns: `children`, `role`, `tabindex`, `aria-label` and `aria-hidden` (use `name` and `decorative`). Its own `data-*` attributes take precedence over those you pass. There are no events.

Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/avatar.json`.

## Accessibility

The component provides:

- An image named by `name`, whatever it shows; the initials and the glyph hidden from assistive technology.
- The avatar hidden when `decorative` is set or when it has no name, since it then conveys nothing; never focusable.
- Initials and glyph contrast of at least 4.5:1 on the fallback surface in the 18 brand, appearance and density contexts, and a visible edge with the initials in the system text color in forced colors.

The integration provides:

- The name, and `decorative` when the name is written next to the avatar.
- A button or a link around an avatar that opens a menu or a profile, with the accessible name, the focus indicator and enough room to press it.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                  |
| ------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)             | A     | Component (named image), integration (name, `decorative`)       |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Integration (placement next to the name it stands for)          |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component (initials on the fallback surface)                    |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                   | AA    | Integration (the wrapping button or link)                       |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)     | AA    | Integration (the wrapping button or link)                       |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component (image role and name), integration (wrapping control) |

Validated by automated checks: on the server (structure, names, initials, decorative and nameless avatars, picture hidden while loading) and in Chromium (sizes, colors and typography in four representative contexts, initials, the loading, loaded and failed picture, accessible name and role, no tab stop, forced colors, axe-core in light and dark, phone width); the contrast of the initials is measured by the token build in the 18 contexts. No assistive-technology test yet. This list is not a conformance claim.
