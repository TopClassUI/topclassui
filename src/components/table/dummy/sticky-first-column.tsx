import { Table, type TableColumn } from '../index.js'

interface Region { name: string; q1: string; q2: string; q3: string; q4: string; total: string }

const regions: Region[] = [
  { name: 'Middle East', q1: '$412,000', q2: '$455,300', q3: '$498,120', q4: '$530,900', total: '$1,896,320' },
  { name: 'North Africa', q1: '$208,400', q2: '$214,950', q3: '$240,010', q4: '$262,700', total: '$926,060' },
  { name: 'Western Europe', q1: '$890,150', q2: '$874,600', q3: '$910,480', q4: '$955,230', total: '$3,630,460' },
  { name: 'North America', q1: '$1,204,800', q2: '$1,260,340', q3: '$1,315,900', q4: '$1,402,650', total: '$5,183,690' },
]

const nowrap = (text: string) => <span className="whitespace-nowrap">{text}</span>

const columns: TableColumn<Region>[] = [
  { key: 'name', header: 'Region', cell: (region) => nowrap(region.name) },
  { key: 'q1', header: 'Q1', align: 'end', cell: (region) => region.q1 },
  { key: 'q2', header: 'Q2', align: 'end', cell: (region) => region.q2 },
  { key: 'q3', header: 'Q3', align: 'end', cell: (region) => region.q3 },
  { key: 'q4', header: 'Q4', align: 'end', cell: (region) => region.q4 },
  { key: 'total', header: nowrap('Full year'), align: 'end', cell: (region) => region.total },
]

/** A box narrower than its table: it scrolls sideways and the region names stay in view, tinted rows included. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-6">
      <Table
        stickyFirstColumn
        caption="Revenue by region"
        items={regions}
        getKey={(region) => region.name}
        columns={columns}
      />
      <Table
        stickyFirstColumn
        striped
        caption="Revenue by region, striped"
        items={regions}
        getKey={(region) => region.name}
        columns={columns}
      />
    </div>
  )
}
