import { fileText } from '#icons/data/file-text.js'
import { folder } from '#icons/data/folder.js'
import { Svg } from '#components/svg/index.js'
import { TreeView } from '../index.js'

const FOLDER = <Svg icon={folder} size="0.875rem" />
const FILE = <Svg icon={fileText} size="0.875rem" />

/** The drawn tree: two folders open. Each icon is an element, which crosses from a server page as it is. */
const ITEMS = [
  {
    id: 'src', label: 'src', icon: FOLDER, children: [
      {
        id: 'app', label: 'app', icon: FOLDER, children: [
          { id: 'layout', label: 'layout.tsx', icon: FILE },
          { id: 'page', label: 'page.tsx', icon: FILE },
        ],
      },
      { id: 'components', label: 'components', icon: FOLDER, children: [{ id: 'button', label: 'button.tsx', icon: FILE }] },
      { id: 'lib', label: 'lib', icon: FOLDER, children: [] },
    ],
  },
  { id: 'package', label: 'package.json', icon: FILE },
  { id: 'readme', label: 'README.md', icon: FILE },
]

export default function Demo() {
  return <TreeView aria-label="Files" items={ITEMS} defaultExpanded={['src', 'app']} />
}
