<script lang="ts">
  // SSR fixture: a Table with a header, two body rows (the first cell a row header, an amount aligned at the end) and a
  // footer, or without footer and header.
  import Table from '../../../packages/svelte/src/components/table/Table.svelte';
  import TableHeader from '../../../packages/svelte/src/components/table/TableHeader.svelte';
  import TableBody from '../../../packages/svelte/src/components/table/TableBody.svelte';
  import TableFooter from '../../../packages/svelte/src/components/table/TableFooter.svelte';
  import TableRow from '../../../packages/svelte/src/components/table/TableRow.svelte';
  import TableHeading from '../../../packages/svelte/src/components/table/TableHeading.svelte';
  import TableCell from '../../../packages/svelte/src/components/table/TableCell.svelte';

  let { bare = false, ...table }: Record<string, unknown> = $props();
</script>

<Table caption="Invoices" {...table}>
  {#if !bare}
    <TableHeader>
      <TableRow><TableHeading>Invoice</TableHeading><TableHeading align="end">Amount</TableHeading></TableRow>
    </TableHeader>
  {/if}
  <TableBody>
    <TableRow><TableCell rowHeader>#3066</TableCell><TableCell align="end">1,240.00</TableCell></TableRow>
    <TableRow><TableCell rowHeader>#3065</TableCell><TableCell align="end">89.50</TableCell></TableRow>
  </TableBody>
  {#if !bare}
    <TableFooter>
      <TableRow><TableCell>Total</TableCell><TableCell align="end">1,329.50</TableCell></TableRow>
    </TableFooter>
  {/if}
</Table>
