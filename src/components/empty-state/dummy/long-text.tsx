import { EmptyState } from '../index.js'

const PATH = 'https://example.com/workspaces/finance/reports/2026/quarterly/archive/unfiled'

/** A 200 px column: the URL has no space to break at, so wrap-anywhere breaks it inside the box. */
export default function Demo() {
  return (
    <div className="w-50">
      <EmptyState
        title={`Nothing in ${PATH}`}
        description="Files you move into this folder will show up here, newest first."
      />
    </div>
  )
}
