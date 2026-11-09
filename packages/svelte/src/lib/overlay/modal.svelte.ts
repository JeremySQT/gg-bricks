export interface ModalOptions {
  /** The open state (a getter); the attachment opens the dialog modally or closes it to match. */
  open: () => boolean;
  /** Called when the dialog closes by itself (Escape, light dismiss, a form method="dialog" submit). */
  onOpenChange?: (open: boolean) => void;
  /** Close on a press on the backdrop. Default true. */
  lightDismiss?: boolean;
  /** Close on Escape (the platform close request). Default true; false also disables the backdrop press. */
  closeRequest?: boolean;
}

/**
 * Attachment for a `<dialog>`: `<dialog class="ggb-overlay" {@attach modal({…})}>`. Opened with `showModal()`,
 * so that the browser places it in the top layer, makes the rest of the page inert, traps focus and restores it on
 * close. Light dismiss uses the `closedby` attribute where the browser knows it and a backdrop press otherwise.
 */
export function modal(options: ModalOptions) {
  return (node: HTMLDialogElement) => {
    const closeRequest = options.closeRequest ?? true;
    const lightDismiss = closeRequest && (options.lightDismiss ?? true);
    // Checked on the prototype so that TypeScript does not narrow `node` by the property's presence.
    const nativeClosedBy = 'closedBy' in HTMLDialogElement.prototype;
    if (nativeClosedBy) node.setAttribute('closedby', lightDismiss ? 'any' : closeRequest ? 'closerequest' : 'none');
    // Without closedby, Escape fires `cancel`, which is cancelled when close requests are refused.
    const onCancel = (event: Event) => {
      if (!closeRequest) event.preventDefault();
    };

    const onClose = () => {
      if (options.open()) options.onOpenChange?.(false);
    };
    // A press on the backdrop lands on the dialog element itself, outside its content box.
    const onPointerdown = (event: PointerEvent) => {
      if (!lightDismiss || nativeClosedBy || event.target !== node) return;
      const r = node.getBoundingClientRect();
      const inside =
        event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
      if (!inside) node.close();
    };
    node.addEventListener('close', onClose);
    node.addEventListener('cancel', onCancel);
    node.addEventListener('pointerdown', onPointerdown);

    $effect(() => {
      const open = options.open();
      if (!node.isConnected) return;
      if (open && !node.open) node.showModal();
      else if (!open && node.open) node.close();
    });

    return () => {
      node.removeEventListener('close', onClose);
      node.removeEventListener('cancel', onCancel);
      node.removeEventListener('pointerdown', onPointerdown);
      if (node.open) node.close();
    };
  };
}
