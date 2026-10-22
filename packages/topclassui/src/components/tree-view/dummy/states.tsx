import { fileText } from '#icons/data/file-text.js'
import { Svg } from '#components/svg/index.js'
import { TreeView } from '../index.js'

const FILE = <Svg icon={fileText} size="0.875rem" />

/** The strip draws the rows bare on the card, without the tree's raised box. */
const BARE = 'bg-transparent p-0 border-0'

const ITEMS = [
  {
    id: 'src', label: 'src', children: [
      { id: 'file1', label: 'file1', icon: FILE },
      { id: 'file2', label: 'file2', icon: FILE },
    ],
  },
]

/** Every state the strip draws, one cell each, captioned by its name: collapsed, expanded, selected, focus-visible
 * (the ring shows once Tab reaches the tree), loading and empty. */
export default function Demo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div role="group" aria-label="collapsed">
        <TreeView aria-label="Source, collapsed" className={BARE} items={ITEMS} />
      </div>
      <div role="group" aria-label="expanded">
        <TreeView aria-label="Source, expanded" className={BARE} items={ITEMS} defaultExpanded={['src']} />
      </div>
      <div role="group" aria-label="selected">
        <TreeView aria-label="Source, selected" className={BARE} items={ITEMS} defaultExpanded={['src']} defaultValue="file1" />
      </div>
      <div role="group" aria-label="focus-visible">
        <TreeView aria-label="Source, focus-visible" className={BARE} items={ITEMS} defaultExpanded={['src']} />
      </div>
      <div role="group" aria-label="loading">
        <TreeView aria-label="Source, loading" status="loading" items={[]} />
      </div>
      <div role="group" aria-label="empty">
        <TreeView aria-label="Source, empty" status="empty" items={[]} />
      </div>
    </div>
  )
}
