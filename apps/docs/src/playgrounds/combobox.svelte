<script lang="ts">
  // Combobox playground: size, filtering in the browser or by a stand-in server search (filter none), the leading
  // icon and the condition, on a list of countries in a Field.
  import { Combobox, Field, Icon } from '@ggbrick/svelte';
  import type { ComboboxFilter, ComboboxOptionsRecord, ComboboxSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';
  import { glyphs } from '../../../../examples/input-text/glyphs.ts';

  const names = [
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'Colombia',
    "Côte d'Ivoire",
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Iceland',
    'India',
    'Ireland',
    'Italy',
    'Japan',
    'Kenya',
    'Mexico',
    'Morocco',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Peru',
    'Poland',
    'Portugal',
    'Réunion',
    'Senegal',
    'South Africa',
    'Spain',
    'Sweden',
    'Switzerland',
    'Türkiye',
    'United Kingdom',
    'United States',
    'Vietnam'
  ];
  const countries: ComboboxOptionsRecord[] = names.map((label) => ({
    value: label
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z]+/g, '-'),
    label,
    disabled: label === 'Iceland'
  }));

  let size = $state<ComboboxSize>('md');
  let filter = $state<ComboboxFilter>('contains');
  let icon = $state('none');
  let condition = $state('default');
  let value = $state('');

  // Stand-in for a server search (filter none): the first six countries starting with the text, after a delay.
  let results = $state<ComboboxOptionsRecord[]>([]);
  let timer: ReturnType<typeof setTimeout> | undefined;
  function search(text: string) {
    if (filter !== 'none') return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = text.trim().toLowerCase();
      results = q ? countries.filter((c) => c.label.toLowerCase().startsWith(q)).slice(0, 6) : [];
    }, 150);
  }
  // The selected option stays among the results, so that its label can be restored.
  const selected = $derived(countries.find((c) => c.value === value));
  const options = $derived(
    filter === 'contains'
      ? countries
      : selected && !results.some((r) => r.value === value)
        ? [...results, selected]
        : results
  );
</script>

{#snippet leading()}<Icon><path d={glyphs['magnifying-glass']} /></Icon>{/snippet}

<PlaygroundFrame
  corners={{
    topStart: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as ComboboxSize) }
    ],
    topEnd: [
      {
        label: 'Filter',
        options: ['contains', 'none'],
        value: filter,
        onchange: (v) => {
          filter = v as ComboboxFilter;
          results = [];
        }
      }
    ],
    bottomStart: [
      { label: 'Leading', options: ['none', 'magnifying glass'], value: icon, onchange: (v) => (icon = v) }
    ],
    bottomEnd: [
      {
        label: 'Condition',
        options: ['default', 'readonly', 'invalid', 'disabled'],
        value: condition,
        onchange: (v) => (condition = v)
      }
    ]
  }}
>
  <div style="inline-size: min(20rem, 100%)">
    <Field
      label="Country"
      description="Where the company is registered."
      invalid={condition === 'invalid'}
      message="Choose a country from the list."
      disabled={condition === 'disabled'}
    >
      <Combobox
        {options}
        {filter}
        {size}
        placeholder="Search a country"
        emptyLabel={filter === 'none' ? 'No country starts with these letters' : 'No results'}
        readonly={condition === 'readonly'}
        leading={icon === 'none' ? undefined : leading}
        bind:value
        oninputchange={search}
      />
    </Field>
    <p>Value: {value || 'none'}</p>
  </div>
</PlaygroundFrame>
