# Motion

## Overview

Motion is short and functional: it shows where something comes from or that a state changed. It is never needed to understand the interface.

## Durations

| Role                   | Use for                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `motion.duration.fast` | Small state changes: hover and pressed colors, toggles.              |
| `motion.duration.base` | Elements appearing next to their trigger: menus, popovers, tooltips. |
| `motion.duration.slow` | Large movements: dialogs, drawers, page-level transitions.           |

<!-- site:tokens preview=duration -->

## Easing

| Role                       | Use for                                                             |
| -------------------------- | ------------------------------------------------------------------- |
| `motion.easing.standard`   | Changes of an element that stays on screen (size, position, color). |
| `motion.easing.emphasized` | A change that should draw attention, used sparingly.                |
| `motion.easing.enter`      | Elements entering the screen (they decelerate into place).          |
| `motion.easing.exit`       | Elements leaving the screen (they accelerate away).                 |

<!-- site:tokens preview=easing -->

## Rules

- Honor `prefers-reduced-motion: reduce`: remove movement and keep at most an opacity change.
- Do not animate layout properties of large regions, and never make the user wait for an animation to act.
- Use the duration and easing roles together; do not tune curves locally.
