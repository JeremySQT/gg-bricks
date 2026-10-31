# Link

## Overview

A link takes the reader to another page or resource from inside text: a guide, another site, an email address, a phone number, a file, a printable version. It is underlined words that read with the sentence around them, followed by a small sign of what they lead to.

## Anatomy

| #   | Part       | Required | Role                                                                                                   |
| --- | ---------- | -------- | ------------------------------------------------------------------------------------------------------ |
| 1   | Label      | yes      | The underlined words: the visible text and the start of the accessible name; wraps with the sentence.  |
| 2   | Meta       | file     | The format and size of a file in parentheses, “(PDF, 2.4 MB)”, not underlined, in a quieter color.     |
| 3   | Indicator  | no       | One glyph of the text size after the words: arrow, envelope, handset, printer or the format of a file. |
| 4   | Focus ring | state    | Drawn around each line of the link on keyboard focus.                                                  |

A gap before the indicator (2, 4 or 6 px with the density), B indicator size (one em: the font size of the text).

## When to use

- A link inside a paragraph, a help text, a table cell or a message.
- A standalone text link placed by the layout: “See all invoices”, “Learn more”.
- A link that should say where it leads before it is followed: another site, an email address, a phone number, a file and its format, a printable version.

## When not to use

- Navigation to a task that reads like an action (“Create project”): Button with `href`.
- An icon-only link: IconButton with `href`.
- Opening the print dialog, sending a form or copying an address: Button, since these are actions.
- A destination that cannot be followed: plain text (a link has no disabled state).
- Structured navigation: Breadcrumb, Tabs and Pagination (planned).

## Best practices

| Guidance | Topic       | Practice                                                                                                                    |
| -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------- |
| Do       | Label       | Write words that say where the link goes, even out of context: “Read the migration guide”, not “here”.                      |
| Do       | Destination | Set `destination` for another site, an email address, a phone number, a file or a printable version, so readers know first. |
| Do       | Files       | Pass `fileType` and `fileSize` with a file link: the format and size are shown and read, the glyph follows the format.      |
| Do       | Tone        | Use `tone="inherit"` inside a colored message or on an inverse surface, where the link color would not stand out.           |
| Do       | Translation | Pass `destinationLabel` in the reader's language: the announced suffixes are English by default.                            |
| Don't    | Underline   | Remove the underline or style a link by color alone: the underline is how readers find it.                                  |
| Don't    | Disabled    | Render a link that goes nowhere: show plain text, or explain why the destination is unavailable.                            |
| Don't    | Actions     | Use a link for an action (save, print, delete): use a Button.                                                               |
| Don't    | New tab     | Open a page of your product in a new tab: only `external` does, and says so.                                                |
| Don't    | Typography  | Give a link its own size or weight: it takes the font of the text around it.                                                |

## Examples

Every case is exercised on the component's review page in the ggbrick repository (`examples/link/App.svelte`, not shipped in the package).

### The usual case

```svelte live
<script lang="ts">
  import { Link } from '@ggbrick/svelte';
</script>

<p>Before you start, read the <Link label="migration guide" href="#migration" /> and check your settings.</p>
```

### Destinations

Each destination adds a glyph after the words and, except page and file, a suffix read by assistive technology.

```svelte live
<ul>
  <li>
    <Link label="Svelte documentation" href="https://svelte.dev" destination="external" />
  </li>
  <li>
    <Link label="support@example.com" href="mailto:support@example.com" destination="email" />
  </li>
  <li>
    <Link label="+33 1 23 45 67 89" href="tel:+33123456789" destination="phone" />
  </li>
  <li>
    <Link label="Print this invoice" href="#print" destination="print" />
  </li>
</ul>
```

### Files

The format and size are visible and part of the name; the glyph follows the format. The application formats the size.

```svelte live
<ul>
  <li>
    <Link label="Annual report" href="#report.pdf" destination="file" fileType="pdf" fileSize="2.4 MB" />
  </li>
  <li>
    <Link label="Customer list" href="#customers.xlsx" destination="file" fileType="xlsx" fileSize="88 kB" />
  </li>
  <li>
    <Link label="Source files" href="#sources.zip" destination="file" fileType="zip" />
  </li>
</ul>
```

### In a colored context

With `tone="inherit"`, the link takes the color of the surrounding text.

```svelte live
<p
  style="padding: var(--ggb-space-content-md); background: var(--ggb-color-surface-inverse); color: var(--ggb-color-content-inverse)"
>
  The invoice was deleted. <Link tone="inherit" label="Undo" href="#undo" />
</p>
```

### Translated suffix

```svelte live
<p lang="fr">
  Consultez la <Link
    label="documentation Svelte"
    href="https://svelte.dev"
    destination="external"
    destinationLabel="s’ouvre dans un nouvel onglet"
  />.
</p>
```

