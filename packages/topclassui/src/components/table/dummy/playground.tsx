import { Table, type TableDesignProps } from '../index.js'

interface Region { name: string; q1: string; q2: string; q3: string; q4: string; total: string }

const regions: Region[] = [
  { name: 'Middle East', q1: '$412,000', q2: '$455,300', q3: '$498,120', q4: '$530,900', total: '$1,896,320' },
  { name: 'North Africa', q1: '$208,400', q2: '$214,950', q3: '$240,010', q4: '$262,700', total: '$926,060' },
  { name: 'Western Europe', q1: '$890,150', q2: '$874,600', q3: '$910,480', q4: '$955,230', total: '$3,630,460' },
  { name: 'North America', q1: '$1,204,800', q2: '$1,260,340', q3: '$1,315,900', q4: '$1,402,650', total: '$5,183,690' },
]

/** The docs card's stage: the Try it controls pass the schema's props, the rows stay as they are. */
export default function Demo(props: TableDesignProps) {
  return (
    <Table
      {...props}
      caption="Quarterly revenue by region"
      items={regions}
      getKey={(region) => region.name}
      columns={[
        { key: 'name', header: 'Region', rowHeader: true, cell: (region) => region.name },
        { key: 'q1', header: 'Q1', align: 'end', cell: (region) => region.q1 },
        { key: 'q2', header: 'Q2', align: 'end', cell: (region) => region.q2 },
        { key: 'q3', header: 'Q3', align: 'end', cell: (region) => region.q3 },
        { key: 'q4', header: 'Q4', align: 'end', cell: (region) => region.q4 },
        { key: 'total', header: 'Full year', align: 'end', cell: (region) => region.total },
      ]}
    />
  )
}
