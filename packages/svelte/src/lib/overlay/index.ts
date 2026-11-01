// Top-layer overlays (decision of 2026-10-31): the content stays in the DOM subtree that opens it, so it inherits
// the subtree's brand, appearance and density; the browser stacks nested overlays in opening order and provides
// light dismiss, Escape, the inert background and the focus trap of a modal dialog.
export { floating, supportsAnchorPositioning, type FloatingOptions, type Side, type Align } from './floating.svelte.js';
export { modal, type ModalOptions } from './modal.svelte.js';
