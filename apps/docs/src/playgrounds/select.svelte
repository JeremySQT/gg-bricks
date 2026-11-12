<script lang="ts">
  // Select playground: size, condition, content (groups, a disabled option) and the leading icon, in a Field.
  import { Field, Icon, Select } from '@ggbrick/svelte';
  import type { SelectOptionsRecord, SelectSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { glyphs } from '../../../../examples/input-text/glyphs.ts';

  const languages: SelectOptionsRecord[] = [
    { value: 'de', label: 'Deutsch' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano', disabled: true },
    { value: 'pt', label: 'Português' },
    { value: 'ja', label: '日本語' }
  ];
  const zones: SelectOptionsRecord[] = [
    { value: 'lisbon', label: 'Lisbon (UTC+0)', group: 'Europe' },
    { value: 'london', label: 'London (UTC+0)', group: 'Europe' },
    { value: 'paris', label: 'Paris (UTC+1)', group: 'Europe' },
    { value: 'berlin', label: 'Berlin (UTC+1)', group: 'Europe' },
    { value: 'new-york', label: 'New York (UTC−5)', group: 'Americas' },
    { value: 'chicago', label: 'Chicago (UTC−6)', group: 'Americas' },
    { value: 'sao-paulo', label: 'São Paulo (UTC−3)', group: 'Americas' },
    { value: 'tokyo', label: 'Tokyo (UTC+9)', group: 'Asia' },
    { value: 'singapore', label: 'Singapore (UTC+8)', group: 'Asia' }
  ];

  let size = $state<SelectSize>('md');
  let condition = $state('default');
  let content = $state('languages');
  let icon = $state('none');
  let language = $state('');
  let zone = $state('paris');
</script>

{#snippet globe()}<Icon><path d={glyphs.globe} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [{ label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as SelectSize) }],
    topEnd: [
      {
        label: 'Condition',
        options: ['default', 'readonly', 'invalid', 'disabled'],
        value: condition,
        onchange: (v) => (condition = v)
      }
    ],
    bottomStart: [
      {
        label: 'Options',
        options: ['languages', 'time zones in groups'],
        value: content,
        onchange: (v) => (content = v)
      }
    ],
    bottomEnd: [{ label: 'Leading', options: ['none', 'icon'], value: icon, onchange: (v) => (icon = v) }]
  }}
>
  <div style="inline-size: min(20rem, 100%)">
    {#if content === 'languages'}
      <Field
        label="Language"
        description="Used for emails and the interface."
        invalid={condition === 'invalid'}
        message="Choose a language."
      >
        <Select
          options={languages}
          placeholder="Choose a language"
          bind:value={language}
          {size}
          readonly={condition === 'readonly'}
          disabled={condition === 'disabled'}
          leading={icon === 'icon' ? globe : undefined}
        />
      </Field>
    {:else}
      <Field label="Time zone" invalid={condition === 'invalid'} message="Choose a time zone.">
        <Select
          options={zones}
          bind:value={zone}
          {size}
          readonly={condition === 'readonly'}
          disabled={condition === 'disabled'}
          leading={icon === 'icon' ? globe : undefined}
        />
      </Field>
    {/if}
  </div>
</PlaygroundFrame>
