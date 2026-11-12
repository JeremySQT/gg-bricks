<script lang="ts">
  // Pagination playground: size, the maximum number of siblings and the first and last buttons, on 24 pages of
  // results with the page bound.
  import { Pagination } from '@ggbrick/svelte';
  import type { PaginationSize } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  const pageCount = 24;
  let page = $state(1);
  let size = $state<PaginationSize>('md');
  let siblingCount = $state(1);
  let showEdges = $state(false);
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Siblings',
        options: ['0', '1', '2'],
        value: String(siblingCount),
        onchange: (v) => (siblingCount = Number(v))
      }
    ],
    topEnd: [
      {
        label: 'Show edges',
        options: ['false', 'true'],
        value: String(showEdges),
        onchange: (v) => (showEdges = v === 'true')
      }
    ],
    bottomEnd: [
      { label: 'Size', options: ['sm', 'md', 'lg'], value: size, onchange: (v) => (size = v as PaginationSize) }
    ]
  }}
>
  <Pagination bind:page {pageCount} {siblingCount} {showEdges} {size} />
  <p>Page {page} of {pageCount}</p>
</PlaygroundFrame>
