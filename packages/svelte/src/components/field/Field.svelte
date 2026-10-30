<script lang="ts">
  import { setContext } from 'svelte';
  import type { FieldContext, FieldProps } from './types.js';
  import { defaults } from './contract.generated.js';
  import './tokens.generated.css';
  import './field.css';

  let {
    label,
    description,
    message,
    required = defaults.required,
    invalid = defaults.invalid,
    disabled = defaults.disabled,
    children,
    id,
    class: className,
    ...rest
  }: FieldProps = $props();

  const uid = $props.id();
  const base = $derived(id ?? `ggb-field-${uid}`);
  const name = $derived.by(() => {
    if (typeof label !== 'string' || !label.trim()) throw new Error('Field requires a non-empty label.');
    return label;
  });
  const hasDescription = $derived(typeof description === 'string' && description.trim() !== '');
  const showMessage = $derived(invalid && typeof message === 'string' && message.trim() !== '');
  const ids = $derived({
    control: `${base}-control`,
    label: `${base}-label`,
    description: `${base}-description`,
    message: `${base}-message`
  });

  // A text entry is the label's `for` target (a press on the label focuses it); every control is also named through
  // aria-labelledby. The control registers while it initializes; until then (and on the server, where the label is
  // written before the control) the label targets the default control id.
  let kind = $state<'text' | 'choice'>('text');
  let controlElementId = $state<(() => string) | undefined>();
  const labelFor = $derived(kind === 'text' ? (controlElementId?.() ?? ids.control) : undefined);

  setContext<FieldContext>('ggb:field', {
    get controlId() {
      return ids.control;
    },
    get labelId() {
      return ids.label;
    },
    get describedBy() {
      const list = [hasDescription && ids.description, showMessage && ids.message].filter(Boolean);
      return list.length ? list.join(' ') : undefined;
    },
    get required() {
      return required;
    },
    get invalid() {
      return invalid;
    },
    get disabled() {
      return disabled;
    },
    register(k, id) {
      kind = k;
      controlElementId = id;
    }
  });
</script>

<div
  {...rest}
  id={base}
  class={['ggb-field', className]}
  data-required={required ? '' : undefined}
  data-invalid={invalid ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
>
  <label class="ggb-field__label" id={ids.label} for={labelFor}
    >{name}{#if required}<span class="ggb-field__requiredIndicator" aria-hidden="true">&nbsp;*</span>{/if}</label
  >
  {#if hasDescription}
    <div class="ggb-field__description" id={ids.description}>{description}</div>
  {/if}
  <div class="ggb-field__control">{@render children()}</div>
  {#if showMessage}
    <div class="ggb-field__message" id={ids.message}>
      <!-- Phosphor Icons 2.1.1 (MIT), warning-circle, regular weight: decorative, the text carries the error. -->
      <svg class="ggb-field__messageIcon" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" focusable="false"
        ><path
          d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"
        /></svg
      ><span class="ggb-field__messageText">{message}</span>
    </div>
  {/if}
</div>
