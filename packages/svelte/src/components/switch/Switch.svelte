<script lang="ts">
  import { Switch as Primitive } from 'bits-ui';
  import type { SwitchProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './switch.css';

  let {
    checked = $bindable(defaults.checked),
    label,
    hideLabel = defaults.hideLabel,
    description,
    labelPosition = defaults.labelPosition,
    size = defaults.size,
    disabled = defaults.disabled,
    readonly = defaults.readonly,
    oncheckedchange,
    ref = $bindable(null),
    class: className,
    id,
    'aria-describedby': describedBy,
    ...rest
  }: SwitchProps = $props();

  const uid = $props.id();
  const base = $derived(id ?? `ggb-switch-${uid}`);
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Switch requires a non-empty label.');
    return label;
  });
  const hasDescription = $derived(typeof description === 'string' && description.trim() !== '');
  const isReadonly = $derived(readonly && !disabled);
  const describedByIds = $derived(
    [hasDescription && `${base}-description`, describedBy].filter(Boolean).join(' ') || undefined
  );

  // Bits UI has no readonly switch: a readonly switch cancels activation before the primitive toggles (its handlers
  // run after these and stop on a prevented event). Enter and Space are both cancelled, like a press.
  type Handler<E extends Event> = (event: E) => void;
  const handlers = $derived(rest as { onclick?: Handler<MouseEvent>; onkeydown?: Handler<KeyboardEvent> });
  function handleClick(event: MouseEvent) {
    if (isReadonly) return event.preventDefault();
    handlers.onclick?.(event);
  }
  function handleKeydown(event: KeyboardEvent) {
    if (isReadonly && (event.key === 'Enter' || event.key === ' ')) return event.preventDefault();
    handlers.onkeydown?.(event);
  }
</script>

{#snippet text()}
  <span class="ggb-switch__text">
    <span class="ggb-switch__label" id={`${base}-label`}>{name}</span>
    {#if hasDescription}
      <span class="ggb-switch__description" id={`${base}-description`}>{description}</span>
    {/if}
  </span>
{/snippet}

<label
  class={['ggb-switch', className]}
  data-size={size}
  data-label-position={labelPosition}
  data-selection={checked ? 'on' : 'off'}
  data-hide-label={hideLabel ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  data-readonly={isReadonly ? '' : undefined}
>
  {#if labelPosition === 'start'}{@render text()}{/if}
  <Primitive.Root
    {...rest}
    bind:checked
    bind:ref
    id={base}
    class="ggb-switch__track"
    {disabled}
    aria-labelledby={`${base}-label`}
    aria-describedby={describedByIds}
    aria-readonly={isReadonly ? 'true' : undefined}
    onclick={handleClick}
    onkeydown={handleKeydown}
    onCheckedChange={(value) => oncheckedchange?.(value)}
  >
    <Primitive.Thumb class="ggb-switch__thumb" />
  </Primitive.Root>
  {#if labelPosition !== 'start'}{@render text()}{/if}
</label>
