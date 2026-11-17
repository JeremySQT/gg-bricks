<script lang="ts">
  // Table implementation review: a playground (column lines, caption, footer, empty, height, width), rich cells
  // (Avatar with a name and an email, Badge, Link, row actions in a Menu), numbers aligned at the end, a totals footer,
  // a wide table that scrolls inline, a table of limited height whose header stays, an empty table and right-to-left,
  // in any brand, appearance and density.
  import {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableRow,
    TableHeading,
    TableCell,
    Avatar,
    Badge,
    Link,
    Menu,
    IconButton,
    Icon,
    MenuItem,
    Pagination
  } from '../../packages/svelte/src/index.ts';
  import type { BadgeIntent } from '../../packages/svelte/src/index.ts';
  import { people } from '../avatar/portraits.ts';
  import { glyphs } from '../icon-button/glyphs.ts';

  const brands = ['base', 'brick', 'orchid'];
  const modes = ['light', 'dark'];
  const densities = ['compact', 'standard', 'comfortable'];
  let brand = $state('base');
  let mode = $state('light');
  let density = $state('standard');
  let columnLines = $state(false);
  let hideCaption = $state(false);
  let showFooter = $state(true);
  let empty = $state(false);
  let limitHeight = $state(false);
  let page = $state(1);

  const statuses: [string, BadgeIntent][] = [
    ['Paid', 'success'],
    ['Paid', 'success'],
    ['Refunded', 'neutral'],
    ['Paid', 'success'],
    ['Cancelled', 'danger'],
    ['Pending', 'warning'],
    ['Paid', 'success'],
    ['Paid', 'success'],
    ['Pending', 'warning']
  ];
  const invoices = people.map((p, i) => ({
    id: `#${3066 - i}`,
    date: `Jan ${6 - Math.floor(i / 2)}, 2027`,
    status: statuses[i],
    person: p,
    amount: [1240, 89.5, 420, 12500, 64, 980.25, 310, 7, 2045][i]
  }));
  const money = (n: number) => '€' + n.toLocaleString('en-US', { minimumFractionDigits: 2 });
  const sum = invoices.reduce((t, r) => t + r.amount, 0);
</script>

