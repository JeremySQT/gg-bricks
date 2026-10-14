<script lang="ts">
  import { Button } from '@ggbrick/svelte';

  let count = $state(0);
</script>

<Button label="Pressed {count} times" onactivate={() => count++} />
