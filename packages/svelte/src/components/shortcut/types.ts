import type { HTMLAttributes } from 'svelte/elements';
import type { ShortcutAppearance, ShortcutPlatform, ShortcutSize } from './contract.generated.js';

/** Attributes the component owns: the content follows from keys, the accessible text from keys or label. */
type Owned = 'children';

export interface ShortcutProps extends Omit<HTMLAttributes<HTMLElement>, Owned> {
  /**
   * Platform-neutral combination: names joined by + (Mod+Shift+P), matched ignoring case. Modifiers Mod, Ctrl
   * (Control), Alt (Option), Shift, Meta (Cmd, Command, Super, Win); special keys Enter (Return), Escape (Esc), Tab,
   * Space, Backspace, Delete (Del), ArrowUp/Down/Left/Right (Up, Down, Left, Right), Home, End, PageUp (PgUp),
   * PageDown (PgDn), F1 to F12, Plus. Any other name is a literal key shown as written (a single letter uppercased).
   */
  keys: string;
  /** auto detects Apple platforms; mac and other force the rendering (documentation, screenshots, tests). */
  platform?: ShortcutPlatform;
  /** plain: text placed by its box. keycap: one cap per key, for neutral surfaces only. */
  appearance?: ShortcutAppearance;
  /** Typography size, named like the host: pass the host's size unchanged (Button md gives Shortcut md). */
  size?: ShortcutSize;
  /** Replaces the generated spoken equivalent as the accessible text (localization, product wording). */
  label?: string;
  /** The rendered root element. */
  ref?: HTMLElement | null;
}
