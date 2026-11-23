# AvatarGroup

## Overview

An avatar group shows the people or teams involved in an object as a compact row of overlapping avatars: the assignees of a task, the participants of a meeting, the members of a project. When there are too many to show, a last box counts the others (+3).

## Anatomy

| #   | Part      | Required | Role                                                                                                                                                   |
| --- | --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Avatars   | yes      | One Avatar per person, in order, all of the group's size and shape; each overlaps the previous one, is drawn above it, with a ring that sets it apart. |
| 2   | Overflow  | no       | An avatar-like box showing +N, the number of the others (+99 at most); the group never shows more than `max` boxes, this one included.                 |
| —   | List name | yes      | Not drawn: `label` names the group for assistive technology (Assignees, Participants).                                                                 |

Measurements and tokens, including the lettered dimensions of the blueprint: `contracts/avatar-group.json`.

## When to use

- The assignees of a task or the reviewers of a document, in a table cell, a card or a page header.
- The participants of a meeting or the members of a project, capped with a +N count when they are many.
- A count of everyone when the application loads only the first few people, with `total`.

## When not to use

- A single person or organization: Avatar, with the name beside it.
- People who all matter, with their names and details: a list or a Table.
- A number of people without faces: a Counter with a label.
- Clickable avatars, or the full list on activation: the group is not interactive in this version; the integration composes it with a Popover or a Tooltip.
- People spread over several lines: the group never wraps; lower `max` instead.

## Best practices

| Guidance | Topic      | Practice                                                                                                                          |
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label      | Name the group by the role of its people (“Assignees”, “Participants”): it is the name of the list.                               |
| Do       | Order      | Put the most relevant people first, such as the owner: the first avatars are the ones kept when `max` shortens the row.           |
| Do       | Names      | Give every person a name: it is the avatar's accessible name and the source of its initials.                                      |
| Do       | Max        | Choose `max` for the room available, remembering that it counts the +N box: the row never wraps.                                  |
| Do       | Total      | Pass `total` when the application knows more people than it loads, so that the +N count stays true.                               |
| Do       | Shape      | Use circles for people, squares for teams, organizations or projects.                                                             |
| Do       | Surface    | On a surface other than the default, set `--ggb-avatar-group-ringColor` on the group to that surface, so that the ring blends in. |
| Do       | Language   | Translate `moreLabel` with the interface: the +N box is read as the number of the others followed by it (“3 more”).               |
| Don't    | Children   | Place Avatar components inside the group: it renders its own from `avatars`, with its size and shape.                             |
| Don't    | Ring       | Set the ring color on an ancestor: the group sets its own value, so set it on the group itself.                                   |
| Don't    | Activation | Expect the group, an avatar or the +N box to open a profile or the full list: none of them is interactive or takes focus.         |
| Don't    | Meaning    | Rely on faces alone when the reader must know who is involved: write the names, or use a list.                                    |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/avatar-group/App.svelte`, not shipped in the package).

### The usual case

Seven assignees with the default `max` of 5: four avatars and +3.

```svelte live
<script lang="ts">
  import { AvatarGroup } from '@ggbrick/svelte';

  const design = [
    'Olivia Rhye',
    'Phoenix Baker',
    'Lana Steiner',
    'Demi Wilkinson',
    'Candice Wu',
    'Natali Craig',
    'Drew Cano'
  ];
  const billing = ['Orlando Diggs', 'Andi Lane'];
</script>

<table>
  <tbody>
    <tr>
      <th scope="row">Website redesign</th>
      <td><AvatarGroup label="Assignees" avatars={design.map((name) => ({ name }))} size="sm" /></td>
    </tr>
    <tr>
      <th scope="row">Billing export</th>
      <td><AvatarGroup label="Assignees" avatars={billing.map((name) => ({ name }))} size="sm" /></td>
    </tr>
  </tbody>
</table>
```

### More people than the application loads

Three avatars passed, `total` 12: the +N box counts the nine others.

