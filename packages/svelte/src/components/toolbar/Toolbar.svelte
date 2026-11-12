<script lang="ts">
  import { setContext, untrack } from 'svelte';
  import IconButton from '../icon-button/IconButton.svelte';
  import Menu from '../menu/Menu.svelte';
  import MenuItem from '../menu/MenuItem.svelte';
  import { rovingFocus } from './roving-focus.js';
  import type { ToolbarProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './toolbar.css';

  let {
    label,
    size = defaults.size,
    orientation = defaults.orientation,
    overflowLabel = defaults.overflowLabel,
    children,
    ref = $bindable(null),
    class: className,
    ...rest
  }: ToolbarProps = $props();

  // Fail identically on the server and in the browser rather than render an unnamed toolbar.
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Toolbar requires a non-empty label.');
    return label;
  });

  // Every Button and IconButton of the toolbar takes its size, including the triggers of its Menus and Popovers and
  // the controls inside its Tooltips (the context key ButtonGroup uses; Popover content resets it).
  setContext('ggb:button-group', {
    get size() {
      return size;
    }
  });

  setContext('ggb:toolbar', {
    get orientation() {
      return orientation;
    }
  });

  // Items: the toolbar's buttons and links, wherever a Tooltip, Menu or Popover wrapper puts them; the content of an
  // open menu or popover is left out by the roving-focus module.
  const items = 'button, a[href], [role="button"]';

  // Overflow: a horizontal toolbar never wraps. When its items do not fit, those that do not, taken from the end, are
  // hidden and offered in a Menu at the end of the line; a Menu or Popover trigger never moves (its panel needs it on
  // the line). A unit is a direct child of the toolbar (a Button, an IconButton, a Tooltip's wrapper, a Menu or
  // Popover trigger, a separator); overlay panels and the overflow itself are not units.
  interface Moved {
    index: number;
    label: string;
    icon: string;
    disabled: boolean;
    danger: boolean;
  }
  let moved = $state<Moved[]>([]);
  let overflowShown = $state(false);
  let units: HTMLElement[] = [];
  const controlOf = (unit: HTMLElement) =>
    unit.matches('button, a[href]') ? unit : unit.querySelector<HTMLElement>('button, a[href]');
  const isSeparator = (unit: HTMLElement) => unit.classList.contains('ggb-toolbar__separator');
  const movable = (unit: HTMLElement) => {
    const control = controlOf(unit);
    return !!control && !control.hasAttribute('popovertarget') && !control.hasAttribute('aria-haspopup');
  };
  const nameOf = (control: HTMLElement) =>
    (
      control.getAttribute('aria-label') ??
      control.querySelector('.ggb-button__name')?.textContent ??
      control.textContent ??
      ''
    ).trim();

  function layout() {
    const root = ref;
    if (!root) return;
    units = [...root.children].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement && !el.hasAttribute('popover') && !el.classList.contains('ggb-toolbar__overflow')
    );
    for (const unit of units) delete unit.dataset.ggbOverflowed;
    overflowShown = false;
    // A local, non-reactive set (the result is published through `moved`).
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const hiddenUnits = new Set<HTMLElement>();
    // The line's extent from the shown units' boxes: scrollWidth would also count the enlarged interaction targets of
    // the buttons, which reach past their boxes.
    // A unit's box is its control's (a Tooltip's wrapper has no box of its own: display contents).
    const overflows = () => {
      const overflowEl = root.querySelector<HTMLElement>(':scope > .ggb-toolbar__overflow');
      const boxes = [...units, ...(overflowEl ? [overflowEl] : [])]
        .map((unit) => (isSeparator(unit) ? unit : (controlOf(unit) ?? unit)))
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => el.getBoundingClientRect());
      if (!boxes.length) return false;
      const extent = Math.max(...boxes.map((b) => b.right)) - Math.min(...boxes.map((b) => b.left));
      return extent > root.clientWidth + 0.5;
    };
    const overflowEl = root.querySelector<HTMLElement>(':scope > .ggb-toolbar__overflow');
    if (overflowEl) overflowEl.hidden = true;
    if (orientation === 'horizontal' && overflows()) {
      overflowShown = true;
      // Shown at once (not at the next render) so that the hiding below counts the trigger's own width.
      if (overflowEl) overflowEl.hidden = false;
      root.dataset.overflowing = '';
      // Room for the overflow trigger, then hide movable units from the end until the line fits.
      for (let i = units.length - 1; i >= 0 && overflows(); i--) {
        const unit = units[i];
        if (isSeparator(unit) || !movable(unit)) continue;
        unit.dataset.ggbOverflowed = '';
        hiddenUnits.add(unit);
      }
      // Separators next to a moved unit, or left at an end of the line, are hidden too.
      const shown = () => units.filter((u) => !u.dataset.ggbOverflowed);
      for (const unit of units) {
        if (!isSeparator(unit)) continue;
        const i = units.indexOf(unit);
        const neighbourMoved = hiddenUnits.has(units[i - 1]) || hiddenUnits.has(units[i + 1]);
        if (neighbourMoved) unit.dataset.ggbOverflowed = '';
      }
      const visible = shown();
      while (visible.length && isSeparator(visible[0])) visible.shift()!.dataset.ggbOverflowed = '';
      while (visible.length && isSeparator(visible.at(-1)!)) visible.pop()!.dataset.ggbOverflowed = '';
    } else delete root.dataset.overflowing;
    moved = units.flatMap((unit, index) => {
      if (!hiddenUnits.has(unit)) return [];
      const control = controlOf(unit)!;
      return [
        {
          index,
          label: nameOf(control),
          icon: control.querySelector('svg')?.outerHTML ?? '',
          disabled: control.matches(':disabled, [aria-disabled="true"]'),
          danger: control.dataset.intent === 'danger'
        }
      ];
    });
  }

  $effect(() => {
    const root = ref;
    void orientation;
    void size;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const run = () => untrack(layout);
    const resize = new ResizeObserver(run);
    resize.observe(root);
    // Units added, removed or changed (a disabled state, a label) re-run the layout.
    const mutations = new MutationObserver((records) => {
      if (records.some((r) => r.target === root || !(r.target as Element).closest?.('.ggb-toolbar__overflow'))) run();
    });
    mutations.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-disabled']
    });
    run();
    return () => {
      resize.disconnect();
      mutations.disconnect();
    };
  });

  function choose(value: string) {
    controlOf(units[Number(value)])?.click();
  }
