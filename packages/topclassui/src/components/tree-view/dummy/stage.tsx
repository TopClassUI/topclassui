import { fileText } from '#icons/data/file-text.js'
import { folder } from '#icons/data/folder.js'
import { folderOpen } from '#icons/data/folder-open.js'
import { Svg } from '#components/svg/index.js'
import { TreeView } from '../index.js'

const OPEN = <Svg icon={folderOpen} size="0.875rem" />
const CLOSED = <Svg icon={folder} size="0.875rem" />
const FILE = <Svg icon={fileText} size="0.875rem" />

const ITEMS = [
  {
    id: 'components', label: 'components', icon: OPEN, children: [
      {
        id: 'button', label: 'button', icon: OPEN, children: [
          { id: 'index', label: 'index.tsx', icon: FILE },
          { id: 'variants', label: 'variants.ts', icon: FILE },
        ],
      },
      { id: 'input', label: 'input', icon: CLOSED, children: [{ id: 'input-index', label: 'index.tsx', icon: FILE }] },
    ],
  },
]

/** The docs card's stage as the frame draws it: 300 px, components and button open, index.tsx selected, input closed. */
export default function Demo() {
  return <TreeView aria-label="Files" className="w-75" items={ITEMS} defaultExpanded={['components', 'button']} defaultValue="index" />
}
