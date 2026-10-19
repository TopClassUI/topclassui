import { Table, TableSkeleton, type TableColumn } from '../index.js'

interface Deploy { id: string; branch: string; author: string; duration: string }

const deploys: Deploy[] = [
  { id: 'dpl_7f3a', branch: 'main', author: 'Layla Haddad', duration: '48 s' },
  { id: 'dpl_7f39', branch: 'fix/checkout-total', author: 'Omar Abed', duration: '51 s' },
  { id: 'dpl_7f38', branch: 'main', author: 'Sara Nasser', duration: '47 s' },
]

const nothing: Deploy[] = []

const columns: TableColumn<Deploy>[] = [
  { key: 'id', header: 'Deploy', rowHeader: true, cell: (deploy) => deploy.id },
  { key: 'branch', header: 'Branch', sortHref: '?sort=branch', cell: (deploy) => deploy.branch },
  { key: 'author', header: 'Author', cell: (deploy) => deploy.author },
  { key: 'duration', header: 'Duration', align: 'end', sortHref: '?sort=duration', cell: (deploy) => deploy.duration },
]

/** The frame's strip, one cell a state: idle, a row under the pointer, sorted, a row selected, empty and loading. The
 * caption, the stripes and the stuck column have demos of their own. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <div role="group" aria-label="idle">
        <Table caption="Deploys" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      </div>
      <div role="group" aria-label="hover row">
        <Table caption="Deploys, point at a row" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      </div>
      <div role="group" aria-label="sorted">
        <Table
          sort={{ key: 'duration', direction: 'descending' }}
          caption="Deploys, slowest first"
          items={deploys}
          getKey={(deploy) => deploy.id}
          columns={columns}
        />
      </div>
      <div role="group" aria-label="selected">
        <Table selectedKeys={['dpl_7f39']} caption="Deploys, one selected" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      </div>
      <div role="group" aria-label="empty">
        <Table caption="Deploys, none yet" items={nothing} getKey={(deploy) => deploy.id} columns={columns} />
      </div>
      <div role="group" aria-label="loading">
        <TableSkeleton rows={3} columns={4} />
      </div>
    </div>
  )
}