</script>

<div
  {...rest}
  bind:this={ref}
  class={['ggb-toolbar', className]}
  role="toolbar"
  aria-label={name}
  aria-orientation={orientation}
  data-size={size}
  data-orientation={orientation}
  {@attach rovingFocus({ orientation: () => orientation, items })}
>
  {@render children()}
  <div class="ggb-toolbar__overflow" hidden={!overflowShown}>
    <Menu onselect={choose}>
      {#snippet trigger(props)}
        <IconButton {...props} label={overflowLabel} {size} intent="neutral" appearance="ghost">
          {#snippet icon()}
            <!-- Phosphor Icons 2.1.1 (MIT), dots-three, regular weight. -->
            <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
              ><path
                d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128Zm56-12a12,12,0,1,0,12,12A12,12,0,0,0,196,116ZM60,116a12,12,0,1,0,12,12A12,12,0,0,0,60,116Z"
              /></svg
            >
          {/snippet}
        </IconButton>
      {/snippet}
      {#each moved as entry (entry.index)}
        {#if entry.icon}
          <MenuItem
            label={entry.label}
            value={String(entry.index)}
            disabled={entry.disabled}
            intent={entry.danger ? 'danger' : 'neutral'}
          >
            {#snippet leading()}
              <!-- The item's own icon, copied from the toolbar's DOM (markup the components rendered). -->
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html entry.icon}
            {/snippet}
          </MenuItem>
        {:else}
          <!-- No leading slot without an icon: the menu aligns labels only when an item has one. -->
          <MenuItem
            label={entry.label}
            value={String(entry.index)}
            disabled={entry.disabled}
            intent={entry.danger ? 'danger' : 'neutral'}
          />
        {/if}
      {/each}
    </Menu>
  </div>
</div>
