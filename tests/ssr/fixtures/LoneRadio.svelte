<script lang="ts">
  // SSR fixture: a Radio outside any RadioGroup, which must be rejected.
  import Radio from '../../../packages/svelte/src/components/radio/Radio.svelte';
</script>

<Radio value="a" label="A" />
