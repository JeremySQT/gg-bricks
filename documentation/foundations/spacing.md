# Spacing and sizing

## Overview

Spacing comes in three families: layout spacing separates regions of a page, content spacing separates elements inside a region, and control spacing shapes interactive controls. Spacing and control heights follow the density. Icon sizes, avatar sizes and the interaction target do not.

## Layout

`space.layout.{xs, sm, md, lg, xl, 2xl}` separates blocks: page margins, gaps between cards, sections and columns. Start at `md` between sibling blocks and grow with the importance of the break (`xl` and `2xl` between page sections).

<!-- site:tokens prefix=space.layout preview=width -->

## Content

`space.content.{xs, sm, md, lg, xl}` separates elements inside a block: an icon and its text (`xs`, `sm`), a label and its field (`sm`), paragraphs and list items (`md`), groups inside a card (`lg`, `xl`), and the padding of small containers.

<!-- site:tokens prefix=space.content preview=width -->

## Controls

| Role                                  | Use for                                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `size.control.sm` / `md` / `lg`       | Heights of controls (buttons, fields, segmented items) at each size.                            |
| `space.control.padding-inline.{size}` | Inline padding of a text-only control or a field.                                               |
| `space.control.padding-block.{size}`  | Block padding of controls whose height follows their content.                                   |
| `space.control.gap.{size}`            | Gap between controls in a group and between items inside a composite control.                   |
| `space.control.edge-inline.{size}`    | Inline padding of a control's container, before any content.                                    |
| `space.control.label-inline.{size}`   | Inline space on both sides of a control's label; `edge-inline + label-inline = padding-inline`. |
| `space.control.slot-inline.{size}`    | Inline space on both sides of a slot's content (a leading or trailing icon).                    |
| `size.target.min`                     | The minimum interaction target, 44 × 44 CSS px, whatever the visible size of the control.       |

<!-- site:tokens prefix=space.control preview=width -->
<!-- site:tokens paths=size.control.sm,size.control.md,size.control.lg,size.target.min preview=width -->

## Icons and avatars

`size.icon.{xs, sm, md, lg, xl}` sizes icons next to text: `sm` with small text and in `sm` controls, `md` by default, `lg` and `xl` for standalone icons. `size.avatar.{xs … xl}` sizes avatars. `size.choice.{sm, md, lg}` sizes the box of a checkbox or a radio at each control size. None of them changes with density.

<!-- site:tokens prefix=size.icon preview=width -->
<!-- site:tokens prefix=size.avatar preview=width -->
<!-- site:tokens prefix=size.choice preview=width -->

## Rules

- Use layout spacing between blocks and content spacing inside them; do not mix the two families to fine-tune a gap.
- Never hard-code a gap: a pixel value ignores density.
- Keep interactive elements at least `size.target.min` in both directions, with padding or an invisible extension if the visible element is smaller.
- Width is a layout decision: controls do not size themselves to fill a row.

<!-- site:tokens prefix=primitive.dimension preview=width collapsed="Primitive dimensions" -->