{#snippet more()}<Icon><path d={glyphs['dots-three']} /></Icon>{/snippet}
{#snippet actions(id: string)}
  <Menu align="end">
    {#snippet trigger(props)}
      <IconButton
        {...props}
        label={`Actions for invoice ${id}`}
        size="sm"
        appearance="ghost"
        intent="neutral"
        icon={more}
      />
    {/snippet}
    <MenuItem label="View" />
    <MenuItem label="Download PDF" />
    <MenuItem label="Delete" intent="danger" />
  </Menu>
{/snippet}

<div class="page" data-ggb-brand={brand} data-ggb-appearance={mode} data-ggb-density={density}>
  <header>
    <p class="eyebrow">ggbrick · implementation review</p>
    <h1>Table</h1>
    <p class="lede">
      A native data table: caption, header, body and footer, in a light frame with a light gray header band and light
      lines. Cells hold free content. Wider than its space it scrolls inline in its own area (a focus stop named by the
      caption); with a limited height the header stays. Not interactive itself.
    </p>
    <div class="controls" role="group" aria-label="Context">
      <label
        >Brand <select id="ctx-brand" bind:value={brand}
          >{#each brands as b (b)}<option value={b}>{b}</option>{/each}</select
        ></label
      >
      <label
        >Mode <select id="ctx-mode" bind:value={mode}
          >{#each modes as m (m)}<option value={m}>{m}</option>{/each}</select
        ></label
      >
      <label
        >Density <select id="ctx-density" bind:value={density}
          >{#each densities as d (d)}<option value={d}>{d}</option>{/each}</select
        ></label
      >
    </div>
  </header>

  <section id="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">Playground</h2>
    <div class="playground-stack">
      <fieldset class="options inline">
        <legend>Options</legend>
        <label class="check"><input id="opt-lines" type="checkbox" bind:checked={columnLines} /> Column lines</label>
        <label class="check"><input id="opt-hide" type="checkbox" bind:checked={hideCaption} /> Hide caption</label>
        <label class="check"><input id="opt-footer" type="checkbox" bind:checked={showFooter} /> Footer</label>
        <label class="check"><input id="opt-empty" type="checkbox" bind:checked={empty} /> Empty</label>
        <label class="check"><input id="opt-height" type="checkbox" bind:checked={limitHeight} /> Limited height</label>
      </fieldset>
      <Table id="play" caption="Invoices" {columnLines} {hideCaption} class={limitHeight ? 'limited' : undefined}>
        <TableHeader>
          <TableRow>
            <TableHeading>Invoice</TableHeading>
            <TableHeading>Date</TableHeading>
            <TableHeading>Status</TableHeading>
            <TableHeading>Customer</TableHeading>
            <TableHeading align="end">Amount</TableHeading>
            <TableHeading><span class="hidden">Actions</span></TableHeading>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#if empty}
            <TableRow
              ><TableCell colspan={6} align="center"><span class="empty">No invoices yet</span></TableCell></TableRow
            >
          {:else}
            {#each invoices as r (r.id)}
              <TableRow>
                <TableCell rowHeader><Link href={`#${r.id}`} label={r.id} /></TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell><Badge size="sm" intent={r.status[1]} label={r.status[0]} /></TableCell>
                <TableCell>
                  <span class="person">
                    <Avatar name={r.person.name} src={r.person.src} size="sm" decorative />
                    <span class="who"
                      ><span class="who-name">{r.person.name}</span><span class="who-mail">{r.person.email}</span></span
                    >
                  </span>
                </TableCell>
                <TableCell align="end">{money(r.amount)}</TableCell>
                <TableCell align="end">{@render actions(r.id)}</TableCell>
              </TableRow>
            {/each}
          {/if}
        </TableBody>
        {#if showFooter && !empty}
          <TableFooter>
            <TableRow>
              <TableCell colspan={4}>Total</TableCell>
              <TableCell align="end">{money(sum)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        {/if}
      </Table>
      <div class="pager"><Pagination bind:page pageCount={12} size="sm" /></div>
    </div>
  </section>

  <section id="densities" aria-labelledby="densities-title">
    <h2 id="densities-title">Densities</h2>
    <p>
      The table has no size of its own: rows follow the density of the interface (32, 40 and 44 px in compact, standard
      and comfortable); the text stays 14 px.
    </p>
    <div class="grid">
      {#each ['compact', 'standard', 'comfortable'] as const as d (d)}
        <div data-ggb-density={d}>
          <Table id={`density-${d}`} data-testid="matrix" caption={d}>
            <TableHeader>
              <TableRow
                ><TableHeading>Company</TableHeading><TableHeading>Domain</TableHeading><TableHeading align="end"
                  >Seats</TableHeading
                ></TableRow
              >
            </TableHeader>
            <TableBody>
              {#each [['Johnson & Johnson', 'jnj.com', 120], ['Adidas', 'adidas.com', 48], ['Nike', 'nike.com', 7]] as [c, d, n] (c)}
                <TableRow
                  ><TableCell rowHeader>{c}</TableCell><TableCell>{d}</TableCell><TableCell align="end">{n}</TableCell
                  ></TableRow
                >
              {/each}
            </TableBody>
          </Table>
        </div>
      {/each}
    </div>
  </section>

  <section id="scroll" aria-labelledby="scroll-title">
    <h2 id="scroll-title">Overflow</h2>
    <div class="grid two">
      <div>
        <p>Wider than its column: scrolls inline; the scroll area becomes a focus stop named by the caption.</p>
        <div class="narrow">
          <Table id="wide" caption="Orders" columnLines>
            <TableHeader>
              <TableRow>
                {#each ['Order', 'Customer', 'Product', 'Quantity', 'Warehouse', 'Carrier', 'Status'] as h (h)}<TableHeading
                    >{h}</TableHeading
                  >{/each}
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each [1, 2, 3, 4] as n (n)}
                <TableRow>
                  <TableCell rowHeader>SO-10{n}</TableCell><TableCell>Northwind Traders</TableCell><TableCell
                    >Ergonomic chair</TableCell
                  ><TableCell align="end">{n * 3}</TableCell><TableCell>Lyon</TableCell><TableCell
                    >DHL Express</TableCell
                  ><TableCell>Shipped</TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>
      </div>
      <div>
        <p>Limited height: the header stays at the top of the scroll area.</p>
        <Table id="tall" caption="Activity" class="limited">
          <TableHeader
            ><TableRow><TableHeading>Event</TableHeading><TableHeading align="end">Time</TableHeading></TableRow
            ></TableHeader
          >
          <TableBody>
            {#each Array.from({ length: 14 }, (_, i) => i) as i (i)}
              <TableRow
                ><TableCell>Invoice #{3066 - i} paid</TableCell><TableCell align="end"
                  >{9 + Math.floor(i / 2)}:{i % 2 ? '30' : '05'}</TableCell
                ></TableRow
              >
            {/each}
          </TableBody>
        </Table>
      </div>
    </div>
  </section>

  <section id="rtl" aria-labelledby="rtl-title">
    <h2 id="rtl-title">Right to left</h2>
    <div dir="rtl" lang="ar" class="rtl">
      <Table id="rtl-table" caption="الفواتير" columnLines hideCaption>
        <TableHeader
          ><TableRow
            ><TableHeading>الفاتورة</TableHeading><TableHeading>العميل</TableHeading><TableHeading align="end"
              >المبلغ</TableHeading
            ></TableRow
          ></TableHeader
        >
        <TableBody>
          <TableRow
            ><TableCell rowHeader>#3066</TableCell><TableCell>أوليفيا</TableCell><TableCell align="end">1240</TableCell
            ></TableRow
          >
          <TableRow
            ><TableCell rowHeader>#3065</TableCell><TableCell>فينيكس</TableCell><TableCell align="end">89</TableCell
            ></TableRow
          >
        </TableBody>
      </Table>
    </div>
  </section>
</div>

<style>
  .playground-stack {
    display: flex;
    flex-direction: column;
    gap: var(--ggb-space-layout-sm);
  }
  .options.inline {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .page :global(.limited) {
    max-block-size: 20rem;
  }
  .person {
    display: flex;
    align-items: center;
    gap: var(--ggb-space-content-md);
  }
  .who {
    display: flex;
    flex-direction: column;
  }
  .who-name {
    font: var(--ggb-typography-label-md);
  }
  .who-mail,
  .empty {
    color: var(--ggb-color-content-secondary);
  }
  .hidden {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .pager {
    display: flex;
    justify-content: flex-end;
  }
  .two {
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  }
  .narrow {
    max-inline-size: 30rem;
  }
</style>
