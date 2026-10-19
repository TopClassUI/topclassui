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

/** Every look a table has: plain, its caption drawn, striped, sorted, a row selected, the first column stuck in a narrow box,
 * empty and loading. The frame's hover row is the pointer over any of them. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <Table caption="Deploys" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      <Table captionVisible caption="Deploys, caption drawn" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      <Table striped caption="Deploys, striped" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      <Table
        sort={{ key: 'duration', direction: 'descending' }}
        caption="Deploys, slowest first"
        items={deploys}
        getKey={(deploy) => deploy.id}
        columns={columns}
      />
      <Table selectedKeys={['dpl_7f39']} caption="Deploys, one selected" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      <div className="max-w-xs">
        <Table stickyFirstColumn caption="Deploys, first column stuck" items={deploys} getKey={(deploy) => deploy.id} columns={columns} />
      </div>
      <Table caption="Deploys, none yet" items={nothing} getKey={(deploy) => deploy.id} columns={columns} />
      <TableSkeleton rows={3} columns={4} />
    </div>
  )
}