```svelte live
<script lang="ts">
  import { AvatarGroup } from '@ggbrick/svelte';

  const first = [{ name: 'Olivia Rhye' }, { name: 'Phoenix Baker' }, { name: 'Lana Steiner' }];
</script>

<div>
  <AvatarGroup label="Participants" avatars={first} total={12} />
</div>
```

### Sizes and shapes

Squares for teams and organizations; `max` set to 4 so that the +N box is the fourth.

```svelte live
<script lang="ts">
  import { AvatarGroup } from '@ggbrick/svelte';

  const people = ['Olivia Rhye', 'Phoenix Baker', 'Lana Steiner', 'Demi Wilkinson', 'Candice Wu'].map((name) => ({
    name
  }));
  const teams = ['Acme Inc', 'Northwind Traders', 'Globex', 'Initech', 'Umbrella'].map((name) => ({ name }));
</script>

<div style="display: flex; flex-direction: column; gap: var(--ggb-space-content-lg)">
  <AvatarGroup label="Reviewers" avatars={people} size="xs" max={4} />
  <AvatarGroup label="Reviewers" avatars={people} size="md" max={4} />
  <AvatarGroup label="Reviewers" avatars={people} size="xl" max={4} />
  <AvatarGroup label="Partners" avatars={teams} shape="square" max={4} />
</div>
```

### With pictures, on another surface

Each picture replaces the initials once it has loaded. On the subtle surface the ring color is set on the group.

```svelte live
<script lang="ts">
  import { AvatarGroup } from '@ggbrick/svelte';

  // Stand-in portraits as data URLs; use your own picture URLs.
  const portrait = (back: string, skin: string) =>
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${back}"/><circle cx="32" cy="26" r="12" fill="${skin}"/><path d="M10 64c2-14 11-22 22-22s20 8 22 22z" fill="${skin}"/></svg>`
    );
  const members = [
    { name: 'Olivia Rhye', src: portrait('#c7d7fe', '#8d5524') },
    { name: 'Phoenix Baker', src: portrait('#fde68a', '#f1c27d') },
    { name: 'Lana Steiner' },
    { name: 'Candice Wu', src: portrait('#bbf7d0', '#e0ac69') },
    { name: 'Drew Cano' },
    { name: 'Orlando Diggs' }
  ];
</script>

<div
  style="padding: var(--ggb-space-content-lg); background: var(--ggb-color-surface-subtle); border-radius: var(--ggb-radius-container)"
>
  <AvatarGroup
    label="Members"
    avatars={members}
    style="--ggb-avatar-group-ringColor: var(--ggb-color-surface-subtle)"
  />
</div>
```

### Every avatar, beside a sentence

With `max` 0 every avatar is shown; the sentence names the people.

```svelte live
<script lang="ts">
  import { AvatarGroup } from '@ggbrick/svelte';

  const attendees = [{ name: 'Olivia Rhye' }, { name: 'Phoenix Baker' }, { name: 'Lana Steiner' }];
</script>

<div style="display: flex; align-items: center; gap: var(--ggb-space-content-sm)">
  <AvatarGroup label="Attendees" avatars={attendees} size="xs" max={0} />
  <span>Olivia, Phoenix and Lana are attending</span>
