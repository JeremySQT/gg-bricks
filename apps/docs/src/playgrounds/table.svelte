<script lang="ts">
  // Table playground: density (the table has no size), column lines, the footer and a shown or hidden caption.
  import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHeading, TableCell } from '@ggbrick/svelte';
  import PlaygroundFrame from '../components/PlaygroundFrame.svelte';

  let density = $state('standard');
  let columnLines = $state('off');
  let footer = $state('on');
  let caption = $state('shown');
  const rows = [
    { id: '#3066', customer: 'Olivia Rhye', amount: '1,240.00' },
    { id: '#3065', customer: 'Phoenix Baker', amount: '89.50' },
    { id: '#3064', customer: 'Lana Steiner', amount: '420.00' }
  ];
</script>

<PlaygroundFrame
  corners={{
    topStart: [
      {
        label: 'Density',
        options: ['compact', 'standard', 'comfortable'],
        value: density,
        onchange: (v) => (density = v)
      }
    ],
    topEnd: [{ label: 'Column lines', options: ['off', 'on'], value: columnLines, onchange: (v) => (columnLines = v) }],
    bottomStart: [{ label: 'Caption', options: ['shown', 'hidden'], value: caption, onchange: (v) => (caption = v) }],
    bottomEnd: [{ label: 'Footer', options: ['on', 'off'], value: footer, onchange: (v) => (footer = v) }]
  }}
>
  <Table
    data-ggb-density={density}
    caption="Invoices"
    hideCaption={caption === 'hidden'}
    columnLines={columnLines === 'on'}
  >
    <TableHeader>
      <TableRow>
        <TableHeading>Invoice</TableHeading>
        <TableHeading>Customer</TableHeading>
        <TableHeading align="end">Amount</TableHeading>
      </TableRow>
    </TableHeader>
    <TableBody>
      {#each rows as row (row.id)}
        <TableRow>
          <TableCell rowHeader>{row.id}</TableCell>
          <TableCell>{row.customer}</TableCell>
          <TableCell align="end">{row.amount}</TableCell>
        </TableRow>
      {/each}
    </TableBody>
    {#if footer === 'on'}
      <TableFooter>
        <TableRow>
          <TableCell colspan={2}>Total</TableCell>
          <TableCell align="end">1,749.50</TableCell>
        </TableRow>
      </TableFooter>
    {/if}
  </Table>
</PlaygroundFrame>
