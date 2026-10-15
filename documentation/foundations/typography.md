# Typography

## Overview

Interface text is set in Inter in every brand and code in IBM Plex Mono. A typography role is a composite token: family, weight, size, line height and letter spacing, plus tabular figures for numerals and indicators. Font sizes do not change with density: a compact interface is tighter, not smaller.

## Roles

| Role                                    | Use for                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `typography.display.xl` … `display.xs`  | Hero text of landing and marketing pages, a single statement per view. Not for application screens.              |
| `typography.heading.xl`                 | Page title of an application screen.                                                                             |
| `typography.heading.lg`                 | Page title in dense screens, or the title of a large section.                                                    |
| `typography.heading.md`                 | Section headings.                                                                                                |
| `typography.heading.sm`                 | Subsection headings, dialog titles.                                                                              |
| `typography.heading.xs`                 | Card and panel titles, group labels with a heading role.                                                         |
| `typography.body.lg`                    | Long-form reading: articles, onboarding text.                                                                    |
| `typography.body.md`                    | Default running text.                                                                                            |
| `typography.body.sm`                    | Dense interfaces: table cells, side panels, descriptions under a control.                                        |
| `typography.label.lg` / `md` / `sm`     | Text of controls and form labels, sized like the control (`lg`, `md`, `sm`).                                     |
| `typography.caption.md` / `sm`          | Supporting text: helper messages, figure captions, timestamps.                                                   |
| `typography.overline.md` / `sm`         | A short eyebrow above a heading. The role does not uppercase; apply `text-transform` if the design calls for it. |
| `typography.numeral.lg` / `md` / `sm`   | Numbers read or compared: key figures (`lg`), numeric table columns (`md`, `sm`). Tabular figures.               |
| `typography.indicator.lg` / `md` / `sm` | Companion text next to a label (counters, shortcuts, badges), one step below the host's label. Tabular figures.  |
| `typography.code.md` / `sm`             | Code blocks and inline code.                                                                                     |

<!-- site:tokens prefix=typography preview=type alias=false -->

## In CSS

A role is a `font` shorthand. Letter spacing and font features are separate properties because `font` cannot carry them:

```css
.title {
  font: var(--ggb-typography-heading-md);
  letter-spacing: var(--ggb-typography-heading-md-letterSpacing);
}
.amount {
  font: var(--ggb-typography-numeral-md);
  letter-spacing: var(--ggb-typography-numeral-md-letterSpacing);
  font-feature-settings: var(--ggb-typography-numeral-md-fontFeatureSettings);
}
```

`-fontSize` and `-lineHeight` are also exposed for layouts that need the size or the line height alone (aligning an icon with the first line, for example).

## Rules

- Choose the role by the text's function, not by the size you want: a card title is `heading.xs` even if `body.lg` has a similar size.
- Keep one display role per view at most; application screens start at `heading.xl`.
- Use numeral roles for figures that are compared or that change (totals, prices, counts) so that digits do not shift.
- Do not set font sizes in pixels or scale text with density; let users zoom.
- Load Inter (400, 500, 600, 700) and IBM Plex Mono (400) in the application; components do not load fonts.

<!-- site:tokens prefix=primitive.font.family alias=false -->