</div>
```

### Difficult cases

- One person, exactly `max` people (no +N box), one more than `max` (+2), `total` beyond the avatars, a count capped at +99 and `max` 0 (`#bounds`).
- The ring on the subtle surface, left as is and set by the integration (`#surfaces`).
- The five sizes in both shapes; at `xs` each avatar shows one initial while the +N box keeps its full count (`#matrix`).
- A group in a card header and beside a sentence (`#contexts`); any number of people, `max` and `total` (`#playground`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor.

```ts
import { AvatarGroup } from '@ggbrick/svelte';
import type { AvatarGroupProps, AvatarGroupItem, AvatarGroupSize, AvatarGroupShape } from '@ggbrick/svelte';
```

Renders a `<ul class="ggb-avatar-group" role="list">` (plus any class you pass) with `aria-label` from `label`, `data-size` and `data-shape`. Each shown person is an `<li class="ggb-avatar-group__item">` holding an Avatar (`<span class="ggb-avatar" role="img">` named by the person's name); the +N box is a last `<li>` that also has the class `ggb-avatar-group__overflow`, holding an Avatar named by the number of the others and `moreLabel`, with +N as its initials.

| Prop        | Type                                   | Default    | Description                                                                                       |
| ----------- | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `label`     | `string`                               | required   | Names the list (Assignees). An empty or blank label throws, on the server and in the browser.     |
| `avatars`   | `AvatarGroupItem[]`                    | required   | The people, in order. An empty array throws.                                                      |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`     | Size of every avatar and of the +N box, from 24 to 64 px.                                         |
| `shape`     | `'circle' \| 'square'`                 | `'circle'` | Shape of every avatar and of the +N box: circle for people, square for teams or organizations.    |
| `max`       | `number`                               | `5`        | Most boxes shown, the +N box included; 0 shows every avatar, and 1 counts as 2.                   |
| `total`     | `number`                               | `0`        | Number of people, when greater than the avatars passed; 0 counts the avatars.                     |
| `moreLabel` | `string`                               | `'more'`   | Word after the number of the others in the name of the +N box (3 more); blank falls back to more. |
| `ref`       | `HTMLUListElement \| null` (bindable)  | `null`     | The list element.                                                                                 |
| `class`     | `string`                               | —          | Merged with `ggb-avatar-group`.                                                                   |

`AvatarGroupItem`, one entry of `avatars`:

| Field      | Type     | Default  | Description                                                                           |
| ---------- | -------- | -------- | ------------------------------------------------------------------------------------- |
| `name`     | `string` | required | The avatar's accessible name and the source of its initials.                          |
| `src`      | `string` | —        | Picture URL; the initials stay while it loads or if it fails.                         |
| `initials` | `string` | —        | Text shown instead of the computed initials, such as an abbreviation (three at most). |

The number of people is `total` when it is greater than the number of avatars, otherwise the number of avatars. When `max` is above 0 and that number exceeds it, the group shows the first `max - 1` avatars and the +N box (a `max` of 1 counts as 2: one box cannot show a person and the count); the box shows +99 at most, but its accessible name keeps the full number (“1197 more”).

Every other attribute of `HTMLAttributes<HTMLUListElement>` (`id`, `style`, `aria-describedby`…) goes to the list, except those the component owns: `children`, `role`, `tabindex` and `aria-label` (from `label`). There are no events and no snippets. The ring around each avatar takes the color of the custom property `--ggb-avatar-group-ringColor`, the default surface unless you set it on the group (with `style` or a class) for another surface. The platform-independent contract ships as `contracts/avatar-group.json`.

## Accessibility

The component provides:

- A list named by `label`, with one item per box; each avatar is an image named by the person's name, its picture and initials hidden behind that name.
- A +N box named by the number of the others followed by `moreLabel` (“3 more”), with the full number even beyond +99.
- No tab stop: neither the group, nor an avatar, nor the +N box takes focus.
- A ring that separates neighbours; in forced colors it becomes an outline in the system background color, and each avatar keeps its edge.

The integration provides:

- A `label` that says who the people are, and a name for each person.
- The ring color of the surface when the group sits on another one.
- Room for the row, which never wraps, through `max`.
- Any interaction (a profile, the full list), composed outside the group with its own accessible name.

| WCAG 2.2 criterion                                                                                      | Level | Responsibility                                                 |
| ------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------- |
| [1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)             | A     | Component (each avatar named), integration (the names)         |
| [1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html) | A     | Component (named list), integration (the label)                |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)           | AA    | Component, through Avatar (initials and the +N count)          |
| [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                | AA    | Integration (the row never wraps; choose `max` for the room)   |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)             | A     | Component (list, images and +N box named), integration (label) |

Validated by automated checks on the server (named list, size and shape on every avatar, `max` with the +N box, `total`, the +99 cap, `max` 0, rejection of an empty label or list) and in Chromium (overlap, ring, size and shape in four brand, appearance and density contexts, each avatar drawn above the previous one, counting, accessible names, no tab stop, ring color set by the integration, forced colors, axe-core in light and dark, phone width); no assistive-technology test yet. This list is not a conformance claim.
