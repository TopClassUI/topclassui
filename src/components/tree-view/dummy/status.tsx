import { TreeView } from '../index.js'

/** loading: the tree is busy and says Loading until its first nodes arrive. empty: it says there is nothing. Both
 * texts sit under the tree, in a status line, since a tree holds tree items only. */
export default function Demo() {
  return (
    <div className="grid gap-3">
      <TreeView aria-label="Files, loading" status="loading" items={[]} />
      <TreeView aria-label="Files, empty" status="empty" items={[]} />
    </div>
  )
}
