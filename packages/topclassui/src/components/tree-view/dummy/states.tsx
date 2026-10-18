import { TreeView } from '../index.js'

const ITEMS = [
  {
    id: 'app', label: 'app', children: [
      { id: 'layout', label: 'layout.tsx' },
      { id: 'page', label: 'page.tsx' },
    ],
  },
  { id: 'docs', label: 'docs', children: [{ id: 'guide', label: 'guide.md' }, { id: 'faq', label: 'faq.md', disabled: true }] },
  { id: 'config', label: 'next.config.ts' },
]

/** Open and closed branches, a selected row and a disabled one, then the tree busy with its next page, its first, and empty. */
export default function Demo() {
  return (
    <div className="grid gap-3">
      <TreeView aria-label="Project" items={ITEMS} defaultValue="page" defaultExpanded={['app', 'docs']} />
      <TreeView aria-label="Project, loading more" status="loading-more" items={ITEMS} />
      <TreeView aria-label="Project, loading" status="loading" items={[]} />
      <TreeView aria-label="Project, empty" status="empty" items={[]} />
    </div>
  )
}
