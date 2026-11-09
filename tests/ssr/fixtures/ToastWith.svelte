<script lang="ts">
  // SSR fixture: a ToastRegion holding the toasts described by `items` (an action label adds an action Button).
  import ToastRegion from '../../../packages/svelte/src/components/toast/ToastRegion.svelte';
  import Toast from '../../../packages/svelte/src/components/toast/Toast.svelte';
  import Button from '../../../packages/svelte/src/components/button/Button.svelte';

  let { items = [], ...region }: { items?: Record<string, unknown>[] } & Record<string, unknown> = $props();
</script>

<ToastRegion {...region}>
  {#each items as item, i (i)}
    {#snippet act()}<Button id={`a${i}`} label={String(item.actionLabel)} size="lg" />{/snippet}
    {@const { actionLabel, ...props } = item}
    <Toast id={`t${i}`} {...props} title={String(item.title)} action={actionLabel ? act : undefined} />
  {/each}
</ToastRegion>