### Difficult cases

- In a narrow column the label wraps with the sentence; the meta and the glyph stay with the last word and never start a line alone (`#prose` on the review page).
- On a muted surface in dark appearance, the quiet color of a file's meta measures 3.42:1, below 4.5:1: prefer `tone="inherit"` or leave out `fileType` and `fileSize` there (`#tones`).

## API

Import from `@ggbrick/svelte` (Svelte 5). Import `@ggbrick/svelte/tokens.css` once and set `data-ggb-brand`, `data-ggb-appearance` and `data-ggb-density` on an ancestor (without them the page is `base`, `light` and `standard`).

```ts
import { Link } from '@ggbrick/svelte';
import type { LinkProps, LinkTone, LinkDestination } from '@ggbrick/svelte';
```

Renders a native `<a>` with the label, the meta of a file, the glyph (`aria-hidden`) and a visually hidden suffix. The root carries `class="ggb-link"` plus any class you pass, `data-tone` and `data-destination`. With `destination="external"` it sets `target="_blank"` and adds `noopener noreferrer` to the `rel` you pass.

| Prop               | Type                                                              | Default    | Description                                                                                                                          |
| ------------------ | ----------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `label`            | `string`                                                          | required   | Visible words and start of the accessible name. Must be non-empty: an empty or blank label throws, on the server and in the browser. |
| `href`             | `string`                                                          | required   | Destination: a URL, `mailto:` for email, `tel:` for phone. Must be non-empty: an empty `href` throws.                                |
| `tone`             | `'accent' \| 'inherit'`                                           | `'accent'` | `accent` draws the link in the link color; `inherit` takes the color of the surrounding text.                                        |
| `destination`      | `'page' \| 'external' \| 'email' \| 'phone' \| 'file' \| 'print'` | `'page'`   | What the link leads to: decides the glyph, the announced suffix and, for `external`, a new tab.                                      |
| `fileType`         | `string`                                                          | —          | With `file`: the format (`pdf`, `.docx`…), matched ignoring case and a leading dot; shown in uppercase and chooses the glyph.        |
| `fileSize`         | `string`                                                          | —          | With `file`: the size, shown as given (“2.4 MB”).                                                                                    |
| `destinationLabel` | `string`                                                          | —          | Replaces the English suffix announced after the name (“opens in a new tab”, “email”, “phone”, “printable version”).                  |
| `ref`              | `HTMLAnchorElement \| null` (bindable)                            | `null`     | The rendered element.                                                                                                                |
| `class`            | `string`                                                          | —          | Merged with `ggb-link`.                                                                                                              |

Every other attribute of `HTMLAnchorAttributes` is forwarded to the element (`rel`, `download`, `hreflang`, `onclick`…), except those the component owns: `children`, `href`, `target`, `aria-label`, `aria-disabled` and `role`. There is no size prop: the link takes the font of its context.

File glyphs by `fileType`: pdf; doc, docx, odt, rtf; xls, xlsx, ods; csv; ppt, pptx, odp; txt, md; zip, rar, 7z, gz, tar; png, jpg, jpeg, gif, webp, svg; mp3, wav, ogg; mp4, mov, webm; any other value a generic file. Brand, appearance and density apply through the tokens, without any prop. The platform-independent contract ships as `contracts/link.json`.

## Accessibility

The component provides:

- A native `a`: role, Enter to follow, tab order and the browser's link behavior come from the platform.
- An accessible name made of the label, the file meta and the destination suffix (“Svelte documentation (opens in a new tab)”).
- The label underlined in every state (thicker on hover and press), the link color at least 4.8:1 on the system surfaces, a focus ring around each line, forced colors handled.

The integration provides:

- Words that describe the destination, and a translated `destinationLabel`.
- `tone="inherit"` on colored surfaces, and contrast with backgrounds other than the system surfaces.
- The file size formatted for the reader's locale.

| WCAG 2.2 criterion                                                                                                 | Level | Responsibility                                                           |
| ------------------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------ |
| [1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                                | A     | Component (permanent underline)                                          |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)                      | AA    | Component on the system surfaces; file meta below 4.5:1 on muted in dark |
| [2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)                                        | A     | Component                                                                |
| [2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html)        | A     | Component (destination, meta), integration (the words)                   |
| [2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)                              | AA    | Component                                                                |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA    | Integration (sticky bars, overlays)                                      |
| [4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                        | A     | Component                                                                |

Beyond AA, the link also supports [3.2.5 Change on Request](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html) (AAA): only `external` opens a new tab, and it says so.

Validated by automated checks in Chromium (accessible names, axe-core in light and dark, keyboard, wrapping, forced colors, contrast in the 18 contexts); no assistive-technology test yet. This list is not a conformance claim.
