<script lang="ts">
  import { setContext, tick } from 'svelte';
  import IconButton from '../icon-button/IconButton.svelte';
  import { modal } from '../../lib/overlay/index.js';
  import '../../lib/overlay/overlay.css';
  import type { DialogProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import { glyphs } from './glyphs.js';
  import './tokens.generated.css';
  import './dialog.css';

  let {
    open = $bindable(defaults.open),
    title,
    description = defaults.description,
    size = defaults.size,
    alert = defaults.alert,
    dismissible = defaults.dismissible,
    closeLabel = defaults.closeLabel,
    children,
    footer,
    onopenchange,
    ref = $bindable(null),
    class: className,
    id,
    ...rest
  }: DialogProps = $props();

  // Fail identically on the server and in the browser rather than render an unnamed dialog.
  const heading = $derived.by(() => {
    if (typeof title !== 'string' || !title.trim()) throw new Error('Dialog requires a non-empty title.');
    return title;
  });

  const uid = $props.id();
  const base = $derived(id ?? uid);
  const titleId = $derived(`${base}-title`);
  const descriptionId = $derived(`${base}-description`);

  // Buttons inside the dialog are not sized by a ButtonGroup around its declaration.
  setContext('ggb:button-group', undefined);

  function set(next: boolean) {
    if (next === open) return;
    open = next;
    onopenchange?.(next);
  }

  let body = $state<HTMLElement | null>(null);
  let footerElement = $state<HTMLElement | null>(null);
  let scrolled = $state(false);

  // Initial focus: the element marked autofocus (the browser focuses it), else the first focusable element of the
  // body, then of the footer, else the panel itself.
  const focusable =
    'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  $effect(() => {
    if (!open || !ref) return;
    const dialog = ref;
    void tick().then(() => {
      if (!dialog.open || dialog.querySelector('[autofocus]')) return;
      const target =
        body?.querySelector<HTMLElement>(focusable) ?? footerElement?.querySelector<HTMLElement>(focusable) ?? dialog;
      target.focus();
    });
  });

  // The body scrolls when the content is taller than the panel allows; dividers then set off header and footer.
  $effect(() => {
    const element = body;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const check = () => (scrolled = element.scrollHeight > element.clientHeight + 0.5);
    const observer = new ResizeObserver(check);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    check();
    return () => observer.disconnect();
  });
</script>

<dialog
  {...rest}
  bind:this={ref}
  id={base}
  class={['ggb-dialog', 'ggb-overlay', className]}
  data-size={size}
  data-scrolled={scrolled ? '' : undefined}
  role={alert ? 'alertdialog' : undefined}
  aria-labelledby={titleId}
  aria-describedby={description ? descriptionId : undefined}
  tabindex="-1"
  {@attach modal({ open: () => open, onOpenChange: set, lightDismiss: !alert, closeRequest: dismissible })}
>
  <!-- Divisions rather than header, footer and h2 elements, so that an application's element styles never reach
       them; the title keeps its heading role. -->
  <div class="ggb-dialog__header">
    <div class="ggb-dialog__titleRow">
      <div class="ggb-dialog__title" id={titleId} role="heading" aria-level="2">{heading}</div>
      {#if dismissible}
        <span class="ggb-dialog__close">
          <IconButton label={closeLabel} size="sm" intent="neutral" appearance="ghost" onactivate={() => set(false)}>
            {#snippet icon()}
              <svg viewBox="0 0 256 256" fill="currentColor" focusable="false" aria-hidden="true"
                ><path d={glyphs.x} /></svg
              >
            {/snippet}
          </IconButton>
        </span>
      {/if}
    </div>
    {#if description}<div class="ggb-dialog__description" id={descriptionId}>{description}</div>{/if}
  </div>
  <div class="ggb-dialog__body" bind:this={body}>
    {@render children?.()}
  </div>
  {#if footer}
    <div class="ggb-dialog__footer" bind:this={footerElement}>{@render footer()}</div>
  {/if}
</dialog>
