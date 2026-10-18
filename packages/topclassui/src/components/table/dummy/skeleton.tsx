import { Table, TableSkeleton } from '../index.js'

interface Deploy { id: string; branch: string; author: string; duration: string }

const deploys: Deploy[] = [
  { id: 'dpl_7f3a', branch: 'main', author: 'Layla Haddad', duration: '48 s' },
  { id: 'dpl_7f39', branch: 'fix/checkout-total', author: 'Omar Abed', duration: '51 s' },
  { id: 'dpl_7f38', branch: 'main', author: 'Sara Nasser', duration: '47 s' },
  { id: 'dpl_7f37', branch: 'feat/table', author: 'Omar Abed', duration: '1 min 12 s' },
]

/** The placeholder a Suspense boundary shows, above the table it stands in for: the same box and the same rows. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <TableSkeleton rows={4} columns={4} />
      <Table
        caption="Latest deploys"
        items={deploys}
        getKey={(deploy) => deploy.id}
        columns={[
          { key: 'id', header: 'Deploy', rowHeader: true, cell: (deploy) => deploy.id },
          { key: 'branch', header: 'Branch', cell: (deploy) => deploy.branch },
          { key: 'author', header: 'Author', cell: (deploy) => deploy.author },
          { key: 'duration', header: 'Duration', align: 'end', cell: (deploy) => deploy.duration },
        ]}
      />
    </div>
  )
}
