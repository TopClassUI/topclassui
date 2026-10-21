import { fileText } from '#icons/data/file-text.js'
import { folder } from '#icons/data/folder.js'
import { Svg } from '#components/svg/index.js'
import { TreeView, type TreeViewDesignProps } from '../index.js'

const FOLDER = <Svg icon={folder} size="0.875rem" />
const FILE = <Svg icon={fileText} size="0.875rem" />

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

/** The docs card's stage: the Try it controls pass the schema's props, the nodes stay as drawn, page.tsx selected. */
export default function Demo(props: TreeViewDesignProps) {
  return <TreeView {...props} aria-label="Files" items={ITEMS} defaultExpanded={['src', 'app']} defaultValue="page" />
}
