<script lang="ts">
  // Field playground: the control it wraps, its condition, the description and the required marker.
  import { Checkbox, CheckboxGroup, Field, InputText, Radio, RadioGroup, Textarea } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let control = $state('InputText');
  let condition = $state('default');
  let description = $state('on');
  let required = $state('on');
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Control',
        options: ['InputText', 'Textarea', 'RadioGroup', 'CheckboxGroup', 'Checkbox'],
        value: control,
        onchange: (v) => (control = v)
      }
    ],
    topEnd: [
      {
        label: 'Condition',
        options: ['default', 'invalid', 'disabled'],
        value: condition,
        onchange: (v) => (condition = v)
      }
    ],
    bottomStart: [
      { label: 'Description', options: ['on', 'off'], value: description, onchange: (v) => (description = v) }
    ],
    bottomEnd: [{ label: 'Required', options: ['on', 'off'], value: required, onchange: (v) => (required = v) }]
  }}
>
  <div style="inline-size: min(22rem, 100%)">
    <Field
      label={control === 'Checkbox' ? 'Terms' : control === 'InputText' ? 'Email' : 'Delivery'}
      description={description === 'on' ? 'We use it for the receipt only.' : undefined}
      required={required === 'on'}
      invalid={condition === 'invalid'}
      disabled={condition === 'disabled'}
      message="Complete this field to continue."
    >
      {#if control === 'InputText'}
        <InputText type="email" placeholder="name@example.com" />
      {:else if control === 'Textarea'}
        <Textarea rows={3} />
      {:else if control === 'RadioGroup'}
        <RadioGroup value="standard">
          <Radio value="standard" label="Standard" />
          <Radio value="express" label="Express" />
        </RadioGroup>
      {:else if control === 'CheckboxGroup'}
        <CheckboxGroup value={['mon']}>
          <Checkbox value="mon" label="Monday" />
          <Checkbox value="tue" label="Tuesday" />
        </CheckboxGroup>
      {:else}
        <Checkbox label="I accept the terms of sale" />
      {/if}
    </Field>
  </div>
</PlaygroundFrame>
