import { TreeView, TreeViewSkeleton } from '../index.js'
import type { TreeNode } from '../index.js'

const files: TreeNode[] = [
  { id: 'app', label: 'app', children: [
    { id: 'layout', label: 'layout.tsx' },
    { id: 'page', label: 'page.tsx' },
  ] },
  { id: 'components', label: 'components', children: [] },
  { id: 'readme', label: 'README.md' },
]

/** The placeholder a Suspense boundary shows, above the tree it stands in for: the same box and the same five rows. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      <TreeViewSkeleton rows={5} />
      <TreeView aria-label="Files" defaultExpanded={['app']} items={files} />
    </div>
  )
}
