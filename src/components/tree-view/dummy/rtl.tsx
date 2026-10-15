import { fileText } from '#icons/data/file-text.js'
import { folder } from '#icons/data/folder.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Svg } from '#components/svg/index.js'
import { TreeView } from '../index.js'

const FOLDER = <Svg icon={folder} size="0.875rem" />
const FILE = <Svg icon={fileText} size="0.875rem" />

const ITEMS = [
  {
    id: 'docs', label: 'المستندات', icon: FOLDER, children: [
      { id: 'report', label: 'التقرير السنوي.pdf', icon: FILE },
      { id: 'budget', label: 'الميزانية.xlsx', icon: FILE },
    ],
  },
  { id: 'photos', label: 'الصور', icon: FOLDER, children: [{ id: 'trip', label: 'رحلة العقبة.jpg', icon: FILE }] },
  { id: 'notes', label: 'ملاحظات.txt', icon: FILE },
]

/** Arabic, inside TopClassProvider as the root layout would mount it: the indent is on the right, the closed caret
 * points left, and ArrowLeft opens a branch. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <TreeView aria-label="الملفات" items={ITEMS} defaultValue="report" defaultExpanded={['docs']} />
      </div>
    </TopClassProvider>
  )
}
