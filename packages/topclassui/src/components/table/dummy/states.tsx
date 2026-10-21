import { Table, TableSkeleton, type TableColumn } from '../index.js'

interface Row { id: string; name: string }

const rows: Row[] = [
  { id: 'row-1', name: 'Row 1' },
  { id: 'row-2', name: 'Row 2' },
  { id: 'row-3', name: 'Row 3' },
]

const nothing: Row[] = []

const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortHref: '?sort=name', cell: (row) => row.name },
]

const key = (row: Row) => row.id

/** The frame's strip, one small compact table a state: idle, a row under the pointer, sorted, a row selected, empty and
 * loading. The caption, the stripes and the stuck column have demos of their own. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div role="group" aria-label="idle">
        <Table density="compact" className="w-32" caption="Rows" items={rows} getKey={key} columns={columns} />
      </div>
      <div role="group" aria-label="hover row">
        <Table density="compact" className="w-32" caption="Rows, point at one" items={rows} getKey={key} columns={columns} />
      </div>
      <div role="group" aria-label="sorted">
        <Table
          density="compact"
          className="w-32"
          sort={{ key: 'name', direction: 'ascending' }}
          caption="Rows, A to Z"
          items={rows}
          getKey={key}
          columns={columns}
        />
      </div>
      <div role="group" aria-label="selected">
        <Table density="compact" className="w-32" selectedKeys={['row-2']} caption="Rows, one selected" items={rows} getKey={key} columns={columns} />
      </div>
      <div role="group" aria-label="empty">
        <Table density="compact" className="w-32" caption="Rows, none yet" items={nothing} getKey={key} columns={columns} />
      </div>
      <div role="group" aria-label="loading">
        <TableSkeleton density="compact" className="w-32" rows={3} columns={1} />
      </div>
    </div>
  )
}
