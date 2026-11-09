import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ToolbarOrientation, ToolbarSize } from './contract.generated.js';

export interface ToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role' | 'aria-label'> {
  /** Accessible name of the toolbar (Text formatting). Required and non-empty. */
  label: string;
  /** Size of every Button and IconButton of the toolbar, Menu and Popover triggers included. Default md. */
  size?: ToolbarSize;
  /** horizontal: one line, wrapping when it does not fit; vertical: one column. Default horizontal. */
  orientation?: ToolbarOrientation;
  /** Buttons, IconButtons, Menus, Popovers, Tooltips around IconButtons, and ToolbarSeparators, in order. */
  children: Snippet;
  /** The root element. */
  ref?: HTMLDivElement | null;
}

export type ToolbarSeparatorProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'>;
