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

/** One file selected inside an open folder, as the card draws it, beside a closed folder that holds a disabled file. */
export default function Demo() {
  return (
    <div className="grid gap-1">
      <span id="tree-view-selected" className="text-sm font-medium text-body">Project</span>
      <TreeView aria-labelledby="tree-view-selected" items={ITEMS} defaultValue="page" defaultExpanded={['app']} />
    </div>
  )
}
