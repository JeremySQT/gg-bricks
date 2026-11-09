import type { Snippet } from 'svelte';
import type { HTMLDialogAttributes } from 'svelte/elements';
import type { DialogSize } from './contract.generated.js';

type Owned = 'children' | 'role' | 'open' | 'title' | 'aria-labelledby' | 'aria-describedby' | 'aria-modal';

export interface DialogProps extends Omit<HTMLDialogAttributes, Owned> {
  /** Open state; bind it (`bind:open`). Set it from the button or menu item that opens the dialog. */
  open?: boolean;
  /** The question or task, in heading typography; it names the dialog. Required and non-empty. */
  title: string;
  /** A short sentence under the title; it describes the dialog. */
  description?: string;
  /** Panel width: sm 400, md 560 (default), lg 720 px, never wider than the viewport. */
  size?: DialogSize;
  /** An alert dialog that asks for a decision (confirm a deletion); never closed by a press on the backdrop. */
  alert?: boolean;
  /**
   * Close button, Escape and a press on the backdrop ask to close (default true). false: none of them; the footer
   * offers the way out.
   */
  dismissible?: boolean;
  /** Accessible name of the close button. Default Close. */
  closeLabel?: string;
  /**
   * The body: free content that scrolls when the dialog is taller than the viewport. Mark the element that should
   * receive focus first with `autofocus`; otherwise focus goes to the first focusable element of the body.
   */
  children?: Snippet;
  /** One ButtonGroup, aligned at the end; the primary action last. */
  footer?: Snippet;
  /** Called when the user asks to close (close button, Escape, backdrop press), with false. */
  onopenchange?: (open: boolean) => void;
  /** The dialog element. */
  ref?: HTMLDialogElement | null;
}
